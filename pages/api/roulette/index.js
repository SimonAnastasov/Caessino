import axios from 'axios';

require('dotenv').config();

function getWinningBets(magicNumber) {
    let winningBets = [];
    winningBets.push(magicNumber);
    
    if (magicNumber != 0) {
        if ((magicNumber <= 9 && magicNumber % 2 == 1) || (magicNumber > 10 && magicNumber <= 18 && magicNumber % 2 == 0) ||
            (magicNumber > 19 && magicNumber <= 27 && magicNumber % 2 == 1) || (magicNumber > 27 && magicNumber % 2 == 0)) {

            winningBets.push('Red');
        }
        else {
            winningBets.push('Black');
        }

        if (magicNumber % 2 === 0)      winningBets.push('Even');
        else                            winningBets.push('Odd');

        if (magicNumber <= 12)          winningBets.push('1-12');
        else if (magicNumber <= 24)     winningBets.push('13-24');
        else                            winningBets.push('25-36');

        if (magicNumber <= 18)          winningBets.push('1-18');
        else                            winningBets.push('19-36');

        if (magicNumber % 3 === 0)      winningBets.push('Remainder3');
        else if (magicNumber % 3 === 2) winningBets.push('Remainder2');
        else                            winningBets.push('Remainder1');
    }

    return winningBets;
}

function updateGameWithWinners() {
    const winningBets = getWinningBets(magicNumber);

    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        let playerWon = false;
        player.whichBets.forEach(bet => {
            if (winningBets.indexOf(bet) !== -1) {
                playerWon = true;
            }
        })

        if (playerWon) {
            game.players[i].outcome = 'won';
        }
        else {
            game.players[i].outcome = 'lost';
        }
    }
}

function resetPlayers() {
    game.players.forEach(player => {
        player.whichBets = [];
        player.betAmount = 0;
        player.outcome = 'none';
        player.status = '_1_no_placed_bet';
    })
}

function calculateWinnings(player) {
    if (player.outcome === 'lost') return 0;

    let bets = player.whichBets;
    let bet = player.betAmount;

    if (bets[0] === 'Even' || bets[0] === 'Odd') return 2 * bet;
    else if (bets[0] === 'Red' || bets[0] === 'Black') return 2 * bet;
    else if (bets[0].contains('Remainder')) return 3 * bet;
    else if (bets[0] === '1-12' || bets[0] === '13-24' || bets[0] === '25-36') return 3 * bet;
    else if (bets[0] === '1-18' || bets[0] === '19-36') return 2 * bet;
    else if (bets.length === 4) return 9 * bet;
    else if (bets.length === 2) return 18 * bet;
    else if (bets.length === 1) return 36 * bet;

    return 0;
}

const COUNTDOWN_FROM = 30;
const WAIT_BEFORE = 20;

let magicNumber = -1;

(function() {
    setInterval(() => {
        game.timeToStart--;

        // WAIT_BEFORE seconds is the time allocated for spinning the wheel and seeing the results.
        if (game.timeToStart == 0) {
            game.timeToStart = COUNTDOWN_FROM + WAIT_BEFORE;
        }
        else if (game.timeToStart == 10) {
            magicNumber = Math.floor(Math.random() * 37);
            game.status = '_2_spinning';
        }
        else if (game.timeToStart == COUNTDOWN_FROM) {
            game.status = '_1_ongoing_timer';
        }
        else if (game.timeToStart == COUNTDOWN_FROM + 5) {
            resetPlayers();
        }

    }, 1000);
})();

let game = {
    status: '_1_ongoing_timer',     // statuses: _1_ongoing_timer, _2_spinning,
    timeToStart: COUNTDOWN_FROM,    // in seconds
    players: [] ,                   // example player -> { session_id, name, whichBet, betAmount, status, outcome }  // statuses: _1_no_placed_bet, _2_placed_bet
}

function addPlayer(session_id, name) {
    if (game.players.map(e=>e.session_id).indexOf(session_id) === -1) {
        game.players.push({
            session_id: session_id,
            name: name,
            whichBets: [],
            betAmount: 0,
            status: '_1_no_placed_bet',
            outcome: 'none',
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
         * Return to the user info for starting a new game.
         * @action reset_game
         * @param session_id
         */
        if (req.query.action === 'reset_game' && req.query?.session_id) {
            const session_id = req.query.session_id;
            const playerIdx = game.players.map(e=>e.session_id).indexOf(session_id);

            if (playerIdx !== -1) {
                res.json({
                    success: true,
                    game: game,
                })
            }
            else {
                res.json({
                    success: false,
                })
            }
        }

        /**
         * /---------------------- GET ----------------------/
         * Timer done on client side.
         * @action timer_done
         * @param session_id
         */
         if (req.query.action === 'timer_done' && req.query?.session_id) {
            const session_id = req.query.session_id;
            const playerIdx = game.players.map(e=>e.session_id).indexOf(session_id);

            if (playerIdx !== -1 && game.status.substr(1, 1) === '2') {
                updateGameWithWinners();

                const playerWinnings = calculateWinnings(game.players[playerIdx]);

                axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${session_id}&credits=${playerWinnings}&game=roulette&outcome=${game.players[playerIdx].outcome}`).then(postgreRes => {
                    if (postgreRes.data?.success) {
                        res.json({
                            success: true,
                            game: game,
                            magicNumber: magicNumber,
                            winningBets: getWinningBets(magicNumber),
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
                    success: false,
                })
            }
        }

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

            if (playerIdx !== -1 && game.status.substr(1, 1) === '1' && game.players[playerIdx].status.substr(1, 1) === '1') {
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
