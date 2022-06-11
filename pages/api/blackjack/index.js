import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';

require('dotenv').config();

/**
 * ********************* BEGIN OF DEALING WITH GAME STATES *********************
 */

const singleDeck = ["SA", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "SX", "SJ", "SQ", "SK",
                    "HA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HX", "HJ", "HQ", "HK",
                    "CA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CX", "CJ", "CQ", "CK",
                    "DA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DX", "DJ", "DQ", "DK"    ];

/* We are using 5 decks */
const deck = singleDeck.concat(singleDeck).concat(singleDeck).concat(singleDeck).concat(singleDeck);

let game = {
  deck: [...deck],
  status: '_1_room_created',
  playerCards: [],
  dealerName: 'Lazar',
  dealerCards: [],
  initialBet: 0,
  sideBet: 0,
  sideBetName: '',
  outcome: '',
  earnings: 0,              // positive for draw, 2x for win, negative for loss.
  sideBetOutcome: '',
  sideBetEarnings: 0,
}

let rooms = []

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
function drawASingleCard(room) {
  checkDeckSize(room);
  let idx = Math.floor(Math.random() * room.deck.length);
  let card = room.deck[idx];

  room.deck.splice(idx, 1);

  return card;
}

/**
 * Deal the initial hand of cards
 */
function getInitialCards(room) {
  room.playerCards.push(drawASingleCard(room));
  room.playerCards.push(drawASingleCard(room));

  room.dealerCards.push(drawASingleCard(room));
  room.dealerCards.push(drawASingleCard(room));
}

