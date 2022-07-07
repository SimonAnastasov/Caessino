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

        if (parseInt(playerState.pokerGame.table.lastBet) > 0) {
            callMessage = `${playerState.pokerGame.table.players[playerState.pokerGame.table.turnIdx].displayName} must at least call $${Math.min(playerState.player.credits, playerState.pokerGame.table.lastBet)}`;
        }
    }

    return (
        <div className="pokerMessagesContainer">
            { playerState.pokerGame.table.ended && playerState.pokerGame.table.onlyOnePlayerLeft && <p>Game over - {playerState.pokerGame.table.winners[0]?.displayName} won ${playerState.pokerGame.table.winners[0]?.wonAmount} because everyone else folded! Congratulations.</p> }
            { playerState.pokerGame.table.ended && !playerState.pokerGame.table.onlyOnePlayerLeft && playerState.pokerGame.table.winners.length === 1 && <p>Game over - {playerState.pokerGame.table.winners[0]?.displayName} won ${playerState.pokerGame.table.winners[0]?.wonAmount} with a {playerState.pokerGame.table.winners[0]?.hand?.hand} combination! Congratulations.</p> }
            { playerState.pokerGame.table.ended && playerState.pokerGame.table.winners.length > 1 && <p>Game over - {playerState.pokerGame.table.winners.map(e=>e.displayName).join(", ")} drew!</p> }
            { playerState.pokerGame.table.ended && <p>New game will start soon.</p> }

            { playerState.pokerGame.table.started && !playerState.pokerGame.table.ended && <p>Round {playerState.pokerGame.table.round}/4{roundMessage}</p> }
            { !playerState.pokerGame.table.started && !playerState.pokerGame.table.ended && <p>Waiting for coordinator {playerState.pokerGame.table.creator} to start the game.</p> }
            { playerState.pokerGame.table.started && !playerState.pokerGame.table.ended && <p>{turnMessage}</p> }
            { playerState.pokerGame.table.started && !playerState.pokerGame.table.ended && <p>{callMessage}</p> }
        </div>
    )
}

export default Messages