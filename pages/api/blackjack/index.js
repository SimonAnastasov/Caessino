import axios from 'axios';

require('dotenv').config();

import { game, drawASingleCard, getInitialCards, calculateHandValue, getGame, getRestrictedGameObject } from './gameStates';
import { calculateEarnings, calculateSideBetEarnings } from './calculateEarnings';

import { rooms, saveGameInHistory, update_rooms_to_database } from '../postgre/index'

/**
 * Set up a room
 */
function createARoom(session_id, displayName, username) {
  let room = {
    ...game, displayName: displayName, username: username, playerCards: [...game.playerCards], dealerCards: [...game.dealerCards],
  }

  rooms[session_id] = room;
}

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
     * If game status is _5_game_over, restart the room for a new game.
     * @action play_again
     * @param session_id
     */
    if (req.query.action === 'play_again' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '5') {
        rooms[session_id] = {...game, displayName: rooms[session_id].displayName, username: rooms[session_id].username, playerCards: [...game.playerCards], dealerCards: [...game.dealerCards]};

        rooms[session_id].betOutcomeMessageShown = true;

        update_rooms_to_database();
      }

      res.end();
    }

    /**
     * /---------------------- GET ----------------------/
     * If game status is _4_cards_on_the_table, turn off the alert for side bet outcome
     * @action continue_from_side_bet
     * @param session_id
     */
     if (req.query.action === 'continue_from_side_bet' && req.query?.session_id) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '4') {
        rooms[session_id].sideBetOutcomeMessageShown = true;

        update_rooms_to_database();
      }

      res.end();
    }

    /**
     * /---------------------- GET ----------------------/
     * If game status is _4_cards_on_the_table, draw cards for the dealer while handValue < 17, and calculate game outcome and player earnings.
     * Also, update the player's credits and stats in the database through /api/postgre?action=add_credits.
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

        if (room.outcome === 'draw') {
          room.messageTitle = 'Draw!';
          room.messageDescription = `You got your $${room.earnings} back`
        }
        else if (room.outcome === 'player_won') {
          room.messageTitle = 'You won!';
          room.messageDescription = `You won $${room.earnings}`
        }
        else if (room.outcome === 'dealer_busted') {
          room.messageTitle = `Dealer ${room.dealerName} busted!`;
          room.messageDescription = `You won $${room.earnings}`
        }
        else if (room.outcome === 'player_lost') {
          room.messageTitle = 'You lost!';
          room.messageDescription = `You lost $${-1*room.earnings}`
        }
        room.betOutcomeMessageShown = false;

        rooms[session_id] = room;

        axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${room.earnings}&game=blackjack&outcome=${room.outcome}`).then(postgreRes => {
          if (postgreRes.data?.success) {
            rooms[session_id].credits = postgreRes.data?.credits;

            res.json({
              success: true,
              status: rooms[session_id].status,
              playerCards: rooms[session_id].playerCards,
              dealerCards: rooms[session_id].dealerCards,
              outcome: rooms[session_id].outcome,
              earnings: rooms[session_id].earnings,
              credits: postgreRes.data?.credits,
            })

            update_rooms_to_database();
          }
          else {
            res.json({
              success: false,
            })
          }
        });

        rooms[session_id].finished = new Date().toGMTString();
        saveGameInHistory('blackjack', rooms[session_id], rooms[session_id].username);

        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * If game status is _4_cards_on_the_table, draw a card for the player.
     * If player busts, update the player's stats in the database through /api/postgre?action=add_credits.
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

          room.messageTitle = 'You busted!';
          room.messageDescription = `You lost $${-1*room.earnings}`
          
          room.betOutcomeMessageShown = false;

          rooms[session_id] = room;

          axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${room.earnings}&game=blackjack&outcome=${room.outcome}`).then(postgreRes => {
            if (postgreRes.data?.success) {
              rooms[session_id].credits = postgreRes.data?.credits;

              res.json({
                success: true,
                status: rooms[session_id].status,
                playerCards: rooms[session_id].playerCards,
                outcome: rooms[session_id].outcome,
                earnings: rooms[session_id].earnings,
                credits: postgreRes.data?.credits,
              })
            
              update_rooms_to_database();
            }
            else {
              res.json({
                success: false,
              })
            }
          });
          
          rooms[session_id].finished = new Date().toGMTString();
          saveGameInHistory('blackjack', rooms[session_id], rooms[session_id].username);
        }
        else {
          res.json({
            success: true,
            status: rooms[session_id].status,
            playerCards: rooms[session_id].playerCards,
            outcome: rooms[session_id].outcome,
            earnings: rooms[session_id].earnings,
          })
            
          update_rooms_to_database();
        }

        return ;
      }

      res.json({
        success: false,
      })
    }

     /**
     * /---------------------- GET ----------------------/
     * If game status is _3_made_side_bet, check if the player won the side bet or not (if they placed a side bet of course).
     * Update the player's stats in the database through /api/postgre?action=add_credits.
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

        update_rooms_to_database();

        if (room.sideBetName !== '' && room.sideBetName !== 'none') {
          room.sideBetEarnings = calculateSideBetEarnings(room);
          room.sideBetOutcome = room.sideBetEarnings > 0 ? 'side_bet_won' : 'side_bet_lost';

          if (room.sideBetOutcome === 'side_bet_won') {
            room.messageTitle = `You won the side bet!`;
            room.messageDescription = `You won $${room.sideBetEarnings}`
          }
          else if (room.sideBetOutcome === 'side_bet_lost') {
            room.messageTitle = `You lost the side bet!`;
            room.messageDescription = `You lost $${-1*room.sideBetEarnings}`
          }

          room.sideBetOutcomeMessageShown = false;
          
          rooms[session_id] = room;

          axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${room.sideBetEarnings}`).then(postgreRes => {
            if (postgreRes.data?.success) {
              rooms[session_id].credits = postgreRes.data?.credits;

              update_rooms_to_database();
            }
          });
        }
      }

      res.end();
    }

    /**
     * /---------------------- GET ----------------------/
     * If game status is _2_made_initial_bet, place a side bet if the user has chosen one.
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

        axios.get(`${process.env.HOME_URL}/api/postgre?action=take_credits&session_id=${session_id}&credits=${req.query.bet}`).then(postgreRes => {
          if (postgreRes.data?.success) {
            rooms[session_id].credits = postgreRes.data?.credits;

            const room = rooms[session_id];

            room.sideBet = parseInt(req.query.bet);
            room.sideBetName = req.query.betName;
            room.status = '_3_made_side_bet';

            rooms[session_id] = room;

            res.json({
              success: true,
            })
            
            update_rooms_to_database();
          }
          else {
            res.end();
          }
        });
      }
    }
    
    /**
     * /---------------------- GET ----------------------/
     * If game status is _1_room_created, get the initial bet placed by the player.
     * @action make_initial_bet
     * @param session_id
     * @param bet
     */
    if (req.query.action === 'make_initial_bet' && req.query?.session_id && req.query?.bet) {
      const session_id = req.query.session_id;

      if (rooms[session_id] !== undefined && rooms[session_id].status.substr(1, 1) === '1') {
        if (parseInt(req.query.bet) <= 0) return ;

        axios.get(`${process.env.HOME_URL}/api/postgre?action=take_credits&session_id=${session_id}&credits=${req.query.bet}`).then(postgreRes => {
          if (postgreRes.data?.success) {
            rooms[session_id].credits = postgreRes.data?.credits;

            const room = rooms[session_id];

            room.initialBet = parseInt(req.query.bet);
            room.status = '_2_made_initial_bet';

            rooms[session_id] = room;
            
            update_rooms_to_database();
          }
        });
      }

      res.end();
    }

    /**
     * /---------------------- GET ----------------------/
     * Updates the state periodically
     * @action update_state
     * @param session_id
     */
     if (req.query.action === 'update_state' && req.query?.session_id) {
      const session_id = req.query.session_id;

      const { success, game } = getGame(session_id);

      res.json({
          success: true,
          blackjackGame: getRestrictedGameObject(session_id),
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * If the player is not in an existing room, create a room for them.
     * If they are reconnecting, get the room they were in.
     * @action get_player_info_on_enter
     * @param session_id
     */
    if (req.query.action === 'get_player_info_on_enter' && req.query?.session_id) {
      const session_id = req.query.session_id;

      axios.get(`${process.env.HOME_URL}/api/postgre?action=check_if_logged_in&session_id=${session_id}`).then(postgreRes => {
        if (postgreRes.data?.success) {
          if (rooms[session_id] !== undefined) {
            // room exists
          }
          else {
            createARoom(session_id, postgreRes.data?.displayName, postgreRes.data?.username);
          }
    
          let dealerCardsTmp = [];
          if (rooms[session_id].status.substr(1, 1) != '5') { // 5 == game_over
            rooms[session_id].dealerCards.forEach((card, i) => {
              if (i === 0) {
                dealerCardsTmp.push(card);
              }
              else {
                dealerCardsTmp.push('back');
              }
            })
          }
          else {
            dealerCardsTmp = rooms[session_id].dealerCards;
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
            displayName: postgreRes.data?.displayName,
            session_id: postgreRes.data?.session_id,
            credits: postgreRes.data?.credits,
          })
            
          update_rooms_to_database();
        }
        else {
          res.json({
            success: false,
          })
        }
      });
    }
  }
}
/**
 * ********************* END OF REQUEST HANDLER *********************
 */
