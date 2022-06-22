const singleDeck = ["SA", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "SX", "SJ", "SQ", "SK",
                    "HA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HX", "HJ", "HQ", "HK",
                    "CA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CX", "CJ", "CQ", "CK",
                    "DA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DX", "DJ", "DQ", "DK"    ];

/* We are using 5 decks */
const deck = singleDeck.concat(singleDeck).concat(singleDeck).concat(singleDeck).concat(singleDeck);

/**
 * Sample game state (Begining of the game)
 */
export let game = {
  deck: [...deck],
  status: '_1_room_created',      // statuses: _1_room_created, _2_made_initial_bet, _3_made_side_bet, _4_cards_on_the_table, _5_game_over
  playerCards: [],
  dealerName: 'Lazar',
  dealerCards: [],
  initialBet: 0,
  sideBet: 0,
  sideBetName: '',
  outcome: '',
  earnings: 0,
  sideBetOutcome: '',
  sideBetEarnings: 0,
}

/**
 * Replace deck if empty
 */
function checkDeckSize(game) {
    if (game.deck.length === 0) {
      game.deck = [...deck];
    }
  }
  
/**
 * Draw a SINGLE random card
 */
export function drawASingleCard(room) {
    checkDeckSize(room);
    let idx = Math.floor(Math.random() * room.deck.length);
    let card = room.deck[idx];
  
    room.deck.splice(idx, 1);
  
    return card;
}
  
/**
 * Deal the initial hand of cards
 */
export function getInitialCards(room) {
    room.playerCards.push(drawASingleCard(room));
    room.playerCards.push(drawASingleCard(room));
  
    room.dealerCards.push(drawASingleCard(room));
    room.dealerCards.push(drawASingleCard(room));
}

/**
 * Calculate the hand value
 */
export function calculateHandValue(cards) {
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