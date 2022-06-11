import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    player: {
        displayName: '',
        username: '',
        session_id: '',
        room_id: '',
        credits: 0,
    },
    game: {
        playerCards: [],
        dealerCards: [],
        status: '',
        sideBetName: '',
    },
    stats: {
        wins: {
            blackjack: 0,
            roulette: 0,
            poker: 0,
        },
        games: {
            blackjack: 0,
            roulette: 0,
            poker: 0,
        }
    }
}

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setPlayer: (state, action) => {
            state.player = action.payload;
        },
        setGame: (state, action) => {
            state.game = action.payload;
        },
        setStats: (state, action) => {
            state.stats = action.payload;
        }
    }
})

export const { setPlayer, setGame, setStats } = playerSlice.actions

export default playerSlice.reducer