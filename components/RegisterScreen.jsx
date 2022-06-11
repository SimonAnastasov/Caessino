import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { useRef } from 'react'

import { setStyle } from '../redux/reducers/styleSlice';

import axios from 'axios';

const RegisterScreen = () => {
    const ref = useRef(null);

    const dispatch = useDispatch();

    const styleState = useSelector(state => state.style);

    setTimeout(() => {
        if (styleState.style.displayRegisterScreen && styleState.style.registerScreenInfo.setFocus) {
            ref.current.focus();
            dispatch(setStyle({
                ...styleState.style,
                registerScreenInfo: {
                    ...styleState.style.registerScreenInfo,
                    setFocus: false
                }
            }))
        }
    }, 10);

    function onChangeUsername(e) {
        dispatch(setStyle({
            ...styleState.style,
            registerScreenInfo: {
                ...styleState.style.registerScreenInfo,
                username: e.target.value,
            }
        }))
    }

    function onChangeDisplayName(e) {
        dispatch(setStyle({
            ...styleState.style,
            registerScreenInfo: {
                ...styleState.style.registerScreenInfo,
                displayName: e.target.value,
            }
        }))
    }

    function onChangePassword(e) {
        dispatch(setStyle({
            ...styleState.style,
            registerScreenInfo: {
                ...styleState.style.registerScreenInfo,
                password: e.target.value,
            }
        }))
    }

    function keyUp(e) {
        if (e.key === 'Enter') {
            register();
        }
    }

    function closeForm() {
        dispatch(setStyle({
            ...styleState.style,
            displayRegisterScreen: false,
            registerScreenInfo: {
                username: '',
                displayName: '',
                password: '',
            },
            inlineAlertText: '',
        }));
    }

    function register() {
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }))

        axios.post('/api/postgre', {
            action: 'register',
            username: styleState.style.registerScreenInfo.username,
            displayName: styleState.style.registerScreenInfo.displayName,
            password: styleState.style.registerScreenInfo.password,
        })
            .then(res => {
                if (res.data?.success) {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayRegisterScreen: false,
                    }));

                    dispatch(setStyle({
                        ...styleState.style,
                        displayLoadingScreen: false,
                        displayRegisterScreen: false,
                        displayLoginScreen: true,
                        registerScreenInfo: {
                            username: '',
                            displayName: '',
                            password: '',
                        },
                        notification: {
                            show: true,
                            text: 'Successfully registered! Please Log In now.',
                            status: 'success',
                        },
                        inlineAlertText: '',
                    }));
                }
                else {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayRegisterScreen: true,
                        inlineAlertText: res.data?.message,
                    }));
                }
            })
    }

    return (
        <div className="fullscreen fs-centered registerScreen" style={{display: styleState.style.displayRegisterScreen ? 'block' : 'none'}}>
            <div className="fs-inputs-container">
                {styleState.style.inlineAlertText.length > 0 && <span className="inlineAlert">{styleState.style.inlineAlertText}</span>}
                <div>
                    <span>Username:</span>
                    <input ref={ref} type="text" onChange={(e) => {onChangeUsername(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.style.registerScreenInfo.username} placeholder="your username..."/>
                    <span>Display Name:</span>
                    <input type="text" onChange={(e) => {onChangeDisplayName(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.style.registerScreenInfo.displayName} placeholder="your display name..."/>
                    <span>Password:</span>
                    <input type="password" onChange={(e) => {onChangePassword(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.style.registerScreenInfo.password} placeholder="your password..."/>
                    <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <button className="primaryButton" onClick={() => closeForm()}>Close Form</button>
                        <button className="secondaryButton" onClick={() => register()}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterScreen