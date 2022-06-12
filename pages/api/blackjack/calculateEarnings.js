import { checkIfSameValue, checkIfSameColour, checkIfSameSuit, checkIfStraight } from './checkCardCombinations'

export function calculateEarnings(room) {
    let betEarnings = 0;

    if (room.outcome === 'draw') {
        betEarnings = room.initialBet;
    }
    else if (room.outcome === 'player_won' || room.outcome === 'dealer_busted') {
        betEarnings = 2 * room.initialBet;
    }
    else if (room.outcome === 'player_lost' || room.outcome === 'player_busted') {
        betEarnings = -1 * room.initialBet;
    }

    return betEarnings;
}
  
export function calculateSideBetEarnings(room) {
    let sideBetEarnings = -1 * room.sideBet;
  
    if (room.sideBetName != '') {
      if (room.sideBetName === 'mixed_pair') {
        if (checkIfSameValue(room.playerCards)) {
          sideBetEarnings = room.sideBet * 5;
        }
      }
      else if (room.sideBetName === 'coloured_pair') {
        if (checkIfSameValue(room.playerCards) && checkIfSameColour(room.playerCards)) {
          sideBetEarnings = room.sideBet * 12;
        }
      }
      else if (room.sideBetName === 'perfect_pair') {
        if (checkIfSameValue(room.playerCards) && checkIfSameSuit(room.playerCards)) {
          sideBetEarnings = room.sideBet * 25;
        }
      }
      else if (room.sideBetName === 'flush') {
        const tmpCards = room.playerCards.slice().concat(room.dealerCards[0]);
        if (checkIfSameSuit(tmpCards)) {
          sideBetEarnings = room.sideBet * 5;
        }
      }
      else if (room.sideBetName === 'straight') {
        const tmpCards = room.playerCards.slice().concat(room.dealerCards[0]);
        if (checkIfStraight(tmpCards)) {
          sideBetEarnings = room.sideBet * 10;
        }
      }
      else if (room.sideBetName === 'three_of_a_kind') {
        const tmpCards = room.playerCards.slice().concat(room.dealerCards[0]);
        if (checkIfSameValue(tmpCards)) {
          sideBetEarnings = room.sideBet * 30;
        }
      }
      else if (room.sideBetName === 'straight_flush') {
        const tmpCards = room.playerCards.slice().concat(room.dealerCards[0]);
        if (checkIfStraight(tmpCards) && checkIfSameSuit(tmpCards)) {
          sideBetEarnings = room.sideBet * 40;
        }
      }
      else if (room.sideBetName === 'suited_triple') {
        const tmpCards = room.playerCards.slice().concat(room.dealerCards[0]);
        if (checkIfSameSuit(tmpCards) && checkIfSameValue(tmpCards)) {
          sideBetEarnings = room.sideBet * 100;
        }
      }
    }
  
    return sideBetEarnings;
}
