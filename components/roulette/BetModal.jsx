import React from 'react'

import { GiTwoCoins } from 'react-icons/gi'
import { AiOutlineClose } from 'react-icons/ai'

import { useSelector, useDispatch } from 'react-redux'
import { setRoulette } from '../../redux/reducers/styleSlice';

import axios from 'axios';

const BetModal = () => {
    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    function chooseBet(e) {
        dispatch(setRoulette({
            ...styleState.roulette,
            inputControls: {
                ...styleState.roulette.inputControls,
                bet: {
                    ...styleState.roulette.inputControls.bet,
                    chosenCredits: parseInt(e.target.value),
                }
            }
        }));
    }

    function placeBet() {
        axios.get(`/api/roulette?action=place_bet&session_id=${localStorage.CAESSINO_SESSION_ID}&betAmount=${styleState.roulette.inputControls.bet.chosenCredits}&whichBets=${styleState.roulette.whichBets.toString()}&coinPlacedX=${styleState.roulette.coinPlaced.x}&coinPlacedY=${styleState.roulette.coinPlaced.y}`);

        closeModal();
    }

    function closeModal() {
        dispatch(setRoulette({
            ...styleState.roulette,
            displays: {
                ...styleState.roulette.displays,
                betModal: false,
            },
        }));
    }

    return (
        <div className="rouletteBetModal" style={{display: styleState.roulette.displays.betModal && playerState.rouletteGame.game.timeToStart > 10 && playerState.rouletteGame.game.timeToStart <= playerState.rouletteGame.game.COUNTDOWN_FROM ? 'flex' : 'none'}}>
            <p>You have chosen to bet on: <span>{styleState.roulette.whichBets.map((bet, i) => `${bet} `)}</span><br/>Please select the amount you will bet</p>
            <div>
                <div>
                    <input type="range" className="primarySlider" min={0} max={playerState.player.credits} step={1} value={styleState.roulette.inputControls.bet.chosenCredits} onChange={(e) => chooseBet(e)} />
                    <div style={{marginTop: '15px', marginBottom: '-30px'}}>
                        <span>${styleState.roulette.inputControls.bet.chosenCredits}</span>
                    </div>
                </div>
                <button style={{marginTop: '50px'}} className="primaryButton" onClick={() => placeBet()}>Place Bet <GiTwoCoins style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
                <br/>
                <button style={{position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)'}} className="tertiaryButton" onClick={() => closeModal()}>Cancel <AiOutlineClose style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
            </div>
        </div>
    )
}

export default BetModal