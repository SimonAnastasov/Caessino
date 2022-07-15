import React from 'react'

import Link from 'next/link'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { setPlayer } from '../redux/reducers/playerSlice'
import { setStyle } from '../redux/reducers/styleSlice'

import axios from 'axios';

const Header = () => {
  const dispatch = useDispatch();

  const playerState = useSelector(state => state.player);
  const styleState = useSelector(state => state.style);

  function register() {
    dispatch(setStyle({
      ...styleState.style,
      displayRegisterScreen: true,
      registerScreenInfo: {
        ...styleState.style.registerScreenInfo,
        setFocus: true
      }
    }))
  }

  function login() {
    dispatch(setStyle({
      ...styleState.style,
      displayLoginScreen: true,
      loginScreenInfo: {
        ...styleState.style.loginScreenInfo,
        setFocus: true
      }
    }))
  }

  function logout() {
    axios.get(`/api/postgre?action=logout&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
      if (res.data?.success) {
        localStorage.removeItem('CAESSINO_SESSION_ID');
        dispatch(setPlayer({
          displayName: '',
          username: '',
          session_id: '',
          room_id: '',
          credits: 0,
        }))
      }
    })
  }

  function complain() {
    dispatch(setStyle({
      ...styleState.style,
      displayComplainScreen: true,
    }))
  }

  function showStats() {
    axios.get(`/api/postgre?action=get_stats&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
      if (res.data?.success) {
        dispatch(setStyle({
            ...styleState.style,
            displayStatsScreen: true,
            statsScreenInfo: {
                money: {
                    ...styleState.style.statsScreenInfo.money,
                    earned: res.data.stats.money_earned,
                },
                blackjack: {
                    ...styleState.style.statsScreenInfo.blackjack,
                    wins: res.data.stats.blackjack_won_games,
                },
                roulette: {
                    ...styleState.style.statsScreenInfo.roulette,
                    wins: res.data.stats.roulette_won_games,
                },
                poker: {
                    ...styleState.style.statsScreenInfo.poker,
                    wins: res.data.stats.poker_won_games,
                }                            
            }
        }))
      }
    })
  }

  function manageCredits() {
    dispatch(setStyle({
      ...styleState.style,
      displayManageCreditsScreen: true,
      displayDepositModal: false,
      displayWithdrawModal: false,
    }))
  }

  useEffect(() => {
    if (playerState.player.displayName === '') {
      dispatch(setStyle({
        ...styleState.style,
        displayLoadingScreen: true
      }));

      let success = false;

      if (localStorage?.CAESSINO_SESSION_ID && localStorage.CAESSINO_SESSION_ID.length > 0) {
        axios.get(`/api/postgre?action=check_if_logged_in&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
          if (res.data?.success) {
            success = true;

            dispatch(setPlayer({
              ...playerState.player,
              displayName: res.data?.displayName,
              sesssion_id: res.data?.session_id,
              credits: res.data?.credits,
            }));
          }
        });
      }

      if (!success) {
        dispatch(setPlayer({
          ...playerState.player,
          displayName: 'Guest',
        }))
        dispatch(setStyle({
          ...styleState.style,
          displayLoadingScreen: false,
        }))
      }
    }
  }, [dispatch, playerState.player, styleState.style]);

  return (
    <header className="header">
      <Link href="/" passHref>
        <div className="logo">
          
        </div>
      </Link>
      <nav className='mainHeaderNavigation'>
          <ul>
            {playerState.player.displayName === '' || playerState.player.displayName === 'Guest' ? (
              <>
                <li onClick={() => {register()}}>Register</li>
                <li onClick={() => {login()}}>Login</li>
              </>
            ) : (
              <>
                <li onClick={() => {manageCredits()}}>Manage Credits</li>
                <li onClick={() => {showStats()}}>Statistics</li>
                <li onClick={() => {complain()}}>Complain</li>
                <li onClick={() => {logout()}}>Logout</li>
              </>
            )}
          </ul>
      </nav>
  </header>
  )
}

export default Header