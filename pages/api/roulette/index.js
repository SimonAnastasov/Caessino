import axios from 'axios';

require('dotenv').config();

let samplePlayer = {
    session_id: '',
    name: '',
    whichBets: [],
    coinPlaced: {
        x: -1,
        y: -1,                
    },
    credits: -1,
    betAmount: 0,
    wonAmount: 0,
    status: '_1_',
    outcome: 'none',
    gotResults: false,
}

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
    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];

        let playerWon = false;
        player.whichBets.forEach(bet => {
            if (game.winningBets.indexOf(bet) !== -1) {
                playerWon = true;
            }
        })

        if (playerWon) {
            player.outcome = 'won';
        }
        else {
            player.outcome = 'lost';
        }

        player.wonAmount = calculateWinnings(player);

        axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${player.session_id}&credits=${player.wonAmount}&game=roulette&outcome=${player.outcome}`).then(postgreRes => {
            if (postgreRes.data?.success) {
                player.credits = postgreRes.data?.credits;
            }
        });
    }
}

function resetGame() {
    game.magicNumber = -1;
    game.winningBets = [];
    game.status = '_1_ongoing_timer';

    game.players.forEach(player => {
        player.whichBets = [];
        player.betAmount = 0;
        player.wonAmount = 0;
        player.coinPlaced = {
            x: -1,
            y: -1,                
        },
        player.outcome = 'none';
        player.status = '_1_no_placed_bet';
        player.gotResults = false;
    })
}

function calculateWinnings(player) {
    if (player.outcome === 'lost') return 0;

    let bets = player.whichBets;
    let bet = player.betAmount;

    if (bets[0] === 'Even' || bets[0] === 'Odd') return 2 * bet;
    else if (bets[0] === 'Red' || bets[0] === 'Black') return 2 * bet;
    else if (bets[0].includes('Remainder')) return 3 * bet;
    else if (bets[0] === '1-12' || bets[0] === '13-24' || bets[0] === '25-36') return 3 * bet;
    else if (bets[0] === '1-18' || bets[0] === '19-36') return 2 * bet;
    else if (bets.length === 4) return 9 * bet;
    else if (bets.length === 2) return 18 * bet;
    else if (bets.length === 1) return 36 * bet;

    return 0;
}

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

let game = {
    status: '_1_ongoing_timer',     // statuses: _1_ongoing_timer, _2_spinning,
    timeToStart: 30,                // in seconds
    COUNTDOWN_FROM: 30,
    WAIT_BEFORE: 20,
    magicNumber: -1,
    winningBets: [],
    players: [],
}

function addPlayer(session_id, name) {
    if (game.players.map(e=>e.session_id).indexOf(session_id) === -1) {
        game.players.push({
            session_id: session_id,
            name: name,
            whichBets: [],
            coinPlaced: {
                x: -1,
                y: -1,                
            },
            credits: -1,
            betAmount: 0,
            wonAmount: 0,
            status: '_1_no_placed_bet',
            outcome: 'none',
            gotResults: false,
        })
    }
}

export function getPlayer(session_id) {
    const playerIdx = game.players.map(e=>e.session_id).indexOf(session_id);

    if (playerIdx !== -1) {
        return {
            success: true,
            player: game.players[playerIdx],
        }
    }

    return {
        success: false,
        player: {...samplePlayer},
    };
}

export function restrictGameInfo() {
    const restrictedPlayers = game.players.map(player=>({...player, session_id: ""}))

    return {
        ...game,
        players: restrictedPlayers,
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
