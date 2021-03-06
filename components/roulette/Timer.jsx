import React from 'react'

import { useSelector } from 'react-redux'

const Timer = () => {
    const playerState = useSelector(state => state.player);

    function getTimer() {
        const timer = playerState.rouletteGame.game.timeToStart;

        const timeString = (timer < 0 || timer > playerState.rouletteGame.game.COUNTDOWN_FROM - 2) ? '00:00' : '0' + parseInt(timer/60) + ':' + (timer%60 < 10 ? '0' : '') + (timer%60);

        return timeString;
    }

    return (
        <div className="rouletteTimer">
            {playerState.rouletteGame.game.timeToStart > 0 && playerState.rouletteGame.game.timeToStart <= playerState.rouletteGame.game.COUNTDOWN_FROM - 2 && <span style={{fontSize: '1rem'}}>Wheel will spin in:</span>}
            
            <span>{getTimer()}</span>

            {playerState.rouletteGame.game.timeToStart > 10 && playerState.rouletteGame.game.timeToStart <= playerState.rouletteGame.game.COUNTDOWN_FROM - 2 && <span style={{fontSize: '1rem'}}>Make your bets.</span>}

            {playerState.rouletteGame.game.timeToStart <= 10 && <span style={{fontSize: '1rem'}}>Betting time is over.</span>}

            {playerState.rouletteGame.game.timeToStart > playerState.rouletteGame.game.COUNTDOWN_FROM && <span style={{fontSize: '1rem'}}>Time to see who won :)</span>}
            {playerState.rouletteGame.game.timeToStart > playerState.rouletteGame.game.COUNTDOWN_FROM && <span style={{fontSize: '.7rem'}}>(And prepare, you can bet again soon.)</span>}
        </div>
    )
}

export default Timer