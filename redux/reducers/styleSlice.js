import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    style: {
        // login
        displayLoadingScreen: false,
        displayRegisterScreen: false,
        registerScreenInfo: {
            username: '',
            displayName: '',
            password: '',
        },
        displayLoginScreen: false,
        loginScreenInfo: {
            username: '',
            password: '',
        },
        // custom
        inlineAlertText: '',
        alert: {
            show: false,
            title: '',
            subtitle: '',
            button: {
                text: '',
                action: '',
            }
        },
        notification: {
            show: false,
            text: '',
            status: '',
        },
        // stats
        displayStatsScreen: false,
        statsScreenInfo: {
            money: {
                bet: 0,
                earned: 0,
            },
            blackjack: {
                games: 0,
                wins: 0,
            },
            roulette: {
                games: 0,
                wins: 0,
            },
            poker: {
                games: 0,
                wins: 0,
            },
        },
        // manage credits
        displayManageCreditsScreen: false,
    },
    // blackjack
    blackjack: {
        displays: {
            sideBetsChooseCreditsModal: false,
            sideBetsModal: false,
            initialBet: true,
            sideBet: false,
            hitStand: false,
        },
        inputControls: {
            initialBet: {
                chosenCredits: 0,
                maxCredits: 0,
            },
            sideBet: {
                chosenCredits: 0,
                maxCredits: 0,
            }
        },
        texts: {
            sideBetsChooseCreditsText: '',
            sideBetsPaysText: '',
        }
    }
}

export const styleSlice = createSlice({
    name: 'style',
    initialState,
    reducers: {
        setStyle: (state, action) => {
            state.style = action.payload;
        },
        setBlackjack: (state, action) => {
            state.blackjack = action.payload;
        }
    }
})

export const { setStyle, setBlackjack } = styleSlice.actions

export default styleSlice.reducer