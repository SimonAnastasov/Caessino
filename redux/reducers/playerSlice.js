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
    }
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