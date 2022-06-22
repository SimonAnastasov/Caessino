import React from 'react'

import { useDispatch, useSelector } from 'react-redux';
import { setRoulette } from '../../redux/reducers/styleSlice';

const BetsImage = () => {
    const dispatch = useDispatch();

    const playerState = useSelector(state => state.player);
    const styleState = useSelector(state => state.style);

    function selectWhichBet(e) {
        const imgRect = document.getElementById('rouletteBetsImg').getBoundingClientRect();
    
        const coinOffset = 16;
    
        const xOffset = e.clientX - imgRect.x + coinOffset;
        const yOffset = e.clientY - imgRect.y + coinOffset;
    
        const MULTIPLIER = 4;
    
        const singleX = imgRect.width / ( 14 * MULTIPLIER );
        const singleY = imgRect.height / ( 4 * MULTIPLIER );
    
        let clicked = getClickedArray(xOffset, singleX, yOffset, singleY);

        if (clicked.length > 0 && playerState.rouletteGame.status.substr(1, 1) === '1') {
          const playerIdx = playerState.rouletteGame.players.map(e=>e.session_id).indexOf(localStorage.CAESSINO_SESSION_ID);
          if (playerIdx !== -1 && playerState.rouletteGame.players[playerIdx].status.substr(1, 1) === '1') {
            openModal(clicked, e);
          }
        }
    }

    function openModal(clicked, e) {
      dispatch(setRoulette({
        ...styleState.roulette,
        whichBets: clicked,
        displays: {
          ...styleState.roulette.displays,
          betModal: true,
        },
        coinPlaced: {
          x: e.clientX + 16,
          y: e.clientY + 16
        }
      }))
    }

    return (
        <>
            <img id="rouletteBetsImg" src="/images/roulette-bets.png" alt="Roulette bets" onClick={(e) => selectWhichBet(e)} style={{zIndex: 10}}/>
        </>
    )
}


