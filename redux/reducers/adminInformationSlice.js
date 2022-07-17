import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    adminInformation: {
        complaints: [],
        answeringComplaintIndex: -1,
        answerForComplaint: '',
        liveGames: {
            blackjack: [],
            roulette: [],
            poker: [],
        },
    },
}

export const adminInformationSlice = createSlice({
    name: 'adminInformation',
    initialState,
    reducers: {
        setAdminInformation: (state, action) => {
            state.adminInformation = action.payload;
        },
    }
})

export const { setAdminInformation } = adminInformationSlice.actions

export default adminInformationSlice.reducer