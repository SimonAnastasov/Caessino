import React from 'react'

import { useSelector } from 'react-redux'

const PlayersDisplay = () => {
    const playerState = useSelector(state => state.player);

    return (
        <div className="roulettePlayersContainer">
            <div>
                <p>Online:</p>
                <hr/>
                {playerState.rouletteGame?.players.map((player, i) => (
                    player.status.substr(1, 1) === '1' ? <p key={player + i}>{player.name}</p> : <span key={player + i}></span>
                ))}
            </div>
            <div>
                <p>Betted:</p>
                <hr/>
                {playerState.rouletteGame?.players.map((player, i) => (
                    player.status.substr(1, 1) === '2' ? <p key={player + i}>{player.name} <span style={{color: '#ead24d'}}>[{player.whichBets.toString()}]</span> ${player.betAmount}</p> : <span key={player + i}></span>
                ))}
            </div>
        </div>
  )
}

export default PlayersDisplay