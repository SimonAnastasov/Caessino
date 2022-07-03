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
        status: '',
        timeToStart: 0,
        players: [],
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