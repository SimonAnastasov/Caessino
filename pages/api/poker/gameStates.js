import { tables } from "../postgre/index";

import { v4 as uuidv4 } from "uuid";

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
    lastActivity: 0,
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


/**
 * ********************* BEGIN OF FUNCTIONS *********************
 */

export function createTable(playerId, playerName, tableName) {
    const tableId = uuidv4();

    const table = {
        id: tableId,
        name: tableName,
        status: '_1_just_created',
        creator: playerName,
        started: false,
        ended: false,
        round: 0,
        turnIdx: -1,
        lastActivity: 0,
        prevTurnIdx: -2,
        pot: 0,
        lastBet: 20,
        turnsSinceLastBet: 0,
        deck: [...deck],
        players: [{
            id: playerId,
            table: tableId,
            credits: 0,
            status: '_1_just_entered',
            displayName: playerName,
            cards: [],
            betAmount: 0,
            wonAmount: 0,
            isSatDown: false,
            isCoordinator: true,
            isFolded: false,
            isGhost: false,
            hand: {
                hand: '',
                highCard: 0,
            },
        }],
        onlyOnePlayerLeft: false,
        winners: [],
        splitWinners: false,
        cards: [],
    }

    tables.push(table)

    return table;
}

export function getRestrictedTablesArray() {
    let result = [];

    tables.forEach(table => {
        let tmpPlayers = [];
        table.players.forEach(player => {
            tmpPlayers.push({
                ...player,
                id: '',
                table: '',
                cards: '',
            })
        });

        let tmpWinners = [];
        table.winners.forEach(winner => {
            tmpWinners.push({
                ...winner,
                id: '',
                table: '',
                cards: '',
            })
        });

        let tmp = {
            ...table,
            deck: [],
            players: tmpPlayers,
            winners: tmpWinners,
            turnTimeout: null,
        }

        result.push({...tmp});
    })

    return result;
}

export function getRestrictedTableArray(tableId, session_id) {
    let result = undefined;

    let tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tableIdx !== -1) {
        let table = tables[tableIdx];

        let tmpPlayers = [];
        table.players.forEach(player => {
            if (player.id === session_id) {
                tmpPlayers.push({
                    ...player,
                    id: '',
                    table: '',
                })
            }
            else {
                tmpPlayers.push({
                    ...player,
                    id: '',
                    table: '',
                    cards: table.ended ? player.cards : player.cards.length > 0 ? ['back', 'back'] : '',
                })
            }
        });

        let tmpWinners = [];
        table.winners.forEach(winner => {
            if (winner.id === session_id) {
                tmpWinners.push({
                    ...winner,
                    id: '',
                    table: '',
                })
            }
            else {
                tmpWinners.push({
                    ...winner,
                    id: '',
                    table: '',
                    cards: table.ended ? winner.cards : winner.cards.length > 0 ? ['back', 'back'] : '',
                })
            }
        });
        result = {
            ...table,
            players: tmpPlayers,
            winners: tmpWinners,
            turnTimeout: null,
        }
    }

    return result;
}

export function getTable(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tableIdx !== -1) {
        return tables[tableIdx];
    }

    return undefined;
}

export function getTableAndPlayer(session_id) {
    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
        const playerIdx = tables[tableIdx].players.filter(e=>e.isGhost === false).map(e=>e.id).indexOf(session_id);

        if (playerIdx !== -1) {
            return {
                success: true,
                table: tables[tableIdx],
                player: tables[tableIdx].players[playerIdx],
            }
        }
    }

    return {
        success: false,
        table: {...sampleTable},
        player: {...samplePlayer},
    };
}

/**
 * ********************* END OF FUNCTIONS *********************
 */