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
        status: '_1_waiting_for_players',
        turnIdx: 0,
        playerCards: ['c4', 'c2'],
        cardsOnTable: ['c3', 'c1', 'c5'],
        players: [
            {
                status: 'disconnected',
                displayName: 'Pero',
                betAmount: 33,
            },
            {
                status: 'playing',
                displayName: 'Johnny',
                betAmount: 29,
            },
            {
                status: 'onTurn',
                displayName: 'Waterlo',
                betAmount: 199,
            },
        ]
    }
    // pokerGame: {
    //     status: '',
    //     turnIdx: 0,
    //     players: [],
    // }
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
    }
})

export const { setPlayer, setBlackjackGame, setRouletteGame } = playerSlice.actions

export default playerSlice.reducer