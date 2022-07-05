import React from 'react'

import { useSelector } from 'react-redux'

const Pot = () => {
    const playerState = useSelector(state => state.player);

    return (
        <div className="pokerPotContainer">
            { playerState.pokerGame.table.started && <p>${playerState.pokerGame.table.pot}</p> }
        </div>
    )
}

export default Pot