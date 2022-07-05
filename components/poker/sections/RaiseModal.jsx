import React from 'react'

import { GiTwoCoins } from 'react-icons/gi'
import { AiOutlineClose } from 'react-icons/ai'

import { useSelector, useDispatch } from 'react-redux'

import axios from 'axios';
import { setPoker } from '../../../redux/reducers/styleSlice';

const RaiseModal = () => {
    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    function chooseBet(e) {
        dispatch(setPoker({
            ...styleState.poker,
            inputControls: {
                ...styleState.poker.inputControls,
                raise: {
                    ...styleState.poker.inputControls.bet,
                    chosenCredits: parseInt(e.target.value),
                }
            }
        }));
    }

    function raise() {
        axios.get(`/api/poker?action=game_action&session_id=${localStorage.CAESSINO_SESSION_ID}&specificAction=raise&betAmount=${styleState.poker.inputControls.raise.chosenCredits}`);

        closeModal();
    }

    function closeModal() {
        dispatch(setPoker({
            ...styleState.poker,
            displays: {
                ...styleState.poker.displays,
                raiseModal: false,
            },
        }))
    }

    return (
        <div className="pokerRaiseModal" style={{display: styleState.poker.displays.raiseModal ? 'flex' : 'none'}}>
            <p>Please select the amount you will raise.</p>
            <div>
                <div>
                    <input type="range" className="primarySlider" min={0} max={playerState.player.credits} step={1} value={styleState.poker.inputControls.raise.chosenCredits} onChange={(e) => chooseBet(e)} />
                    <div style={{marginTop: '15px', marginBottom: '-30px'}}>
                        <span>${styleState.poker.inputControls.raise.chosenCredits}</span>
                    </div>
                </div>
                <button style={{marginTop: '50px'}} className="primaryButton" onClick={() => raise()}>Raise <GiTwoCoins style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
                <br/>
                <button style={{position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)'}} className="tertiaryButton" onClick={() => closeModal()}>Cancel <AiOutlineClose style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
            </div>
        </div>
    )
}

export default RaiseModal