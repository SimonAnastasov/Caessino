import React from 'react'

import Link from 'next/link'

import { useRouter } from 'next/router'

import { AiOutlineArrowLeft } from 'react-icons/ai'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setPlayer, setPokerGame, setSocket } from '../../redux/reducers/playerSlice'
import { setStyle } from '../../redux/reducers/styleSlice'

import axios from 'axios';

const PokerHeader = () => {
    const dispatch = useDispatch();

    const router = useRouter();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    useEffect(() => {
        // display loading screen
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }));

        let interval = null;

        axios.get(`/api/poker?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                if (interval !== null) clearInterval(interval);

                dispatch(setPlayer({
                    ...playerState.player,
                    displayName: res.data?.displayName,
                    session_id: res.data?.session_id,
                    credits: res.data?.credits,
                }));

                dispatch(setStyle({
                    ...styleState.style,
                    displayLoadingScreen: false,
                }))

                interval = setInterval(() => {
                    axios.get(`/api/poker?action=update_state&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(newRes => {
                        if (newRes.data?.success) {
                            dispatch(setPokerGame(newRes.data?.pokerGame))
        
                            if (newRes.data?.pokerGame?.player?.credits !== playerState.player.credits && newRes.data?.pokerGame?.player?.credits > 0) {
                                dispatch(setPlayer({
                                    ...playerState.player,
                                    credits: newRes.data?.pokerGame?.player?.credits,
                                }))
                            }
                        }
                    });
                }, 2000);
            }
            else {
                dispatch(setStyle({
                    ...styleState.style,
                    notification: {
                        show: true,
                        text: 'Please login in order to play poker.',
                        status: 'error',
                    },
                    displayLoadingScreen: false,
                }))

                router.push('/');
            }
        });
    }, [])

    function leaveTable() {
        axios.get(`/api/poker?action=leave_table&session_id=${localStorage.CAESSINO_SESSION_ID}`);
    }

    return (
        <header className="header">
            <div style={{display: 'flex', alignItems: 'center'}}>
                <Link href="/" passHref>
                    <h2>
                        <AiOutlineArrowLeft />
                    </h2>
                </Link>
                { playerState.pokerGame?.player?.table?.length > 0 && <button style={{marginBottom: '4px', marginLeft: '32px', fontSize: '16px'}} className="tertiaryButton" onClick={() => leaveTable()}>Leave Table</button> }
            </div>
            <nav>
                <ul>
                    <li>Hi, {playerState?.player?.displayName}</li>
                    <li>Balance: ${playerState?.player?.credits}</li>
                </ul>
            </nav>
        </header>
    )
}

export default PokerHeader