function calculateEarnings(room) {
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

function calculateSideBetEarnings(room) {
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

/**
 * Set up a room
 */
function createARoom(session_id) {
  let room = {
    ...game, playerCards: [...game.playerCards], dealerCards: [...game.dealerCards],
  }

  rooms[session_id] = room;
}
/**
 * ********************* END OF DEALING WITH GAME STATES *********************
 */

/**
 * ********************* BEGIN OF REQUEST HANDLER *********************
 */
export default async function handler(req, res) {
  /**
   * GET method
   */
   if (req.method === 'GET') {
    /**
     * /---------------------- GET ----------------------/
     * @action play_again
     * @param session_id
     */
    if (req.query.action === 'play_again' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '5') {
        rooms[session_id] = {...game, playerCards: [...game.playerCards], dealerCards: [...game.dealerCards]};

        res.json({
          success: true,
          game: rooms[session_id],
        })

        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * @action stand
     * @param session_id
     */
    if (req.query.action === 'stand' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '4') {
        const room = rooms[session_id];

        while (calculateHandValue(room.dealerCards) < 17) {
          room.dealerCards.push(drawASingleCard(room));
        }

        room.status = '_5_game_over';

        if (calculateHandValue(room.dealerCards) > 21) {
          room.outcome = 'dealer_busted';
        }
        else if (calculateHandValue(room.playerCards) > calculateHandValue(room.dealerCards)) {
          room.outcome = 'player_won';
        }
        else if (calculateHandValue(room.playerCards) < calculateHandValue(room.dealerCards)) {
          room.outcome = 'player_lost';
        }
        else {
          room.outcome = 'draw';
        }

        room.earnings = calculateEarnings(room);

        rooms[session_id] = room;

        axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${room.earnings}&game=blackjack&outcome=${room.outcome}`).then(postgreRes => {
          if (postgreRes.data?.success) {
            res.json({
              success: true,
              status: rooms[session_id].status,
              playerCards: rooms[session_id].playerCards,
              dealerCards: rooms[session_id].dealerCards,
              outcome: rooms[session_id].outcome,
              earnings: rooms[session_id].earnings,
              credits: postgreRes.data?.credits,
            })
          }
          else {
            res.json({
              success: false,
            })
          }
        });

        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * @action hit_a_card
     * @param session_id
     */
    if (req.query.action === 'hit_a_card' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '4') {
        const room = rooms[session_id];

        room.playerCards.push(drawASingleCard(room));

        rooms[session_id] = room;

        if (calculateHandValue(room.playerCards) > 21) {
          room.status = '_5_game_over';
          room.outcome = 'player_busted';

          room.earnings = calculateEarnings(room);

          rooms[session_id] = room;

          axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${room.earnings}&game=blackjack&outcome=${room.outcome}`).then(postgreRes => {
            if (postgreRes.data?.success) {
              res.json({
                success: true,
                status: rooms[session_id].status,
                playerCards: rooms[session_id].playerCards,
                outcome: rooms[session_id].outcome,
                earnings: rooms[session_id].earnings,
                credits: postgreRes.data?.credits,
              })
            }
            else {
              res.json({
                success: false,
              })
            }
          });
        }
        else {
          res.json({
            success: true,
            status: rooms[session_id].status,
            playerCards: rooms[session_id].playerCards,
            outcome: rooms[session_id].outcome,
            earnings: rooms[session_id].earnings,
          })
        }

        return ;
      }

      res.json({
        success: false,
      })
    }

     /**
     * /---------------------- GET ----------------------/
     * @action get_initial_cards
     * @param session_id
     */
    if (req.query.action === 'get_initial_cards' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '3') {
        const room = rooms[session_id];

        getInitialCards(room);

        room.status = '_4_cards_on_the_table';

        rooms[session_id] = room;

        if (room.sideBetName !== '' && room.sideBetName !== 'none') {
          room.sideBetEarnings = calculateSideBetEarnings(room);
          room.sideBetOutcome = room.sideBetEarnings > 0 ? 'side_bet_won' : 'side_bet_lost';

          rooms[session_id] = room;

          axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${room.sideBetEarnings}`).then(postgreRes => {
            if (postgreRes.data?.success) {
              res.json({
                success: true,
                status: rooms[session_id].status,
                playerCards: rooms[session_id].playerCards,
                dealerCards: Array(rooms[session_id].dealerCards[0]).concat('back'),
                sideBetOutcome: rooms[session_id].sideBetOutcome,
                sideBetEarnings: rooms[session_id].sideBetEarnings,
                credits: postgreRes.data?.credits,
              })
            }
            else {
              res.json({
                success: false,
              })
            }
          });
        }
        else {
          res.json({
            success: true,
            status: rooms[session_id].status,
            playerCards: rooms[session_id].playerCards,
            dealerCards: Array(rooms[session_id].dealerCards[0]).concat('back'),
            sideBetOutcome: rooms[session_id].sideBetOutcome,
            sideBetEarnings: rooms[session_id].sideBetEarnings,
          })
        }

        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * @action make_side_bet
     * @param session_id
     * @param bet
     * @param betName
     */
     if (req.query.action === 'make_side_bet' && req.query?.session_id && req.query?.bet && req.query?.betName) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '2') {
        if (req.query?.skip !== 'true' && parseInt(req.query.bet) <= 0) {
            return ;
        }

        const room = rooms[session_id];

        room.sideBet = parseInt(req.query.bet);
        room.sideBetName = req.query.betName;
        room.status = '_3_made_side_bet';

        rooms[session_id] = room;

        res.json({
          success: true,
          status: rooms[session_id].status,
        })
        
        return ;
      }

      res.json({
        success: false,
      })
    }
    
    /**
     * /---------------------- GET ----------------------/
     * @action make_initial_bet
     * @param session_id
     * @param bet
     */
    if (req.query.action === 'make_initial_bet' && req.query?.session_id && req.query?.bet) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '1') {
        if (parseInt(req.query.bet) <= 0) return ;

        const room = rooms[session_id];

        room.initialBet = parseInt(req.query.bet);
        room.status = '_2_made_initial_bet';

        rooms[session_id] = room;

        res.json({
          success: true,
          status: rooms[session_id].status,
        })

        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * @action remove_room
     * @param session_id
     */
    if (req.query.action === 'remove_room' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined) {
        delete rooms[session_id];
      }
      
      res.json({
        success: true,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * @action get_player_info_on_enter
     * @param session_id
     */
    if (req.query.action === 'get_player_info_on_enter' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined) {

      }
      else {
        createARoom(session_id);
      }

      let dealerCardsTmp = [];
      if (rooms[session_id].status.substr(1, 1) != '1') { // 5 == game_over
        rooms[session_id].dealerCards.forEach((card, i) => {
          if (i === 0) {
            dealerCardsTmp.push(card);
          }
          else {
            dealerCardsTmp.push('back');
          }
        })
      }

      res.json({
        success: true,
        status: rooms[session_id].status,
        initialBet: rooms[session_id].initialBet,
        sideBet: rooms[session_id].sideBet,
        sideBetName: rooms[session_id].sideBetName,
        playerCards: rooms[session_id].playerCards,
        dealerCards: dealerCardsTmp,
        outcome: rooms[session_id].outcome,
        earnings: rooms[session_id].earnings,
      })
    }
  }
}
/**
 * ********************* END OF REQUEST HANDLER *********************
 */

/**
 * ********************* BEGIN OF FUNCTIONS THAT CHECK CARD COMBINATIONS *********************
 */

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

function checkIfSameValue(cards) {
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

function checkIfSameColour(cards) {
  for (let i = 1; i < cards.length; i++) {
    if (!checkIf2CardsAreSameColour(cards[i], cards[i-1])) {
      return false;
    }
  }

  return true;
}

function checkIfSameSuit(cards) {
  for (let i = 1; i < cards.length; i++) {
    if (cards[i][0] !== cards[i-1][0]) {
      return false;
    }
  }

  return true;
}

function checkIfStraight(cards) {
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
/**
 * ********************* END OF FUNCTIONS THAT CHECK CARD COMBINATIONS *********************
 */