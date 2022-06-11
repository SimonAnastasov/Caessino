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

    function close() {
        dispatch(setStyle({
            ...styleState.style,
            displayManageCreditsScreen: false,
        }))
    }

    function buyCredits() {
        axios.get(`/api/postgre/?action=add_credits&session_id=${localStorage.CAESSINO_SESSION_ID}&credits=${500}&dont_update_stats=true`).then(res => {
            if (res.data?.success) {
                dispatch(setPlayer({
                    ...playerState.player,
                    credits: res.data.credits,
                }))
            }
        });
    }

    return (
        <div className="fullscreen fs-centered manageCreditsScreen" style={{display: styleState.style.displayManageCreditsScreen ? 'block' : 'none'}}>
            <AiOutlineClose onClick={() => close()} style={{position: 'absolute', top: '20px', right: '20px'}}/>
            <div>
                <h1>Manage Credits:</h1>
                <p>You currently have: ${playerState.player.credits}</p>
                <div>
                    <button className="primaryButton" onClick={() => buyCredits()}>Buy Credits</button>
                </div>
            </div>
        </div>
    )
}

export default ManageCredits