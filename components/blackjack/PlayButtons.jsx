import React from 'react'

import { GiTwoCoins, GiReturnArrow, GiCardDraw } from 'react-icons/gi'
import { AiFillCheckCircle } from 'react-icons/ai'

import { setGame, setPlayer } from '../../redux/reducers/playerSlice';
import { setBlackjack, setStyle } from '../../redux/reducers/styleSlice';

import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'

import axios from 'axios';

const PlayButtons = () => {
    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    function chooseCoins(e) {
        dispatch(setBlackjack({
            ...styleState.blackjack,
            inputControls: {
                ...styleState.blackjack.inputControls,
                initialBet: {
                    ...styleState.blackjack.inputControls.initialBet,
                    chosenCredits: parseInt(e.target.value),
                }
            }
        }))
    }

    function chooseCoinsSideBet(e) {
        dispatch(setBlackjack({
            ...styleState.blackjack,
            inputControls: {
                ...styleState.blackjack.inputControls,
                sideBet: {
                    ...styleState.blackjack.inputControls.sideBet,
                    chosenCredits: parseInt(e.target.value),
                }
            }
        }));
    }

    function placeInitialBetClicked() {
        axios.get(`/api/postgre?action=take_credits&session_id=${localStorage.CAESSINO_SESSION_ID}&credits=${styleState.blackjack.inputControls.initialBet.chosenCredits}`).then(postgreRes => {
            if (postgreRes.data?.success) {
                axios.get(`/api/blackjack?action=make_initial_bet&session_id=${localStorage.CAESSINO_SESSION_ID}&bet=${styleState.blackjack.inputControls.initialBet.chosenCredits}`).then(res => {
                    if (res.data?.success) {
                        dispatch(setGame({
                            ...playerState.game,
                            status: res.data?.status,
                        }))

                        dispatch(setPlayer({
                            ...playerState.player,
                            credits: postgreRes.data?.credits,
                        }))

                        dispatch(setBlackjack({
                            ...styleState.blackjack,
                            displays: {
                                ...styleState.blackjack.displays,
                                initialBet: false,
                                sideBet: true,
                            }
                        }))
                    }
                });
            }
        });
    }

    function placeSideBetsClicked() {
        dispatch(setBlackjack({
            ...styleState.blackjack,
            displays: {
                ...styleState.blackjack.displays,
                sideBetsModal: true,
                sideBetsChooseCreditsModal: false,
            },
            inputControls: {
                ...styleState.blackjack.inputControls,
                sideBet: {
                    ...styleState.blackjack.inputControls.sideBet,
                    chosenCredits: parseInt(playerState.player.credits/2),
                }
            }
        }))
    }

    function splitTexts(text) {
        let chooseCreditsText = ''
        let paysText = ''

        let allowCopy = true;
        let copyToPaysText = false;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === '<') {
                allowCopy = false;
            }

            if (allowCopy) {
                if (text.length - 1 - i >= 4 && text.substring(i, i + 4) === 'Pays') {
                    copyToPaysText = true;
                }

                if (!copyToPaysText) {
                    chooseCreditsText += text[i];
                }
                else {
                    paysText += text[i];
                }
            }
            
            if (text[i] === '>') {
                allowCopy = true;
            }
        }

        return {
            chooseCreditsText,
            paysText,
        }
    }

    function selectedSideBet(e, sideBetName) {
        const texts = splitTexts(e.target.innerHTML);

        dispatch(setGame({
            ...playerState.game,
            sideBetName: sideBetName
        }))

        dispatch(setBlackjack({
            ...styleState.blackjack,
            displays: {
                ...styleState.blackjack.displays,
                sideBetsModal: false,
                sideBetsChooseCreditsModal: true,
            },
            texts: {
                ...styleState.blackjack.texts,
                sideBetsChooseCreditsText: texts.chooseCreditsText,
                sideBetsPaysText: texts.paysText,
            }
        }))
    }

    function placeSideBetClicked() {
        axios.get(`/api/postgre?action=take_credits&session_id=${localStorage.CAESSINO_SESSION_ID}&credits=${styleState.blackjack.inputControls.sideBet.chosenCredits}`).then(postgreRes => {
            if (postgreRes.data?.success) {
                axios.get(`/api/blackjack?action=make_side_bet&session_id=${localStorage.CAESSINO_SESSION_ID}&bet=${styleState.blackjack.inputControls.sideBet.chosenCredits}&betName=${playerState.game.sideBetName}`).then(res => {
                    if (res.data?.success) {
                        dispatch(setGame({
                            ...playerState.game,
                            status: res.data?.status,
                        }))

                        dispatch(setPlayer({
                            ...playerState.player,
                            credits: postgreRes.data?.credits,
                        }))

                        dispatch(setBlackjack({
                            ...styleState.blackjack,
                            displays: {
                                ...styleState.blackjack.displays,
                                sideBetsChooseCreditsModal: false,
                                sideBet: false,
                                hitStand: true,
                            }
                        }))

                        getCards();
                    }
                });
            }
        });
    }

    function skipSideBetsClicked() {
        axios.get(`/api/blackjack?action=make_side_bet&session_id=${localStorage.CAESSINO_SESSION_ID}&bet=0&betName=none&skip=true`).then(res => {
            if (res.data?.success) {
                dispatch(setBlackjack({
                    ...styleState.blackjack,
                    displays: {
                        ...styleState.blackjack.displays,
                        sideBetsModal: false,
                        sideBetsChooseCreditsModal: false,
                        sideBet: false,
                        hitStand: true,
                    },
                    inputControls: {
                        ...styleState.blackjack.inputControls,
                        sideBet: {
                            ...styleState.blackjack.inputControls.sideBet,
                            chosenCredits: 0,
                        }
                    },
                }))

                getCards();
            }
        });
    }

    function getCards() {
        axios.get(`/api/blackjack?action=get_initial_cards&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                dispatch(setGame({
                    ...playerState.game,
                    status: res.data?.status,
                    playerCards: res.data?.playerCards,
                    dealerCards: res.data?.dealerCards,
                }))

                if (res.data?.sideBetOutcome !== '') {
                    if (res.data.sideBetOutcome === 'side_bet_won') {
                        dispatch(setGame({
                            ...playerState.game,
                            credits: res.data?.credits,
                        }))
                        
                        dispatch(setStyle({
                            ...styleState.style,
                            alert: {
                                show: true,
                                title: 'You won the side bet!',
                                subtitle: `You won $${res.data?.sideBetEarnings}`,
                                button: {
                                    text: 'Continue',
                                    action: 'continue_from_side_bet',
                                }
                            }
                        }))
                    }
                    else if (res.data.sideBetOutcome === 'side_bet_lost') {
                        dispatch(setStyle({
                            ...styleState.style,
                            alert: {
                                show: true,
                                title: 'You lost the side bet!',
                                subtitle: `You lost $${-1*res.data?.sideBetEarnings}`,
                                button: {
                                    text: 'Continue',
                                    action: 'continue_from_side_bet',
                                }
                            }
                        }))
                    }
                }
            }
        });
    }

    function hitClicked() {
        axios.get(`/api/blackjack?action=hit_a_card&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                dispatch(setGame({
                    ...playerState.game,
                    status: res.data?.status,
                    playerCards: res.data?.playerCards,
                }))

                if (res.data?.status === '_5_game_over') {
                    if (res.data?.outcome === 'player_busted') {
                        dispatch(setPlayer({
                            ...playerState.player,
                            credits: res.data?.credits,
                        }))

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
                }
            }
        });
    }

    function standClicked() {
        axios.get(`/api/blackjack?action=stand&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
            if (res.data?.success) {
                dispatch(setGame({
                    ...playerState.game,
                    status: res.data?.status,
                    playerCards: res.data?.playerCards,
                    dealerCards: res.data?.dealerCards,
                }))

                if (res.data?.status.toString().substr(1, 1) === '5') { // game_over
                    dispatch(setPlayer({
                        ...playerState.player,
                        credits: res.data?.credits,
                    }))
                    
                    if (res.data?.outcome === 'dealer_busted') {
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
            }
        });
    }

    return (
        <div className="blackjackButtons">
            <div className="blackjackInitialBet" style={{display: styleState.blackjack.displays.initialBet ? 'flex' : 'none'}}>
                <div>
                    <input type="range" className="primarySlider" min={0} max={playerState.player.credits} step={1} value={styleState.blackjack.inputControls.initialBet.chosenCredits} onChange={(e) => chooseCoins(e)} />
                    <div style={{marginTop: '15px', marginBottom: '-30px'}}>
                        <span>${styleState.blackjack.inputControls.initialBet.chosenCredits}</span>
                    </div>
                </div>
                <button className="primaryButton" onClick={() => placeInitialBetClicked()}>Place Initial Bet <GiTwoCoins style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
            </div>
            <div className="blackjackSideBet" style={{display: styleState.blackjack.displays.sideBet ? 'flex' : 'none'}}>
                <button className="primaryButton" onClick={() => placeSideBetsClicked()}>Place Side Bets <GiTwoCoins style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
                <button className="primaryButton" onClick={() => skipSideBetsClicked()}>Skip <GiReturnArrow style={{marginTop: '3px', marginBottom: '-3px', transform: 'rotateZ(-15deg)'}} /></button>
            </div>
            <div className="blackjackHitStand" style={{display: styleState.blackjack.displays.hitStand ? 'flex' : 'none'}}>
                <button className="primaryButton" onClick={() => hitClicked()}>Hit <GiCardDraw style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
                <button className="primaryButton" onClick={() => standClicked()}>Stand <AiFillCheckCircle style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
            </div>

            <div className="blackjackSideBetsModal" style={{display: styleState.blackjack.displays.sideBetsModal ? 'flex' : 'none'}}>
                <div className="blackjackSideBetSelect">
                    <h1>Perfect Pairs</h1>
                    <div>
                        <p onClick={(e) => selectedSideBet(e, 'mixed_pair')}>Mixed pair (two of the same value but different suit and colour)<br/><span>Pays 5:1</span></p>
                        <p onClick={(e) => selectedSideBet(e, 'coloured_pair')}>Coloured pair (two of the same value and the same colour)<br/><span>Pays 12:1</span></p>
                        <p onClick={(e) => selectedSideBet(e, 'perfect_pair')}>Perfect pair (two of the same card)<br/><span>Pays 25:1</span></p>
                    </div>
                </div>
                <div className="blackjackSideBetSelect">
                    <h1>21+3</h1>
                    <div>
                        <p onClick={(e) => selectedSideBet(e, 'flush')}>Flush (all cards are suited)<br/><span>Pays 5:1</span></p>
                        <p onClick={(e) => selectedSideBet(e, 'straight')}>Straight (all cards consecutive)<br/><span>Pays 10:1</span></p>
                        <p onClick={(e) => selectedSideBet(e, 'three_of_a_kind')}>Three of a kind (not the same suit)<br/><span>Pays 30:1</span></p>
                        <p onClick={(e) => selectedSideBet(e, 'straight_flush')}>Straight flush (consecutive cards same suit)<br/><span>Pays 40:1</span></p>
                        <p onClick={(e) => selectedSideBet(e, 'suited_triple')}>Suited triple (three of the same card)<br/><span>Pays 100:1</span></p>
                    </div>
                </div>
            </div>

            <div className="blackjackSideBetsChooseCreditsModal" style={{display: styleState.blackjack.displays.sideBetsChooseCreditsModal ? 'flex' : 'none'}}>
                <p>{styleState.blackjack.texts.sideBetsChooseCreditsText}<br/><span>{styleState.blackjack.texts.sideBetsPaysText}</span></p>
                <div>
                    <div>
                        <input type="range" className="primarySlider" min={0} max={playerState.player.credits} step={1} value={styleState.blackjack.inputControls.sideBet.chosenCredits} onChange={(e) => chooseCoinsSideBet(e)} />
                        <div style={{marginTop: '15px', marginBottom: '-30px'}}>
                            <span>${styleState.blackjack.inputControls.sideBet.chosenCredits}</span>
                        </div>
                    </div>
                    <button style={{marginTop: '40px'}} className="primaryButton" onClick={() => placeSideBetClicked()}>Place Side Bet <GiTwoCoins style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
                </div>
            </div>
        </div>
    )
}

export default PlayButtons