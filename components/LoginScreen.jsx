import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { useRef } from 'react'

import { setPlayer } from '../redux/reducers/playerSlice';
import { setStyle } from '../redux/reducers/styleSlice';

import axios from 'axios';

const LoginScreen = () => {
    const ref = useRef(null);

    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    setTimeout(() => {
        if (styleState.style.displayLoginScreen && styleState.style.loginScreenInfo.setFocus) {
            ref.current.focus();
            dispatch(setStyle({
                ...styleState.style,
                loginScreenInfo: {
                    ...styleState.style.loginScreenInfo,
                    setFocus: false
                }
            }))
        }
    }, 10);

    function onChangeUsername(e) {
        dispatch(setStyle({
            ...styleState.style,
            loginScreenInfo: {
                ...styleState.style.loginScreenInfo,
                username: e.target.value,
            }
        }))
    }

    function onChangePassword(e) {
        dispatch(setStyle({
            ...styleState.style,
            loginScreenInfo: {
                ...styleState.style.loginScreenInfo,
                password: e.target.value,
            }
        }))
    }

    function keyUp(e) {
        if (e.key === 'Enter') {
            login();
        }
    }

    function closeForm() {
        dispatch(setStyle({
            ...styleState.style,
            displayLoginScreen: false,
            loginScreenInfo: {
                username: '',
                password: '',
            },
            inlineAlertText: '',
        }));

    }
    function login() {
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }))

        axios.post(`/api/postgre`, {
            action: 'login',
            username: 'drama',
            password: 'drama'
            // username: styleState.style.loginScreenInfo.username,
            // password: styleState.style.loginScreenInfo.password,
        })
            .then(res => {
                if (res.data?.success) {
                    localStorage.CAESSINO_SESSION_ID = res.data?.session?.id;
                    dispatch(setStyle({
                        ...styleState.style,
                        displayLoginScreen: false,
                    }));

                    dispatch(setPlayer({
                        ...playerState.player,
                        username: res.data?.session?.username,
                        displayName: res.data?.session?.displayName,
                        credits: res.data?.session.credits,
                        session_id: res.data?.session?.id,
                    }));

                    dispatch(setStyle({
                        ...styleState.style,
                        displayLoadingScreen: false,
                        displayLoginScreen: false,
                        loginScreenInfo: {
                            username: '',
                            password: '',
                        },
                        notification: {
                            show: true,
                            text: 'Successfully logged in.',
                            status: 'success',
                        },
                    }));
                }
                else {
                    dispatch(setStyle({
                        ...styleState.style,
                        displayLoginScreen: true,
                        inlineAlertText: res.data?.message,
                    }));
                }
            })
    }

    function checkForLink(e) {
        if (e.target.innerHTML.includes('Register')) {
            dispatch(setStyle({
                ...styleState.style,
                displayRegisterScreen: true,
                displayLoginScreen: false,
                loginScreenInfo: {
                    username: '',
                    password: '',
                },
                inlineAlertText: '',
            }));
        }
    }

    return (
        <div className="fullscreen fs-centered loginScreen" style={{display: styleState.style.displayLoginScreen ? 'block' : 'none'}}>
            <div className="fs-inputs-container">
                {styleState.style.inlineAlertText.length > 0 && <span className="inlineAlert" onClick={(e) => checkForLink(e)}>{styleState.style.inlineAlertText}</span>}
                <div>
                    <span>Username:</span>
                    <input ref={ref} type="text" onChange={(e) => {onChangeUsername(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.style.loginScreenInfo.username} placeholder="your username..."/>
                    <span>Password:</span>
                    <input type="password" onChange={(e) => {onChangePassword(e)}} onKeyUp={(e) => keyUp(e)} value={styleState.style.loginScreenInfo.password} placeholder="your password..."/>
                    <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <button className="primaryButton" onClick={() => closeForm()}>Close Form</button>
                        <button className="secondaryButton" onClick={() => login()}>Log In</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginScreen
