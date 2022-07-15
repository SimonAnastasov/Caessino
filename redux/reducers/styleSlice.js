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
        displayDepositModal: false,
        depositModalInputs: {
            name: '',
            card: '',
            expire: '',
            ccv: '',
            amount: '',
        },
        displayWithdrawModal: false,
        withdrawModalInputs: {
            citibank: '',
            iban: '',
            bic: '',
            beneficiary: '',
            address: '',
            amount: '',
        },
        // complain
        displayComplainScreen: false,
        complainScreenInfo: {
            setFocus: true,
            description: '',
        },
        // lost connection
        lostConnectionInfo: {
            show: false,
            message: ''
        }
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
            x: -1,
            y: -1,
        }
    },
    // poker
    poker: {
        displays: {
            raiseModal: false,
        },
        inputControls: {
            raise: {
                chosenCredits: 0,
            },
            tableName: '',
        },
        callAmount: 0,
        texts: {
            text1: '',
            text2: '',
            text3: ''
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
        },
        setPoker: (state, action) => {
            state.poker = action.payload;
        }
    }
})

export const { setStyle, setBlackjack, setRoulette, setPoker } = styleSlice.actions

export default styleSlice.reducer