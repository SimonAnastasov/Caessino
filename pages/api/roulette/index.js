import axios from 'axios';

import { game, update_game_to_database } from '../postgre/index'

require('dotenv').config();

import { resetGame, updateGameWithWinners, addPlayer, getPlayer, restrictGameInfo } from './gameStates'

import { getWinningBets } from './calculateWinnings'

(function() {
    setInterval(() => {
        game.timeToStart--;

        // WAIT_BEFORE seconds is the time allocated for spinning the wheel and seeing the results.
        if (game.timeToStart == 0) {
            game.timeToStart = game.COUNTDOWN_FROM + game.WAIT_BEFORE;

            game.magicNumber = Math.floor(Math.random() * 37);
            game.winningBets = getWinningBets(game.magicNumber);
            
            setTimeout(() => {
                updateGameWithWinners();
            }, 6000)
        }
        else if (game.timeToStart == 10) {
            game.status = '_2_spinning';
        }
        else if (game.timeToStart == game.COUNTDOWN_FROM) {
            resetGame();
        }

    }, 1000);
})();

if (game.status === undefined) {
    game.status = '_1_ongoing_timer';     // statuses: _1_ongoing_timer, _2_spinning
    game.timeToStart = 30;                // in seconds
    game.COUNTDOWN_FROM = 30;
    game.WAIT_BEFORE = 20;
    game.magicNumber = -1;
    game.winningBets = [];
    game.players = [];
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
         * Place a bet.
         * @action place_bet
         * @param session_id
         * @param betAmount
         * @param whichBets
         * @param coinPlacedX
         * @param coinPlacedY
         */
        if (req.query.action === 'place_bet' && req.query?.session_id && req.query?.betAmount && req.query?.whichBets && req.query?.coinPlacedX && req.query?.coinPlacedY) {
            const session_id = req.query.session_id;

            const { success, player } = getPlayer(session_id);

            if (success && game.status.includes('_1_') && player.status.includes('_1_')) {
                axios.get(`${process.env.HOME_URL}/api/postgre?action=take_credits&session_id=${session_id}&credits=${req.query.betAmount}`).then(postgreRes => {
                    if (postgreRes.data?.success) {
                        player.betAmount = parseInt(req.query.betAmount);
                        player.whichBets = req.query.whichBets.split(',');
                        player.status = '_2_placed_bet';
                        player.coinPlaced = {
                            x: req.query.coinPlacedX,
                            y: req.query.coinPlacedY,
                        },
                        player.credits = postgreRes.data?.credits;
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

            const { success, player } = getPlayer(session_id);

            let extraAction = "";
            let magicNumber = -1;
            let winningBets = [];

            if (success) {
                if (game.timeToStart > game.COUNTDOWN_FROM && !player.gotResults) {
                    extraAction = "spin_wheel";
                    magicNumber = game.magicNumber;
                    winningBets = game.winningBets;

                    player.gotResults = true;
                }
            }

            if (game.loaded !== undefined && game.loaded) {
                update_game_to_database();
            }

            res.json({
                success: true,
                rouletteGame: {
                    game: restrictGameInfo(),
                    player: player,
                },
                extraAction: extraAction,
                magicNumber: magicNumber,
                winningBets: winningBets,
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
                    addPlayer(session_id, postgreRes.data?.displayName);
                
                    res.json({
                        success: true,
                        game: game,
                        displayName: postgreRes.data?.displayName,
                        session_id: postgreRes.data?.session_id,
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
   }
}
/**
 * ********************* END OF REQUEST HANDLER *********************
 */
