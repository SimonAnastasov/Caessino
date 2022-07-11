import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    player: {
        displayName: '',
        username: '',
        session_id: '',
        room_id: '',
        credits: 0,
    },
    blackjackGame: {
        status: '',
        playerCards: [],
        dealerCards: [],
        sideBetName: '',
    },
    rouletteGame: {
        game: {
            status: '_1_ongoing_timer',
            timeToStart: 30,
            COUNTDOWN_FROM: 30,
            WAIT_BEFORE: 20,
            magicNumber: -1,
            winningBets: [],
            players: [],
        },
        player: {
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
        },
    },
    pokerGame: {
        tables: [],
        table: {
            id: '',
            name: '',
            status: '',
            creator: '',
            started: false,
            round: 0,
            turnIdx: 0,
            lastBet: 0,
            turnsSinceLastBet: 0,
            players: [{
                id: '',
                table: '',
                status: '',
                displayName: '',
                cards: [],
                betAmount: 0,
                isSatDown: false,
                iSCoordinator: false,
            }],
            cards: [],
        },
        player: {
            status: '',
            cards: [],
            table: '',
            isSatDown: false,
            isCoordinator: false,
        },
    },
}

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setPlayer: (state, action) => {
            state.player = action.payload;
        },
        setBlackjackGame: (state, action) => {
            state.blackjackGame = action.payload;
        },
        setRouletteGame: (state, action) => {
            state.rouletteGame = action.payload;
        },
        setPokerGame: (state, action) => {
            state.pokerGame = action.payload;
        },
    }
})

export const { setPlayer, setBlackjackGame, setRouletteGame, setPokerGame } = playerSlice.actions

export default playerSlice.reducer