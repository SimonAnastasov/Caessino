export let tables = []

export const singleDeck = ["SA", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "SX", "SJ", "SQ", "SK",
                    "HA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HX", "HJ", "HQ", "HK",
                    "CA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CX", "CJ", "CQ", "CK",
                    "DA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DX", "DJ", "DQ", "DK"    ];

export const deck = [...singleDeck];

export const sampleTable = {
    id: '',
    name: '',
    status: '_1_just_created',
    creator: '',
    started: false,
    ended: false,
    round: 0,
    turnIdx: -1,
    pot: 0,
    lastBet: 20,
    turnsSinceLastBet: 0,
    deck: [...deck],
    players: [],
    winners: [],
    splitWinners: false,
    cards: [],
}

export const samplePlayer = {
    id: '',
    table: '',
    credits: 0,
    status: '_1_just_entered',
    displayName: '',
    cards: [],
    betAmount: 0,
    wonAmount: 0,
    isSatDown: false,
    isCoordinator: false,
    isFolded: false,
    isGhost: false,
    hand: {
        hand: '',
        highCard: 0,
    },
}