import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { HiOutlineArrowNarrowRight } from 'react-icons/hi'

import axios from 'axios'

import { setStyle } from '../redux/reducers/styleSlice'

const Alert = ({ onTop = false }) => {
    const styleState = useSelector(state => state.style)

    const dispatch = useDispatch()

    const display = styleState?.style?.alert?.show ? 'flex' : 'none'

    function clicked() {
        if (styleState.style.alert.button.action === 'play_again') {
            axios.get(`/api/blackjack?action=play_again&session_id=${localStorage.CAESSINO_SESSION_ID}`);
        }
        else if (styleState.style.alert.button.action === 'continue_from_side_bet') {
            axios.get(`/api/blackjack?action=continue_from_side_bet&session_id=${localStorage.CAESSINO_SESSION_ID}`);
        }
        else {
            dispatch(setStyle({
                ...styleState.style,
                alert: {
                    ...styleState.style.alert,
                    show: false
                }
            }))
        }
    }

    return (
        <div className="alert" style={{display: display, top: `${onTop ? '35vh' : '50vh'}`}}>
            <h1>{styleState.style.alert.title}</h1>
            <h3>{styleState.style.alert.subtitle}</h3>
            <button className='primaryButton' onClick={() => clicked()}>{styleState.style.alert.button.text} <HiOutlineArrowNarrowRight style={{marginTop: '3px', marginBottom: '-3px'}} /></button>
        </div>
    )
}

export default Alert