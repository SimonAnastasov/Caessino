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
        function spin_wheel(magicNumber, winningBets) {
            document.getElementById('rouletteWheelImg').classList.add('spin');
    
            setTimeout(() => {
                document.getElementById('rouletteWheelImg').classList.remove('spin');
    
                const extraSpin = ( 5 + numbersOfWheel.indexOf(playerState.rouletteGame.game?.magicNumber) * (360 / 37.0) ) + 'deg';
                document.getElementById('rouletteWheelImg').style.transform = `translate(-50%, -50%) rotateZ(${extraSpin})`;
    
                setTimeout(() => {
                    dispatch(setStyle({
                        ...styleState.style,
                        alert: {
                            show: true,
                            title: `Winning number: ${magicNumber}`,
                            subtitle: `Winning bets: [${winningBets.join(', ')}]`,
                            button: {
                                text: 'Continue',
                                action: '',
                            }
                        }
                    }))
                }, 2000);
            }, 4000);
        }

        // display loading screen
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }));

        let interval = null;

        axios.get(`/api/roulette?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                dispatch(setPlayer({
                    ...playerState.player,
                    displayName: res.data?.displayName,
                    session_id: res.data?.session_id,
                    credits: res.data?.credits,
                }));

                interval = setInterval(() => {
                    axios.get(`/api/roulette?action=update_state&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(newRes => {
                        if (newRes.data?.success) {
                            dispatch(setRouletteGame(newRes.data?.rouletteGame));

                            if (newRes.data?.extraAction === "spin_wheel") {
                                spin_wheel(newRes.data.magicNumber ?? -1, newRes.data.winningBets ?? -1);
                            }

                            if (newRes.data?.rouletteGame?.player?.credits !== playerState.player.credits && newRes.data?.rouletteGame?.player?.credits > 0) {
                                dispatch(setPlayer({
                                    ...playerState.player,
                                    credits: newRes.data?.rouletteGame?.player?.credits,
                                }))
                            }
                        }
                    });
                }, 1000);

                dispatch(setRoulette({
                    ...styleState.roulette,
                    inputControls: {
                        ...styleState.roulette.inputControls,
                        bet: {
                            ...styleState.roulette.inputControls.bet,
                            chosenCredits: parseInt(res.data?.credits/2),
                        }
                    },
                    showCoin: false,
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

// 10 starts from 5deg
const numbersOfWheel = [10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32, 0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5];

export default RouletteHeader