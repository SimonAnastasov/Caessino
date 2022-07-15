import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { useRef } from 'react'

import { setStyle } from '../redux/reducers/styleSlice';

import axios from 'axios';

const ComplainScreen = () => {
    const ref = useRef(null);

    const dispatch = useDispatch();

    const styleState = useSelector(state => state.style);

    setTimeout(() => {
        if (styleState.style.displayComplainScreen && styleState.style.complainScreenInfo.setFocus) {
            ref.current.focus();
            dispatch(setStyle({
                ...styleState.style,
                complainScreenInfo: {
                    ...styleState.style.complainScreenInfo,
                    setFocus: false
                }
            }))
        }
    }, 10);

    function onChangeDescription(e) {
        dispatch(setStyle({
            ...styleState.style,
            complainScreenInfo: {
                ...styleState.style.complainScreenInfo,
                description: e.target.value,
            }
        }))
    }

    function keyUp(e) {
        if (e.key === 'Enter') {
            complain();
        }
    }

    function closeForm() {
        dispatch(setStyle({
            ...styleState.style,
            displayComplainScreen: false,
            complainScreenInfo: {
                description: '',
            },
            inlineAlertText: '',
        }));

    }
    function complain() {
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }))

        axios.post(`/api/postgre`, {
            action: 'complain',
            session_id: localStorage.CAESSINO_SESSION_ID,
            description: styleState.style.complainScreenInfo.description,
        })
            .then(res => {
                if (res.data?.success) {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayLoadingScreen: false,
                        displayComplainScreen: false,
                        complainScreenInfo: {
                            description: '',
                        },
                        notification: {
                            show: true,
                            text: 'Complain sent successfully',
                            status: 'success',
                        },
                        inlineAlertText: '',
                    }));
                }
                else {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayComplainScreen: true,
                        inlineAlertText: res.data?.message,
                    }));
                }
            })
    }

    return (
        <div className="fullscreen fs-centered complainScreen" style={{display: styleState.style.displayComplainScreen ? 'block' : 'none'}}>
            <div className="fs-inputs-container">
                {styleState.style.inlineAlertText.length > 0 && <span className="inlineAlert">{styleState.style.inlineAlertText}</span>}
                <div>
                    <span>Describe the problem:</span>
                    <textarea ref={ref} type="text" onChange={(e) => {onChangeDescription(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.style.complainScreenInfo.description} placeholder="I have a problem with..."/>
                    <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <button className="primaryButton" onClick={() => closeForm()}>Close Form</button>
                        <button className="secondaryButton" onClick={() => complain()}>Send Complaint</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComplainScreen
