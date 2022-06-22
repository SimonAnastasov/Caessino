import React from 'react'

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { setRouletteGame } from '../../redux/reducers/playerSlice';

import axios from 'axios';

const Timer = () => {
    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);

    useEffect(() => {
        let interval = setInterval(() => {
            dispatch(setRouletteGame({
                ...playerState.rouletteGame,
                timeToStart: playerState.rouletteGame.timeToStart - 1,
            }))

            if (playerState.rouletteGame.timeToStart == 0) {
                
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [dispatch, playerState.rouletteGame.timeToStart, playerState.rouletteGame]);

    function updateTimer() {
        const timer = playerState.rouletteGame.timeToStart;

        const timeString = (timer < 0 || timer > 90) ? '00:00' : '0' + parseInt(timer/60) + ':' + (timer%60 < 10 ? '0' : '') + (timer%60);

        return timeString;
    }

    return (
        <div className="rouletteTimer">
            <span>{updateTimer()}</span>
        </div>
    )
}

export default Timer