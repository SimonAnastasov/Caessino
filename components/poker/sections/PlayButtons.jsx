import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import axios from 'axios';
import { setPoker } from '../../../redux/reducers/styleSlice';

const PlayButtons = () => {
  const dispatch = useDispatch();

  const playerState = useSelector(state => state.player);
  const styleState = useSelector(state => state.style);

  function sitDown() {
    axios.get(`/api/poker?action=sit_down&session_id=${localStorage.CAESSINO_SESSION_ID}&tableId=${playerState.pokerGame.player.table}`);
  }

  function startGame() {
    axios.get(`/api/poker?action=start_game&session_id=${localStorage.CAESSINO_SESSION_ID}`);
  }

  const checkClass = playerState.pokerGame.table.lastBet === 0 ? 'secondaryButton' : 'tertiaryButton';
  const callClass = playerState.pokerGame.table.lastBet > 0 ? 'secondaryButton' : 'tertiaryButton'
  const raiseClass = playerState.pokerGame.table.round >= 2 ? 'secondaryButton' : 'tertiaryButton';
  const foldClass = 'secondaryButton';

  function check() {
    axios.get(`/api/poker?action=game_action&session_id=${localStorage.CAESSINO_SESSION_ID}&specificAction=check&betAmount=0`);
  }

  function call() {
    axios.get(`/api/poker?action=game_action&session_id=${localStorage.CAESSINO_SESSION_ID}&specificAction=call&betAmount=0`);
  }

  function raise() {
    dispatch(setPoker({
        ...styleState.poker,
        displays: {
            ...styleState.poker.displays,
            raiseModal: true,
        },
    }))
  }

  function fold() {
    axios.get(`/api/poker?action=game_action&session_id=${localStorage.CAESSINO_SESSION_ID}&specificAction=fold&betAmount=0`);
  }

  if (playerState.pokerGame.table.started && playerState.pokerGame.player.isSatDown && parseInt(playerState.pokerGame.table.round) < 5) {
    return (
      <div className="pokerPlayButtonsContainer">
        <button className={checkClass} onClick={() => check()}>Check</button>
        <button className={callClass} onClick={() => call()}>Call</button>
        <button className={raiseClass} onClick={() => raise()}>Raise</button>
        <button className={foldClass} onClick={() => fold()}>Fold</button>
      </div>
    )
  }
  else {
    return (
      <div className="pokerPlayButtonsContainer">
        {!playerState.pokerGame.table.started && playerState.pokerGame.player.isCoordinator && playerState.pokerGame.player.isSatDown && <button className="secondaryButton" onClick={() => startGame()}>Start game</button>}
        {!playerState.pokerGame.table.started && !playerState.pokerGame.player.isSatDown && <button className="secondaryButton" onClick={() => sitDown()}>Take a seat</button>}
      </div>
    )
  }
}

export default PlayButtons