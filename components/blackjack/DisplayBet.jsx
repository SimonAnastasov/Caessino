import React from 'react'

import { useSelector } from 'react-redux';

const DisplayBet = () => {
  const playerState = useSelector(state => state.player);
  const styleState = useSelector(state => state.style);
  let display = parseInt(playerState.blackjackGame.status.substr(1, 1)) >= 2 ? 'block' : 'none';
  let displaySideBet = ( parseInt(playerState.blackjackGame.status.substr(1, 1)) >= 3 && parseInt(playerState.blackjackGame.sideBet) > 0 && !playerState.blackjackGame.sideBetOutcomeMessageShown ) ? 'block' : 'none';

  return (
    <div className="blackjackDisplayBet" style={{display: display}}>
      <span>${playerState.blackjackGame.initialBet}{displaySideBet === 'block' ? ` + $${playerState.blackjackGame.sideBet}` : ''}</span>
    </div>
  )
}

export default DisplayBet