function getClickedArray(xOffset, singleX, yOffset, singleY) {
    let clicked = [];
  
    if (xOffset < 4 * singleX) {
      if (yOffset < 3 * 4 * singleY) {
        clicked = ['0']
      }
    }
    else if (xOffset < 7 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['3']
      else if (yOffset < 5 * singleY)     clicked = ['3', '2']
      else if (yOffset < 7 * singleY)     clicked = ['2']
      else if (yOffset < 8 * singleY)     clicked = ['2', '1']
      else if (yOffset < 11 * singleY)    clicked = ['1']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    clicked = ['1-18']
    }
    else if (xOffset < 9 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['3', '6']
      else if (yOffset < 5 * singleY)     clicked = ['3', '2', '6', '5']
      else if (yOffset < 7 * singleY)     clicked = ['2', '5']
      else if (yOffset < 8 * singleY)     clicked = ['2', '1', '5', '4']
      else if (yOffset < 11 * singleY)    clicked = ['1', '4']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    clicked = ['1-18']
    }
    else if (xOffset < 11 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['6']
      else if (yOffset < 5 * singleY)     clicked = ['6', '5']
      else if (yOffset < 7 * singleY)     clicked = ['5']
      else if (yOffset < 8 * singleY)     clicked = ['5', '4']
      else if (yOffset < 11 * singleY)    clicked = ['4']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    clicked = ['1-18']
    }
    else if (xOffset < 13 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['6', '9']
      else if (yOffset < 5 * singleY)     clicked = ['6', '5', '9', '8']
      else if (yOffset < 7 * singleY)     clicked = ['5', '8']
      else if (yOffset < 8 * singleY)     clicked = ['5', '4', '8', '7']
      else if (yOffset < 11 * singleY)    clicked = ['4', '7']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    ;
    }
    else if (xOffset < 15 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['9']
      else if (yOffset < 5 * singleY)     clicked = ['9', '8']
      else if (yOffset < 7 * singleY)     clicked = ['8']
      else if (yOffset < 8 * singleY)     clicked = ['8', '7']
      else if (yOffset < 11 * singleY)    clicked = ['7']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    clicked = ['Even']
    }
    else if (xOffset < 17 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['9', '12']
      else if (yOffset < 5 * singleY)     clicked = ['9', '8', '12', '11']
      else if (yOffset < 7 * singleY)     clicked = ['8', '11']
      else if (yOffset < 8 * singleY)     clicked = ['8', '7', '11', '10']
      else if (yOffset < 11 * singleY)    clicked = ['7', '10']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    clicked = ['Even']
    }
    else if (xOffset < 19 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['12']
      else if (yOffset < 5 * singleY)     clicked = ['12', '11']
      else if (yOffset < 7 * singleY)     clicked = ['11']
      else if (yOffset < 8 * singleY)     clicked = ['11', '10']
      else if (yOffset < 11 * singleY)    clicked = ['10']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['1-12']
      else if (yOffset < 16 * singleY)    clicked = ['Even']
    }
    else if (xOffset < 21 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['12', '15']
      else if (yOffset < 5 * singleY)     clicked = ['12', '11', '15', '14']
      else if (yOffset < 7 * singleY)     clicked = ['11', '14']
      else if (yOffset < 8 * singleY)     clicked = ['11', '10', '14', '13']
      else if (yOffset < 11 * singleY)    clicked = ['10', '13']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    ;
      else if (yOffset < 16 * singleY)    ;
    }
    else if (xOffset < 23 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['15']
      else if (yOffset < 5 * singleY)     clicked = ['15', '14']
      else if (yOffset < 7 * singleY)     clicked = ['14']
      else if (yOffset < 8 * singleY)     clicked = ['14', '13']
      else if (yOffset < 11 * singleY)    clicked = ['13']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    clicked = ['Red']
    }
    else if (xOffset < 25 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['15', '18']
      else if (yOffset < 5 * singleY)     clicked = ['15', '14', '18', '17']
      else if (yOffset < 7 * singleY)     clicked = ['14', '17']
      else if (yOffset < 8 * singleY)     clicked = ['14', '13', '17', '16']
      else if (yOffset < 11 * singleY)    clicked = ['13', '16']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    clicked = ['Red']
    }
    else if (xOffset < 27 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['18']
      else if (yOffset < 5 * singleY)     clicked = ['18', '17']
      else if (yOffset < 7 * singleY)     clicked = ['17']
      else if (yOffset < 8 * singleY)     clicked = ['17', '16']
      else if (yOffset < 11 * singleY)    clicked = ['16']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    clicked = ['Red']
    }
    else if (xOffset < 29 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['18', '21']
      else if (yOffset < 5 * singleY)     clicked = ['18', '17', '21', '20']
      else if (yOffset < 7 * singleY)     clicked = ['17', '20']
      else if (yOffset < 8 * singleY)     clicked = ['17', '16', '20', '19']
      else if (yOffset < 11 * singleY)    clicked = ['16', '19']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    ;
    }
    else if (xOffset < 31 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['21']
      else if (yOffset < 5 * singleY)     clicked = ['21', '20']
      else if (yOffset < 7 * singleY)     clicked = ['20']
      else if (yOffset < 8 * singleY)     clicked = ['20', '19']
      else if (yOffset < 11 * singleY)    clicked = ['19']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    clicked = ['Black']
    }
    else if (xOffset < 33 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['21', '24']
      else if (yOffset < 5 * singleY)     clicked = ['21', '20', '24', '23']
      else if (yOffset < 7 * singleY)     clicked = ['20', '23']
      else if (yOffset < 8 * singleY)     clicked = ['20', '19', '23', '22']
      else if (yOffset < 11 * singleY)    clicked = ['19', '22']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    clicked = ['Black']
    }
    else if (xOffset < 35 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['24']
      else if (yOffset < 5 * singleY)     clicked = ['24', '23']
      else if (yOffset < 7 * singleY)     clicked = ['23']
      else if (yOffset < 8 * singleY)     clicked = ['23', '22']
      else if (yOffset < 11 * singleY)    clicked = ['22']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['13-24']
      else if (yOffset < 16 * singleY)    clicked = ['Black']
    }
    else if (xOffset < 37 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['24', '27']
      else if (yOffset < 5 * singleY)     clicked = ['24', '23', '27', '26']
      else if (yOffset < 7 * singleY)     clicked = ['23', '26']
      else if (yOffset < 8 * singleY)     clicked = ['23', '22', '26', '25']
      else if (yOffset < 11 * singleY)    clicked = ['22', '25']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    ;
      else if (yOffset < 16 * singleY)    ;
    }
    else if (xOffset < 39 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['27']
      else if (yOffset < 5 * singleY)     clicked = ['27', '26']
      else if (yOffset < 7 * singleY)     clicked = ['26']
      else if (yOffset < 8 * singleY)     clicked = ['26', '25']
      else if (yOffset < 11 * singleY)    clicked = ['25']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    clicked = ['Odd']
    }
    else if (xOffset < 41 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['27', '30']
      else if (yOffset < 5 * singleY)     clicked = ['27', '26', '30', '29']
      else if (yOffset < 7 * singleY)     clicked = ['26', '29']
      else if (yOffset < 8 * singleY)     clicked = ['26', '25', '29', '28']
      else if (yOffset < 11 * singleY)    clicked = ['25', '28']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    clicked = ['Odd']
    }
    else if (xOffset < 43 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['30']
      else if (yOffset < 5 * singleY)     clicked = ['30', '29']
      else if (yOffset < 7 * singleY)     clicked = ['29']
      else if (yOffset < 8 * singleY)     clicked = ['29', '28']
      else if (yOffset < 11 * singleY)    clicked = ['28']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    clicked = ['Odd']
    }
    else if (xOffset < 45 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['30', '33']
      else if (yOffset < 5 * singleY)     clicked = ['30', '29', '33', '32']
      else if (yOffset < 7 * singleY)     clicked = ['29', '32']
      else if (yOffset < 8 * singleY)     clicked = ['29', '28', '32', '31']
      else if (yOffset < 11 * singleY)    clicked = ['28', '31']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    ;
    }
    else if (xOffset < 47 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['33']
      else if (yOffset < 5 * singleY)     clicked = ['33', '32']
      else if (yOffset < 7 * singleY)     clicked = ['32']
      else if (yOffset < 8 * singleY)     clicked = ['32', '31']
      else if (yOffset < 11 * singleY)    clicked = ['31']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    clicked = ['19-36']
    }
    else if (xOffset < 49 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['33', '36']
      else if (yOffset < 5 * singleY)     clicked = ['33', '32', '36', '35']
      else if (yOffset < 7 * singleY)     clicked = ['32', '35']
      else if (yOffset < 8 * singleY)     clicked = ['32', '31', '35', '34']
      else if (yOffset < 11 * singleY)    clicked = ['31', '34']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    clicked = ['19-36']
    }
    else if (xOffset < 52 * singleX) {
      if (yOffset < 3 * singleY)          clicked = ['36']
      else if (yOffset < 5 * singleY)     clicked = ['36', '35']
      else if (yOffset < 7 * singleY)     clicked = ['35']
      else if (yOffset < 8 * singleY)     clicked = ['35', '34']
      else if (yOffset < 11 * singleY)    clicked = ['34']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    clicked = ['25-36']
      else if (yOffset < 16 * singleY)    clicked = ['19-36']
    }
    else {
      if (yOffset < 3 * singleY)          clicked = ['Remainder0']
      else if (yOffset < 5 * singleY)     ;
      else if (yOffset < 7 * singleY)     clicked = ['Remainder2']
      else if (yOffset < 8 * singleY)     ;
      else if (yOffset < 11 * singleY)    clicked = ['Remainder1']
      else if (yOffset < 12 * singleY)    ;
      else if (yOffset < 14 * singleY)    ;
      else if (yOffset < 16 * singleY)    ;
    }
  
    return clicked;
  }

export default BetsImage