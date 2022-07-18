import React from 'react'


function calculateHandValue(cards) {
    let value = 0;
    let aces = 0;
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      if (card.substring(1) === 'A') {
        value += 11;
        aces++;
      } else if (card.substring(1) === 'X' || card.substring(1) === 'J' || card.substring(1) === 'Q' || card.substring(1) === 'K') {
        value += 10;
      } else {
        value += parseInt(card.substring(1));
      }
    }
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value;
}

const hands = [
    'Royal Flush',
    'Straight Flush',
    'Four of a Kind',
    'Full House',
    'Flush',
    'Straight',
    'Three of a Kind',
    'Two Pairs',
    'Pair',
    'High Card',
]

const order = "23456789XJQKA"
function getHandDetails(hand) {
    const cards = hand
    const faces = cards.map(a => String.fromCharCode([77 - order.indexOf(a[1])])).sort()
    const suits = cards.map(a => a[0]).sort()
    const counts = faces.reduce(count, {})
    const duplicates = Object.values(counts).reduce(count, {})
    const flush = suits[0] === suits[4]
    const first = faces[0].charCodeAt(1)
    const straight = faces.every((f, index) => f.charCodeAt(1) - first === index)
    let rank =
        (flush && straight && 1) ||
        (duplicates[4] && 2) ||
        (duplicates[3] && duplicates[2] && 3) ||
        (flush && 4) ||
        (straight && 5) ||
        (duplicates[3] && 6) ||
        (duplicates[2] > 1 && 7) ||
        (duplicates[2] && 8) ||
        9;

    return { hand: hands[rank], highCard: faces.sort(byCountFirst).join("") }

    function byCountFirst(a, b) {
        //Counts are in reverse order - bigger is better
        const countDiff = counts[b] - counts[a]
        if (countDiff) return countDiff // If counts don't match return
        return b > a ? -1 : b === a ? 0 : 1
    }

    function count(c, a) {
        c[a] = (c[a] || 0) + 1
        return c
    }
}

function compareHands(h1, h2) {
    let d1 = getHandDetails(h1)
    let d2 = getHandDetails(h2)
    if (hands.indexOf(d1.hand) === hands.indexOf(d2.hand)) {
        if (d1.highCard < d2.highCard) {
            return d2;
        } else if (d1.highCard > d2.highCard) {
            return d1;
        } else {
            return d1;
        }
    }
    return hands.indexOf(d1.hand) < hands.indexOf(d2.hand) ? d2 : d1;
}

function getBestHandDetails(playerCards, tableCards) {
    let combinations = getCardCombinations(playerCards, tableCards);

    let h1 = combinations[0];
    let bestHand = h1;
    combinations.forEach(combination => {
        bestHand = compareHands(h1, combination);
        h1 = combination;
    })

    return bestHand;
}

function getCardCombinations(playerCards, tableCards) {
    let combinations = [];

    if (tableCards[3] !== undefined) {
        combinations.push([playerCards[0], tableCards[0], tableCards[1], tableCards[2], tableCards[3]])
        combinations.push([playerCards[1], tableCards[0], tableCards[1], tableCards[2], tableCards[3]])
        combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[1], tableCards[3]])
        combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[2], tableCards[3]])
        combinations.push([playerCards[0], playerCards[1], tableCards[1], tableCards[2], tableCards[3]])
    }
    
    if (tableCards[4] !== undefined) {
        combinations.push([playerCards[0], tableCards[0], tableCards[1], tableCards[2], tableCards[4]])
        combinations.push([playerCards[0], tableCards[0], tableCards[1], tableCards[4], tableCards[3]])
        combinations.push([playerCards[0], tableCards[0], tableCards[4], tableCards[2], tableCards[3]])
        combinations.push([playerCards[0], tableCards[4], tableCards[1], tableCards[2], tableCards[3]])
        
        combinations.push([playerCards[1], tableCards[0], tableCards[1], tableCards[2], tableCards[4]])
        combinations.push([playerCards[1], tableCards[0], tableCards[1], tableCards[4], tableCards[3]])
        combinations.push([playerCards[1], tableCards[0], tableCards[4], tableCards[2], tableCards[3]])
        combinations.push([playerCards[1], tableCards[4], tableCards[1], tableCards[2], tableCards[3]])
        combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[1], tableCards[4]])
    
        combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[2], tableCards[4]])
        combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[3], tableCards[4]])
        combinations.push([playerCards[0], playerCards[1], tableCards[1], tableCards[2], tableCards[4]])
        combinations.push([playerCards[0], playerCards[1], tableCards[1], tableCards[3], tableCards[4]])
    
        combinations.push([playerCards[0], playerCards[1], tableCards[2], tableCards[3], tableCards[4]])
    }

    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[1], tableCards[2]])

    return combinations;
}

const Calculations = ({action, cards, cards2}) => {
    if (action === 'calculateHandValue') {
        return (
            <>
                {calculateHandValue(cards)}
            </>
        )
    }
    else {
        return (
            <>
                { cards.length > 0 && cards2.length > 0 && getBestHandDetails(cards, cards2).hand}
                { (cards.length === 0 || cards2.length === 0) && <span>-</span>}
            </>
        )
    }
}
  
export default Calculations
