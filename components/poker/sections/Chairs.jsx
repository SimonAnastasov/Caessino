import React from 'react'

import { useSelector } from 'react-redux'
import FreeflowCard from '../../FreeflowCard';

const Chairs = () => {
  const playerState = useSelector(state => state.player);

  const positions = [
    { x: 16, y: 35 },
    { x: 16, y: 65 },
    { x: 25, y: 85 },
    { x: 40, y: 90 },
    { x: 60, y: 90 },
    { x: 75, y: 85 },
    { x: 84, y: 65 },
    { x: 84, y: 35 },
  ]

  return (
    <div className="pokerChairsContainer">
      {positions.map((pos, i) => {
        let extraClass = '';
        if (i === playerState.pokerGame.table.turnIdx) extraClass = 'onTurn';
        if (playerState.pokerGame.table.players[i] !== undefined && playerState.pokerGame.table.players[i].isFolded) extraClass = 'folded';

        return (
          <div className={`pokerChair ${extraClass}`} style={{left: `${pos.x}vw`, top: `${pos.y}vh`}} key={'chair' + pos.x + pos.y}>
            {playerState.pokerGame.table.players[i] !== undefined && playerState.pokerGame.table.players[i].isSatDown && (
              <div className="pokerPlayerCardsContainer">
                <div>
                  { playerState.pokerGame.table.players[i].cards[0] !== undefined && <FreeflowCard card={playerState.pokerGame.table.players[i].cards[0]}/> }
                  { playerState.pokerGame.table.players[i].cards[1] !== undefined && <FreeflowCard card={playerState.pokerGame.table.players[i].cards[1]}/> }
                </div>
              </div>
            )}

            <div>
              {playerState.pokerGame.table.players[i] !== undefined && playerState.pokerGame.table.players[i].isSatDown && <p>{playerState.pokerGame.table.players[i].displayName}</p>}
              {playerState.pokerGame.table.players[i] !== undefined && playerState.pokerGame.table.players[i].isSatDown && <p>${playerState.pokerGame.table.players[i].betAmount}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Chairs