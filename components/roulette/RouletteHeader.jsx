import React from 'react'

import Link from 'next/link'

import { useRouter } from 'next/router'

import { AiOutlineArrowLeft } from 'react-icons/ai'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setRouletteGame, setPlayer } from '../../redux/reducers/playerSlice'
import { setRoulette, setStyle } from '../../redux/reducers/styleSlice'

import axios from 'axios';

const RouletteHeader = () => {
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

        axios.get(`/api/roulette?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                dispatch(setPlayer({
                    ...playerState.player,
                    displayName: res.data?.displayName,
                    session_id: res.data?.session_id,
                    credits: res.data?.credits,
                }));

                dispatch(setRouletteGame(res.data?.game));

                dispatch(setRoulette({
                    ...styleState.roulette,
                    inputControls: {
                        ...styleState.roulette.inputControls,
                        bet: {
                            ...styleState.roulette.inputControls.bet,
                            chosenCredits: parseInt(res.data?.credits/2),
                        }
                    }
                }));

                dispatch(setStyle({
                    ...styleState.style,
                    displayLoadingScreen: false,
                }))


                if (parseInt(res.data?.game.status.toString().substr(1, 1)) == 3) {
                }

                if (parseInt(res.data?.game.status.toString().substr(1, 1)) == 2) {
                }

                if (parseInt(res.data?.game.status.toString().substr(1, 1)) == 1) {
                }
            }
            else {
                dispatch(setStyle({
                    ...styleState.style,
                    notification: {
                        show: true,
                        text: 'Please login in order to play roulette.',
                        status: 'error',
                    },
                    displayLoadingScreen: false,
                }))

                router.push('/');
            }
        });
    }, []);

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

export default RouletteHeader