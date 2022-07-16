import React from 'react'

import { useRouter } from 'next/router'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setStyle } from '../../redux/reducers/styleSlice'

import Head from 'next/head'

import axios from "axios";

const Activate = (props) => {
    const dispatch = useDispatch();

    const router = useRouter();

    const styleState = useSelector(state => state.style);
    
    const [activated, setActivated] = useState(false);
    
    useEffect(() => {
        // display loading screen
        dispatch(setStyle({
            ...styleState.style,
            displayLoadingScreen: true,
        }));

        const emailActivationId = props.id;

        axios.get(`/api/postgre/activate/${emailActivationId}?action=activate_account`).then(res => {
            if (res.data?.success) {
                setActivated(true);
            }
            
            dispatch(setStyle({
                ...styleState.style,
                displayLoadingScreen: false,
            }));
        });
    }, []);

    function goHome() {
        router.push('/');
    }

    return (
        <>
            <Head>
                <title>Caessino - Activate account</title>
            </Head>

            <div className="fullscreen fs-centered activateScreen">
                { activated ? (
                    <div>
                        <h3>Your account is activated.</h3>
                        <h3>You may now login at Caessino.</h3>
                        <button onClick={() => goHome()} className="primaryButton">Go To The Homepage</button>
                    </div>
                ) : (
                    <div>
                        <h3>Wrong email activation id.</h3>
                        <h3>We were unable to activate your account.</h3>
                        <button onClick={() => goHome()} className="primaryButton">Go To The Homepage</button>
                    </div>
                )}
            </div>
        </>
    )
}

export default Activate

export async function getServerSideProps(context) {
    return {
      props: {
        id: context.query.id
      },
    }
  }