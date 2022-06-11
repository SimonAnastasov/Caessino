import React from 'react'

import Link from 'next/link'

import { useRouter } from 'next/router'

import { AiOutlineArrowLeft } from 'react-icons/ai'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setGame, setPlayer } from '../../redux/reducers/playerSlice'
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

        dispatch(setBlackjack({
            ...styleState.blackjack,
            inputControls: {
                ...styleState.blackjack.inputControls,
                initialBet: {
                    ...styleState.blackjack.inputControls.initialBet,
                    chosenCredits: parseInt(playerState.player.credits/2),
                }
            }
        }));

        axios.get(`/api/postgre?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(postgreRes => {
            if (postgreRes.data?.success) {
                dispatch(setPlayer({
                    ...playerState.player,
                    displayName: postgreRes.data?.displayName,
                    session_id: postgreRes.data?.session_id,
                    credits: postgreRes.data?.credits,
                }));

                axios.get(`/api/blackjack?action=get_player_info_on_enter&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
                    if (res.data?.success) {
                        dispatch(setGame({
                            ...playerState.game,
                            status: res.data?.status,
                            playerCards: res.data?.playerCards,
                            dealerCards: res.data?.dealerCards,
                        }))

                        dispatch(setStyle({
                            ...styleState.style,
                            displayLoadingScreen: false,
                        }))

                        if (parseInt(res.data?.status.toString().substr(1, 1)) == 5) {
                            dispatch(setBlackjack({
                                ...styleState.blackjack,
                                inputControls: {
                                    ...styleState.blackjack.inputControls,
                                    initialBet: {
                                        ...styleState.blackjack.inputControls.initialBet,
                                        chosenCredits: parseInt(res.data?.initialBet),
                                    },
                                    sideBet: {
                                        ...styleState.blackjack.inputControls.sideBet,
                                        chosenCredits: 0,
                                    }
                                },
                                displays: {
                                    ...styleState.blackjack.displays,
                                    initialBet: false,
                                    hitStand: true,
                                }
                            }))

                            if (res.data?.outcome === 'player_busted') {
                                dispatch(setStyle({
                                    ...styleState.style,
                                    alert: {
                                        show: true,
                                        title: 'You busted!',
                                        subtitle: `You lost $${-1*res.data?.earnings}`,
                                        button: {
                                            text: 'Play again',
                                            action: 'play_again',
                                        }
                                    }
                                }))
                            }
                            else if (res.data?.outcome === 'dealer_busted') {
                                dispatch(setStyle({
                                    ...styleState.style,
                                    alert: {
                                        show: true,
                                        title: 'Dealer busted!',
                                        subtitle: `You won $${res.data?.earnings}`,
                                        button: {
                                            text: 'Play again',
                                            action: 'play_again',
                                        }
                                    }
                                }))
                            }
                            else if (res.data?.outcome === 'player_won') {
                                dispatch(setStyle({
                                    ...styleState.style,
                                    alert: {
                                        show: true,
                                        title: 'You won!',
                                        subtitle: `You won $${res.data?.earnings}`,
                                        button: {
                                            text: 'Play again',
                                            action: 'play_again',
                                        }
                                    }
                                }))
                            }
                            else if (res.data?.outcome === 'player_lost') {
                                dispatch(setStyle({
                                    ...styleState.style,
                                    alert: {
                                        show: true,
                                        title: 'You lost!',
                                        subtitle: `You lost $${-1*res.data?.earnings}`,
                                        button: {
                                            text: 'Play again',
                                            action: 'play_again',
                                        }
                                    }
                                }))
                            }
                            else if (res.data?.outcome === 'draw') {
                                dispatch(setStyle({
                                    ...styleState.style,
                                    alert: {
                                        show: true,
                                        title: 'Draw!',
                                        subtitle: `You got your $${res.data?.earnings} back`,
                                        button: {
                                            text: 'Play again',
                                            action: 'play_again',
                                        }
                                    }
                                }))
                            }
                        }

                        if (parseInt(res.data?.status.toString().substr(1, 1)) == 4) {
                            dispatch(setBlackjack({
                                ...styleState.blackjack,
                                inputControls: {
                                    ...styleState.blackjack.inputControls,
                                    initialBet: {
                                        ...styleState.blackjack.inputControls.initialBet,
                                        chosenCredits: parseInt(res.data?.initialBet),
                                    },
                                    sideBet: {
                                        ...styleState.blackjack.inputControls.sideBet,
                                        chosenCredits: 0,
                                    }
                                },
                                displays: {
                                    ...styleState.blackjack.displays,
                                    initialBet: false,
                                    hitStand: true,
                                }
                            }))
                        }

                        if (parseInt(res.data?.status.toString().substr(1, 1)) == 3) {
                            dispatch(setBlackjack({
                                ...styleState.blackjack,
                                inputControls: {
                                    ...styleState.blackjack.inputControls,
                                    initialBet: {
                                        ...styleState.blackjack.inputControls.initialBet,
                                        chosenCredits: parseInt(res.data?.initialBet),
                                    },
                                    sideBet: {
                                        ...styleState.blackjack.inputControls.sideBet,
                                        chosenCredits: parseInt(res.data?.sideBet),
                                    }
                                },
                                displays: {
                                    ...styleState.blackjack.displays,
                                    initialBet: false,
                                    hitStand: true,
                                }
                            }))
                        }

                        if (parseInt(res.data?.status.toString().substr(1, 1)) == 2) {
                            dispatch(setBlackjack({
                                ...styleState.blackjack,
                                inputControls: {
                                    ...styleState.blackjack.inputControls,
                                    initialBet: {
                                        ...styleState.blackjack.inputControls.initialBet,
                                        chosenCredits: parseInt(res.data?.initialBet),
                                    }
                                },
                                displays: {
                                    ...styleState.blackjack.displays,
                                    initialBet: false,
                                    sideBet: true,
                                }
                            }))
                        }

                        if (parseInt(res.data?.status.toString().substr(1, 1)) == 1) {
                            dispatch(setBlackjack({
                                ...styleState.blackjack,
                                inputControls: {
                                    ...styleState.blackjack.inputControls,
                                    initialBet: {
                                        ...styleState.blackjack.inputControls.initialBet,
                                        chosenCredits: parseInt(postgreRes.data?.credits/2),
                                    }
                                },
                            }))
                        }
                    }
                });
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
                    <li>Hi{playerState?.player?.displayName ? `, ${playerState.player.displayName}` : ``}</li>
                    <li>Balance: ${playerState?.player?.credits}</li>
                </ul>
            </nav>
        </header>
    )
}

export default BlackjackHeader