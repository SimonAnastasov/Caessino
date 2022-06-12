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
    }
})

export const { setPlayer, setGame } = playerSlice.actions

export default playerSlice.reducer