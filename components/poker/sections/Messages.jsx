import React from 'react'

import { useSelector } from 'react-redux'

const Messages = () => {
    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    let roundMessage = '';
    if (playerState.pokerGame.table.round === 1) {
        roundMessage = ' - Everyone must call $20 before cards are dealt.';
    }

    let turnMessage = '';
    let callMessage = '';
    if (playerState.pokerGame.table.players[playerState.pokerGame.table.turnIdx] !== undefined) {
        turnMessage = `It\'s ${playerState.pokerGame.table.players[playerState.pokerGame.table.turnIdx].displayName}\'s turn.`;

        if (playerState.pokerGame.table.lastBet > 0) {
            callMessage = `${playerState.pokerGame.table.players[playerState.pokerGame.table.turnIdx].displayName} must at least call $${playerState.pokerGame.table.lastBet}`;
        }
    }

    return (
        <div className="pokerMessagesContainer">
            { playerState.pokerGame.table.started && <p>Round {playerState.pokerGame.table.round}/5{roundMessage}</p> }
            { !playerState.pokerGame.table.started && <p>Waiting for coordinator {playerState.pokerGame.table.creator} to start the game.</p> }
            { playerState.pokerGame.table.started && <p>{turnMessage}</p> }
            { playerState.pokerGame.table.started && <p>{callMessage}</p> }
        </div>
    )
}

export default Messages