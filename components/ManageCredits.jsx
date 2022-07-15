import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { setStyle } from '../redux/reducers/styleSlice';

import { AiOutlineClose } from 'react-icons/ai';
import { setPlayer } from '../redux/reducers/playerSlice';

import axios from 'axios';

const ManageCredits = () => {
    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    const dispatch = useDispatch();

    function close(action = '') {
        dispatch(setStyle({
            ...styleState.style,
            displayManageCreditsScreen: false,
            displayDepositModal: false,
            displayWithdrawModal: false,
            depositModalInputs: {
                name: '',
                card: '',
                expire: '',
                ccv: '',
                amount: '',
            },
            displayWithdrawModal: false,
            withdrawModalInputs: {
                citibank: '',
                iban: '',
                bic: '',
                beneficiary: '',
                address: '',
                amount: '',
            },
            inlineAlertText: '',
            notification: action === 'deposit' ? {
                show: true,
                text: `Deposited $${styleState.style.depositModalInputs.amount} successfully`,
                status: 'success',
            } : action === 'withdraw' ? {
                show: true,
                text: `Withdrawed $${styleState.style.withdrawModalInputs.amount} successfully`,
                status: 'success',
            } : {
                show: false,
                text: '',
                status: ''
            },
        }))
    }

    
    function openDepositModal() {
        dispatch(setStyle({
            ...styleState.style,
            displayDepositModal: true,
            displayWithdrawModal: false,
            inlineAlertText: '',
        }))
    }

    function openWithdrawModal() {
        dispatch(setStyle({
            ...styleState.style,
            displayDepositModal: false,
            displayWithdrawModal: true,
            inlineAlertText: '',
        }))
    }

    function buyCredits() {
        axios.post(`/api/postgre`, {
            action: 'deposit',
            session_id: localStorage.CAESSINO_SESSION_ID,
            data: styleState.style.depositModalInputs
        })
            .then(res => {
                if (res.data?.success) {
                    dispatch(setPlayer({
                        ...playerState.player,
                        credits: res.data.credits,
                    }))

                    close('deposit');
                }
                else {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayManageCreditsScreen: true,
                        inlineAlertText: res.data?.message,
                    }));
                }
            })
    }

    function sellCredits() {
        axios.post(`/api/postgre`, {
            action: 'withdraw',
            session_id: localStorage.CAESSINO_SESSION_ID,
            data: styleState.style.withdrawModalInputs
        })
            .then(res => {
                if (res.data?.success) {
                    dispatch(setPlayer({
                        ...playerState.player,
                        credits: res.data.credits,
                    }))

                    close('withdraw');
                }
                else {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayManageCreditsScreen: true,
                        inlineAlertText: res.data?.message,
                    }));
                }
            })
    }

    return (
        <div className="fullscreen fs-centered manageCreditsScreen" style={{display: styleState.style.displayManageCreditsScreen ? 'block' : 'none'}}>
            <AiOutlineClose onClick={() => close()} style={{position: 'absolute', top: '20px', right: '20px'}}/>
            <div>
                <div>
                    <h2>Manage (In-Game) Credits:</h2>
                    <p>You currently have: ${playerState.player.credits}</p>
                </div>
                <div className="main">
                    <div>
                        { styleState.style.displayDepositModal && styleState.style.inlineAlertText.length > 0 && <span className="inlineAlert">{styleState.style.inlineAlertText}</span>}
                        { !styleState.style.displayDepositModal && <button className="primaryButton" onClick={() => openDepositModal()}>Deposit From Credit Card<br/><span>Buy (In-Game) Credits</span></button> }
                        { styleState.style.displayDepositModal && (
                            <div className="fs-inputs-container">
                                <div>
                                    <label>Name and Surname</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeDeposit(e, 'name')}} value={styleState.style.depositModalInputs.name} placeholder="John Doe"/>
                                    <label>Card Number</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeDeposit(e, 'card')}} value={styleState.style.depositModalInputs.card} placeholder="2333 9298 9821 1111"/>
                                    <label>Expire Date</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeDeposit(e, 'expire')}} value={styleState.style.depositModalInputs.expire} placeholder="07/24"/>
                                    <label>CCV</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeDeposit(e, 'ccv')}} value={styleState.style.depositModalInputs.ccv} placeholder="337"/>
                                    <label><span>Amount</span></label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeDeposit(e, 'amount')}} value={styleState.style.depositModalInputs.amount} placeholder="500"/>
                                    <button className="primaryButton" onClick={() => buyCredits()}>Deposit</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        { styleState.style.displayWithdrawModal && styleState.style.inlineAlertText.length > 0 && <span className="inlineAlert">{styleState.style.inlineAlertText}</span>}
                        { !styleState.style.displayWithdrawModal && <button className="primaryButton" onClick={() => openWithdrawModal()}>Withdraw To Personal Account<br/><span>Sell (In-Game) Credits</span></button> }
                        { styleState.style.displayWithdrawModal && (
                            <div className="fs-inputs-container">
                                <div>
                                    <label>Bank name</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeWithdraw(e, 'citibank')}} value={styleState.style.withdrawModalInputs.citibank} placeholder="Swedbank"/>
                                    <label>IBAN</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeWithdraw(e, 'iban')}} value={styleState.style.withdrawModalInputs.iban} placeholder="SE45 5000 0000 0583 9825 7466"/>
                                    <label>BIC</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeWithdraw(e, 'bic')}} value={styleState.style.withdrawModalInputs.bic} placeholder="SWEDSESSXXX"/>
                                    <label>Beneficiary Name</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeWithdraw(e, 'beneficiary')}} value={styleState.style.withdrawModalInputs.beneficiary} placeholder="John Doe"/>
                                    <label>Bank Address</label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeWithdraw(e, 'address')}} value={styleState.style.withdrawModalInputs.address} placeholder="Landsvägen 40, Sundbyberg"/>
                                    <label><span>Amount</span></label>
                                    <input type="text" className="primaryInput" onChange={(e) => {onChangeWithdraw(e, 'amount')}} value={styleState.style.withdrawModalInputs.amount} placeholder="500"/>
                                    <button className="primaryButton" onClick={() => sellCredits()}>Withdraw</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    function onChangeDeposit(e, what) {
        dispatch(setStyle({
            ...styleState.style,
            depositModalInputs: {
                name: what === 'name' ? e.target.value : styleState.style.depositModalInputs.name,
                card: what === 'card' ? e.target.value : styleState.style.depositModalInputs.card,
                expire: what === 'expire' ? e.target.value : styleState.style.depositModalInputs.expire,
                ccv: what === 'ccv' ? e.target.value : styleState.style.depositModalInputs.ccv,
                amount: what === 'amount' ? e.target.value : styleState.style.depositModalInputs.amount,
            }
        }))
    }

    function onChangeWithdraw(e, what) {
        dispatch(setStyle({
            ...styleState.style,
            withdrawModalInputs: {
                citibank: what === 'citibank' ? e.target.value : styleState.style.depositModalInputs.citibank,
                iban: what === 'iban' ? e.target.value : styleState.style.depositModalInputs.iban,
                bic: what === 'bic' ? e.target.value : styleState.style.depositModalInputs.bic,
                beneficiary: what === 'beneficiary' ? e.target.value : styleState.style.depositModalInputs.beneficiary,
                address: what === 'address' ? e.target.value : styleState.style.depositModalInputs.address,
                amount: what === 'amount' ? e.target.value : styleState.style.depositModalInputs.amount,
            }
        }))
    }
}

export default ManageCredits