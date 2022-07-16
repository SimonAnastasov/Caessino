import { calculateWinnings } from './calculateWinnings'

import { game } from '../postgre/index'

import axios from 'axios';

export let samplePlayer = {
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

export function resetGame() {
    game.magicNumber = -1;
    game.winningBets = [];
    game.status = '_1_ongoing_timer';

    let inactivePlayers = []

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

        const d = Date.now();

        if (d - player.lastActivity > 200000) {
            inactivePlayers.push(player);
        }
    })

    for (let i = 0; i < inactivePlayers.length; i++) {
        if (game.players.indexOf(inactivePlayers[i]) !== -1) {
            game.players.splice(game.players.indexOf(inactivePlayers[i]), 1);
        }
    }
}

export function updateGameWithWinners() {
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

export function addPlayer(session_id, name, username) {
    if (game.players.map(e=>e.session_id).indexOf(session_id) === -1) {
        game.players.push({
            lastActivity: Date.now(),
            session_id: session_id,
            username: username,
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
    else {
        game.players[game.players.map(e=>e.session_id).indexOf(session_id)].credits = -1;
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
