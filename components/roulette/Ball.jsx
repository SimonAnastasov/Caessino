import React from 'react'

import { useSelector } from 'react-redux'

const Ball = () => {
    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    return (
        <>
            { (playerState.rouletteGame.timeToStart > styleState.roulette.COUNTDOWN_FROM || playerState.rouletteGame.timeToStart <= 0) &&
                <img id="rouletteBall" src="/images/roulette-ball.png" alt="Roulette ball"/>
            }
        </>
    )
}

export default Ball