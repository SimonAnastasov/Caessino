import React from 'react'

import { useSelector, useDispatch } from 'react-redux'
import { setStyle } from '../redux/reducers/styleSlice';

import { AiOutlineClose } from 'react-icons/ai';

const Stats = () => {
    const styleState = useSelector(state => state.style);

    const dispatch = useDispatch();

    function close() {
        dispatch(setStyle({
            ...styleState.style,
            displayStatsScreen: false,
        }))
    }

    return (
        <div className="fullscreen fs-centered statsScreen" style={{display: styleState.style.displayStatsScreen ? 'block' : 'none'}}>
            <AiOutlineClose onClick={() => close()} style={{position: 'absolute', top: '20px', right: '20px'}}/>
            <div>
                <h1>Stats:</h1>
                <p>Total money won: <span>${styleState.style.statsScreenInfo.money.earned}</span></p>
                <p>Total blackjack games won: <span>{styleState.style.statsScreenInfo.blackjack.wins}</span></p>
                <p>Total roulette games won: <span>{styleState.style.statsScreenInfo.roulette.wins}</span></p>
                <p>Total poker games won: <span>{styleState.style.statsScreenInfo.poker.wins}</span></p>
            </div>
        </div>
    )
}

export default Stats