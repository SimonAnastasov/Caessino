import React from 'react'

import { useSelector } from 'react-redux';

const CoinOnTable = () => {
    const styleState = useSelector(state => state.style);

    return (
        <>
            {styleState.roulette.coinPlaced.x !== 0 && <img id="coinOnTable" src="/gold-coin.cur" alt="Gold coin" style={{zIndex: 20, position: 'absolute', left: `${styleState.roulette.coinPlaced.x}px`, top: `${styleState.roulette.coinPlaced.y}px`, transform: 'translate(-50%, -50%)'}}/>}
        </>
    )
}

export default CoinOnTable