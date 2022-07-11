import React from 'react'

import { useSelector } from 'react-redux';

const CoinOnTable = () => {
    const playerState = useSelector(state => state.player);

    return (
        <>
            {playerState.rouletteGame?.player.coinPlaced.x && playerState.rouletteGame.player.coinPlaced.x !== -1 && <img id="coinOnTable" src="/gold-coin.cur" alt="Gold coin" style={{zIndex: 20, position: 'absolute', left: `${playerState.rouletteGame.player.coinPlaced.x}px`, top: `${playerState.rouletteGame.player.coinPlaced.y}px`, transform: 'translate(-50%, -50%)'}}/>}
        </>
    )
}

export default CoinOnTable