import axios from 'axios';

require('dotenv').config();

const COUNTDOWN_FROM = 90;
const WAIT_BEFORE = 30;

(function() {
    setInterval(() => {

        game.timeToStart--;

        // 30 seconds is the time to spin and see the results.
        if (game.timeToStart == 0) {
            game.timeToStart = COUNTDOWN_FROM + WAIT_BEFORE;
        }

    }, 1000);
})();

let game = {
    status: '_1_ongoing_timer',     // statuses: _1_ongoing_timer, _2_spinning, _3_results
    timeToStart: COUNTDOWN_FROM,    // in seconds
    players: [] ,                   // example player -> { session_id, name, whichBet, betAmount, status }  // statuses: _1_no_placed_bet, _2_placed_bet
}

function addPlayer(session_id, name) {
    if (game.players.map(e=>e.session_id).indexOf(session_id) === -1) {
        game.players.push({
            session_id: session_id,
            name: name,
            whichBets: [],
            betAmount: 0,
            status: '_1_no_placed_bet',
        })
    }
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
         */
        if (req.query.action === 'place_bet' && req.query?.session_id && req.query?.betAmount && req.query?.whichBets) {
            const session_id = req.query.session_id;
            const playerIdx = game.players.map(e=>e.session_id).indexOf(session_id);

            if (playerIdx !== -1 && game.players[playerIdx].status.substr(1, 1) === '1') {
                game.players[playerIdx].betAmount = parseInt(req.query.betAmount);
                game.players[playerIdx].whichBets = req.query.whichBets.split(',');
                game.players[playerIdx].status = '_2_placed_bet';
    
                axios.get(`${process.env.HOME_URL}/api/postgre?action=take_credits&session_id=${session_id}&credits=${req.query.betAmount}`).then(postgreRes => {
                    if (postgreRes.data?.success) {
                        res.json({
                            success: true,
                            game: game,
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
