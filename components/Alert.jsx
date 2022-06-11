import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { HiOutlineArrowNarrowRight } from 'react-icons/hi'

import axios from 'axios'

import { setBlackjack, setStyle } from '../redux/reducers/styleSlice'
import { setGame, setPlayer } from '../redux/reducers/playerSlice'

const Alert = () => {
    const playerState = useSelector(state => state.player)
    const styleState = useSelector(state => state.style)

    const dispatch = useDispatch()

    const display = styleState?.style?.alert?.show ? 'flex' : 'none'

    function clicked() {
        dispatch(setStyle({
            ...styleState.style,
            alert: {
                ...styleState.style.alert,
                show: false
            }
        }))

        if (styleState.style.alert.button.action === 'play_again') {
            axios.get(`/api/blackjack?action=play_again&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
                if (res.data?.success && res.data?.game) {
                    dispatch(setGame({
                        ...playerState.game,
                        status: res.data.game?.status,
                        playerCards: res.data.game?.playerCards,
                        dealerCards: res.data.game?.dealerCards,
                        sideBetName: res.data.game?.sideBetName,
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
                                chosenCredits: parseInt(0),
                            }
                        },
                        displays: {
                            ...styleState.blackjack.displays,
                            initialBet: true,
                            hitStand: false,
                        }
                    }))
                }
            });
        }
        else if (styleState.style.alert.button.action === 'continue_from_side_bet') {
            dispatch(setBlackjack({
                ...styleState.blackjack,
                inputControls: {
                    ...styleState.blackjack.inputControls,
                    sideBet: {
                        ...styleState.blackjack.inputControls.sideBet,
                        chosenCredits: parseInt(0),
                    }
                },
            }))
        }
    }

    return (
        <div className="alert" style={{display: display}}>
            <h1>{styleState.style.alert.title}</h1>
            <h3>{styleState.style.alert.subtitle}</h3>
            <button className='primaryButton' onClick={() => clicked()}>{styleState.style.alert.button.text} <HiOutlineArrowNarrowRight style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
        </div>
    )
}

export default Alert