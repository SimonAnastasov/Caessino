import React from 'react'

import { useSelector } from 'react-redux';

const DisplayBet = () => {
  const playerState = useSelector(state => state.player);
  const styleState = useSelector(state => state.style);

  let display = parseInt(playerState.game.status.substr(1, 1)) >= 2 ? 'block' : 'none';
  let displaySideBet = ( parseInt(playerState.game.status.substr(1, 1)) >= 3 && parseInt(styleState.blackjack.inputControls.sideBet.chosenCredits) > 0 ) ? 'block' : 'none';

  return (
    <div className="blackjackDisplayBet" style={{display: display}}>
      <span>${styleState.blackjack.inputControls.initialBet.chosenCredits}{displaySideBet === 'block' ? ` + $${styleState.blackjack.inputControls.sideBet.chosenCredits}` : ''}</span>
    </div>
  )
}

export default DisplayBet