import React from 'react'

import Link from 'next/link'

import { useRouter } from 'next/router'

import { AiOutlineArrowLeft } from 'react-icons/ai'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setBlackjackGame, setPlayer } from '../../redux/reducers/playerSlice'
import { setBlackjack, setStyle } from '../../redux/reducers/styleSlice'

import axios from 'axios';

const BlackjackHeader = () => {
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
        axios.get(`/api/blackjack?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                dispatch(setPlayer({
                    ...playerState.player,
                    displayName: res.data?.displayName,
                    session_id: res.data?.session_id,
                    credits: res.data?.credits,
                }))

                dispatch(setBlackjack({
                    ...styleState.blackjack,
                    inputControls: {
                        ...styleState.blackjack.inputControls,
                        initialBet: {
                            ...styleState.blackjack.inputControls.initialBet,
                            chosenCredits: parseInt(playerState.player.credits/2),
                        },
                        sideBet: {
                            ...styleState.blackjack.inputControls.sideBet,
                            chosenCredits: parseInt(playerState.player.credits/2),
                        }
                    },
                }))

                if (interval !== null) clearInterval(interval);
                
                interval = setInterval(() => {
                    axios.get(`/api/blackjack?action=update_state&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(newRes => {
                        if (newRes.data?.success) {
                            console.log(newRes.data);

                            dispatch(setBlackjackGame(newRes.data?.blackjackGame))

                            if (newRes.data?.blackjackGame?.credits !== playerState.player.credits && parseInt(newRes.data?.blackjackGame?.credits) > 0) {
                                dispatch(setPlayer({
                                    ...playerState.player,
                                    displayName: res.data?.displayName,
                                    session_id: res.data?.session_id,
                                    credits: newRes.data?.blackjackGame?.credits,
                                }))
                            }

                            dispatch(setStyle({
                                ...styleState.style,
                                displayLoadingScreen: false,
                                notification: {
                                    ...styleState.style.notification,
                                    show: false,
                                },
                                lostConnectionInfo: {
                                    show: false,
                                    message: ''
                                },
                                alert: (newRes.data?.blackjackGame?.status?.includes('_5_') && !newRes.data?.blackjackGame?.betOutcomeMessageShown) ? {
                                    show: true,
                                    title: newRes.data?.blackjackGame?.messageTitle,
                                    subtitle: newRes.data?.blackjackGame?.messageDescription,
                                    button: {
                                        text: 'Play Again',
                                        action: 'play_again',
                                    }
                                } : (newRes.data?.blackjackGame?.status?.includes('_4_') && !newRes.data?.blackjackGame?.sideBetOutcomeMessageShown && newRes.data?.blackjackGame?.sideBet > 0) ? {
                                    show: true,
                                    title: newRes.data?.blackjackGame?.messageTitle,
                                    subtitle: newRes.data?.blackjackGame?.messageDescription,
                                    button: {
                                        text: 'Continue',
                                        action: 'continue_from_side_bet',
                                    }
                                } : {
                                    ...styleState.style.alert,
                                    show: false,
                                },
                            }))
                        }
                    }).catch(error => {
                        dispatch(setStyle({
                            ...styleState.style,
                            displayLoadingScreen: false,
                            lostConnectionInfo: {
                                show: true,
                                message: 'Game will resume upon reconnection to the server.'
                            }
                        }))
                    });
                }, 1000);
            }
            else {
                dispatch(setStyle({
                    ...styleState.style,
                    notification: {
                        show: true,
                        text: 'Please login in order to play blackjack.',
                        status: 'error',
                    },
                    displayLoadingScreen: false,
                }))

                router.push('/');
            }
        });

        return () => {
            if (interval !== null) clearInterval(interval);
        };
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

export default BlackjackHeader