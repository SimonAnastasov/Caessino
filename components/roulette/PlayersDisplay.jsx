import React from 'react'

import { useSelector } from 'react-redux'

const PlayersDisplay = () => {
    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    // See results.
    if (playerState.rouletteGame.timeToStart > styleState.roulette.COUNTDOWN_FROM) {
        return (
            <div className="roulettePlayersContainer">
                <div>
                    <p>Winners:</p>
                    <hr/>
                    {playerState.rouletteGame?.players.map((player, i) => (
                        player.betAmount > 0 && player.outcome === 'won' ? <p key={player + i}>{player.name} <span style={{color: '#ead24d'}}>[{player.whichBets.toString()}]</span></p> : <span key={player + i}></span>
                    ))}
                </div>
                <div>
                    <p>Losers:</p>
                    <hr/>
                    {playerState.rouletteGame?.players.map((player, i) => (
                        player.betAmount > 0 && player.outcome === 'lost' ? <p key={player + i}>{player.name} <span style={{color: '#ead24d'}}>[{player.whichBets.toString()}]</span></p> : <span key={player + i}></span>
                    ))}
                </div>
            </div>
        )
    }
    // See who betted.
    else {
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
                        player.status.substr(1, 1) === '2' ? <p key={player + i}>{player.name} <span style={{color: '#ead24d'}}>[{player.whichBets.toString()}]</span></p> : <span key={player + i}></span>
                    ))}
                </div>
            </div>
        )
    }
}

export default PlayersDisplay