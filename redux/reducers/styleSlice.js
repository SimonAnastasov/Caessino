import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    style: {
        // login
        displayLoadingScreen: false,
        displayRegisterScreen: false,
        registerScreenInfo: {
            setFocus: true,
            username: '',
            displayName: '',
            password: '',
        },
        displayLoginScreen: false,
        loginScreenInfo: {
            setFocus: true,
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
    },
    // roulette
    roulette: {
        COUNTDOWN_FROM: 30,
        displays: {
            betModal: false,
        },
        inputControls: {
            bet: {
                chosenCredits: 0,
            },
        },
        whichBets: [],
        coinPlaced: {
            x: 0,
            y: 0,
        },
        showCoin: false,
    },
    // poker
    poker: {
        displays: {
            raiseModal: false,
        },
        inputControls: {
            raise: {
                chosenCredits: 0,
            }
        },
        callAmount: 0,
        texts: {
            text1: 'A new card has been dealt!',
            text2: 'Player Pero\'s Turn (00:13)',
            text3: 'Pero has disconnected. They have 30 seconds to reconnect.'
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
        },
        setRoulette: (state, action) => {
            state.roulette = action.payload;
        }
    }
})

export const { setStyle, setBlackjack, setRoulette } = styleSlice.actions

export default styleSlice.reducer