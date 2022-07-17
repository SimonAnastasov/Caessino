import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { useRef } from 'react'

import { setAdmin } from '../../redux/reducers/adminSlice';
import { setStyle } from '../../redux/reducers/styleSlice';

import axios from 'axios';

const Login = () => {
    const ref = useRef(null);

    const dispatch = useDispatch();

    const adminState = useSelector(state => state.admin);
    const styleState = useSelector(state => state.style);

    setTimeout(() => {
        if (adminState.admin.displays.setFocus) {
            if (ref !== null && ref.current !== null) {
                ref.current.focus();
            }

            dispatch(setAdmin({
                ...adminState.admin,
                displays: {
                    ...adminState.admin.displays,
                    setFocus: false
                }
            }))
        }
    }, 10);

    function onChangeUsername(e) {
        dispatch(setAdmin({
            ...adminState.admin,
            inputControls: {
                ...adminState.admin.inputControls,
                username: e.target.value,
            }
        }))
    }

    function onChangePassword(e) {
        dispatch(setAdmin({
            ...adminState.admin,
            inputControls: {
                ...adminState.admin.inputControls,
                password: e.target.value,
            }
        }))
    }

    function keyUp(e) {
        if (e.key === 'Enter') {
            login();
        }
    }

    function login() {
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }))

        axios.post(`/api/postgre`, {
            action: 'login_as_admin',
            username: adminState.admin.inputControls.username,
            password: adminState.admin.inputControls.password,
        })
            .then(res => {
                if (res.data?.success) {
                    localStorage.CAESSINO_ADMIN_ID = res.data?.session?.id;

                    dispatch(setAdmin({
                        ...adminState.admin,
                        session_id: res.data?.session?.id,
                        inlineAlertText: '',
                        inputControls: {
                            username: '',
                            password: '',
                        }
                    }))                    
                }
                else {
                    dispatch(setAdmin({
                        ...adminState.admin,
                        inlineAlertText: res.data?.message,
                    }));
                }
                
                dispatch(setStyle({
                    ...styleState.style,
                    displayLoadingScreen: false,
                }))
            })
    }

    return (
        <div className="fullscreen fs-centered admin loginScreen">
            <div className="fs-inputs-container">
                <div>
                    {adminState.admin.inlineAlertText.length > 0 && <span className="inlineAlert">{adminState.admin.inlineAlertText}</span>}
                    <span>Username:</span>
                    <input ref={ref} type="text" onChange={(e) => {onChangeUsername(e)}} onKeyUp={(e) => keyUp(e)} value={adminState.admin.inputControls.username} placeholder="admin"/>
                    <span>Password:</span>
                    <input type="password" onChange={(e) => {onChangePassword(e)}} onKeyUp={(e) => keyUp(e)} value={adminState.admin.inputControls.password} placeholder="****************"/>
                    <div style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <button className="secondaryButton" onClick={() => login()}>Log In as Admin</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
