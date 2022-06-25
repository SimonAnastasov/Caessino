import React from 'react'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { setPlayer, setRouletteGame } from '../../redux/reducers/playerSlice';

import axios from 'axios';
import { setRoulette, setStyle } from '../../redux/reducers/styleSlice';

const Timer = () => {
    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    useEffect(() => {
        let interval = setInterval(() => {
            dispatch(setRouletteGame({
                ...playerState.rouletteGame,
                timeToStart: playerState.rouletteGame.timeToStart - 1,
            }))

            if (playerState.rouletteGame.timeToStart === 0) {
                axios.get(`/api/roulette?action=timer_done&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
                    if (res.data?.success) {
                        document.getElementById('rouletteWheelImg').classList.add('spin');

                        setTimeout(() => {
                            document.getElementById('rouletteWheelImg').classList.remove('spin');

                            const extraSpin = ( 5 + numbersOfWheel.indexOf(res.data?.magicNumber) * (360 / 37.0) ) + 'deg';
                            document.getElementById('rouletteWheelImg').style.transform = `translate(-50%, -50%) rotateZ(${extraSpin})`;

                            setTimeout(() => {
                                dispatch(setStyle({
                                    ...styleState.style,
                                    alert: {
                                        show: true,
                                        title: `Winning number: ${res.data?.magicNumber}`,
                                        subtitle: `Winning bets: [${res.data?.winningBets.join(', ')}]`,
                                        button: {
                                            text: 'Continue',
                                            action: '',
                                        }
                                    }
                                }))
                                
                                dispatch(setPlayer({
                                    ...playerState.player,
                                    credits: res.data?.credits,
                                }))

                                dispatch(setRouletteGame(res.data?.game));
                            }, 600);
                        }, 4000);
                    }
                });
            }
            else if (playerState.rouletteGame.timeToStart === 10) {
                dispatch(setRoulette({
                    ...styleState.roulette,
                    displays: {
                        ...styleState.roulette.displays,
                        betModal: false,
                    }
                }))
            }
            else if (playerState.rouletteGame.timeToStart === styleState.roulette.COUNTDOWN_FROM) {
                axios.get(`/api/roulette?action=reset_game&session_id=${localStorage.CAESSINO_SESSION_ID}`).then(res => {
                    if (res.data?.success) {
                        dispatch(setRouletteGame(res.data?.game));

                        dispatch(setRoulette({
                            ...styleState.roulette,
                            showCoin: false,
                        }))
                    }
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dispatch, playerState.rouletteGame.timeToStart, playerState.rouletteGame]);

    function getTimer() {
        const timer = playerState.rouletteGame.timeToStart;

        const timeString = (timer < 0 || timer > styleState.roulette.COUNTDOWN_FROM - 2) ? '00:00' : '0' + parseInt(timer/60) + ':' + (timer%60 < 10 ? '0' : '') + (timer%60);

        return timeString;
    }

    return (
        <div className="rouletteTimer">
            {playerState.rouletteGame.timeToStart > 0 && playerState.rouletteGame.timeToStart <= styleState.roulette.COUNTDOWN_FROM - 2 && <span style={{fontSize: '1rem'}}>Wheel will spin in:</span>}
            
            <span>{getTimer()}</span>

            {playerState.rouletteGame.timeToStart > 10 && playerState.rouletteGame.timeToStart <= styleState.roulette.COUNTDOWN_FROM - 2 && <span style={{fontSize: '1rem'}}>Make your bets.</span>}

            {playerState.rouletteGame.timeToStart <= 10 && <span style={{fontSize: '1rem'}}>Betting time is over.</span>}

            {playerState.rouletteGame.timeToStart > styleState.roulette.COUNTDOWN_FROM && <span style={{fontSize: '1rem'}}>Time to see who won :)</span>}
            {playerState.rouletteGame.timeToStart > styleState.roulette.COUNTDOWN_FROM && <span style={{fontSize: '.7rem'}}>(And prepare, you can bet again soon.)</span>}
        </div>
    )
}

// 10 starts from 5deg
const numbersOfWheel = [10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32, 0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5];

export default Timer