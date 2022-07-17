import Head from 'next/head'

import React from 'react'
import Complaints from '../../components/admin/Complaints'
import Dashboard from '../../components/admin/Dashboard'
import LiveGames from '../../components/admin/LiveGames'
import Login from '../../components/admin/Login'

import { useSelector } from 'react-redux';
import Loading from '../../components/Loading'

const Admin = () => {
    const adminState = useSelector(state => state.admin);

    return (
        <div>
            <Head>
                <title>Caessino - Admin dashboard</title>
            </Head>


            <Loading/>

            { adminState.admin.session_id === '' ? (
                <Login/>
            ) : (
                <Dashboard/>
            )}

            { adminState.admin.displays.complaintsScreen && <Complaints/> }
            
            { adminState.admin.displays.liveGamesScreen && <LiveGames/> }
        </div>
    )
}

export default Admin