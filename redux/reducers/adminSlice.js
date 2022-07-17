import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    admin: {
        session_id: '',
        inputControls: {
            username: '',
            password: '',
        },
        displays: {
            setFocus: true,
            complaintsScreen: false,
            liveGamesScreen: false,
            loadingScreen: false,
        },
        inlineAlertText: '',
    },
}

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        setAdmin: (state, action) => {
            state.admin = action.payload;
        },
    }
})

export const { setAdmin } = adminSlice.actions

export default adminSlice.reducer