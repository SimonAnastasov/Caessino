export function checkIfSameValue(cards) {
    for (let i = 1; i < cards.length; i++) {
      if (cards[i][1] !== cards[i-1][1]) {
        return false;
      }
    }
  
    return true;
}
  
function checkIf2CardsAreSameColour(card1, card2) {
    if (card1[0] === card2[0]) return true;
    if (card1[0] === 'H' && card2[0] === 'D') return true;
    if (card1[0] === 'D' && card2[0] === 'H') return true;
    if (card1[0] === 'S' && card2[0] === 'C') return true;
    if (card1[0] === 'C' && card2[0] === 'S') return true;
    return false;
}
  
export function checkIfSameColour(cards) {
    for (let i = 1; i < cards.length; i++) {
      if (!checkIf2CardsAreSameColour(cards[i], cards[i-1])) {
        return false;
      }
    }
  
    return true;
}
  
export function checkIfSameSuit(cards) {
    for (let i = 1; i < cards.length; i++) {
      if (cards[i][0] !== cards[i-1][0]) {
        return false;
      }
    }
  
    return true;
}
  
export function checkIfStraight(cards) {
    let values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K'];
  
    let valuesInCards = [];
    for (let i = 0; i < cards.length; i++) {
      valuesInCards.push(cards[i][1]);
    }
  
    let temp = values.reduce((c, v, i) => Object.assign(c, {[v]: i}), {});
  
    valuesInCards = valuesInCards.sort((a, b) => temp[a] - temp[b]);
  
    let idx = values.indexOf(valuesInCards[0]);
  
    let straight = true;
  
    for (let i = 0; i < valuesInCards.length; i++) {
      if (valuesInCards[i] !== values[idx]) {
        straight = false;
        break; 
      }
  
      idx++;
      if (idx >= temp.length) {
        straight = false;
        break;
      }
    }
  
    if (straight) {
      return true;
    }
  
    values = ['2', '3', '4', '5', '6', '7', '8', '9', 'X', 'J', 'Q', 'K', 'A'];
    temp = values.reduce((c, v, i) => Object.assign(c, {[v]: i}), {});
  
    valuesInCards = valuesInCards.sort((a, b) => temp[a] - temp[b]);
  
    idx = values.indexOf(valuesInCards[0]);
  
    for (let i = 0; i < valuesInCards.length; i++) {
      if (valuesInCards[i] !== values[idx]) return false;
  
      idx++;
      if (idx >= temp.length) return false;
    }
  
    return true;
}
