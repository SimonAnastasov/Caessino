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

    useEffect(() => async function() {
        // display loading screen
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }));

        let interval = setInterval(() => {
            axios.get(`/api/poker?action=update_state&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
                if (res.data?.success) {
                    dispatch(setPokerGame(res.data?.pokerGame))
                }
            });
        }, 3000);

        axios.get(`/api/poker?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
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
        
        return () => clearInterval(interval);
    }, [playerState.pokerGame.player.table])

    return (
        <header className="header">
            <Link href="/" passHref>
                <h2>
                    <AiOutlineArrowLeft />
                </h2>
            </Link>
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