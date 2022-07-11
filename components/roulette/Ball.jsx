import React from 'react'

import { useSelector } from 'react-redux'

const Ball = () => {
    const playerState = useSelector(state => state.player);

    return (
        <>
            { (playerState.rouletteGame.game.timeToStart > playerState.rouletteGame.game.COUNTDOWN_FROM || playerState.rouletteGame.game.timeToStart <= 0) &&
                <img id="rouletteBall" src="/images/roulette-ball.png" alt="Roulette ball"/>
            }
        </>
    )
}

export default Ball