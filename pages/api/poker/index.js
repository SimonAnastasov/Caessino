import axios from 'axios';

require('dotenv').config();

import { v4 as uuidv4 } from 'uuid';

const sampleTable = {
    id: '',
    name: '',
    status: '_1_just_created',
    creator: '',
    started: false,
    round: 0,
    turnIdx: 0,
    lastBet: 0,
    turnsSinceLastBet: 0,
    players: [],
    deck: [],
    cardsOnTable: [],
}

const samplePlayer = {
    id: '',
    table: '',
    status: '_1_just_entered',
    displayName: '',
    cards: [],
    betAmount: 0,
    isSatDown: false,
    isCoordinator: false,
    isFolded: false,
}

let tables = []
// contures -> { status, round, turnIdx, lastBet, turnsSinceLastBet,
//
//              players -> { id, table, status, displayName, cards,
//                          betAmount, isSatDown, isCoordinator },
//
//              cardsOnTable }

const singleDeck = ["SA", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "SX", "SJ", "SQ", "SK",
                    "HA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "HX", "HJ", "HQ", "HK",
                    "CA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "CX", "CJ", "CQ", "CK",
                    "DA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "DX", "DJ", "DQ", "DK"    ];

/* We are using 5 decks */
const deck = singleDeck.concat(singleDeck).concat(singleDeck).concat(singleDeck).concat(singleDeck);

/**
 * Replace deck if empty
 */
function checkDeckSize(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        if (tables[tableIdx].deck.length === 0) {
            tables[tableIdx].deck = [...deck];
        }
    }
}

/**
 * Draw a SINGLE random card
 */
function drawASingleCard(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        checkDeckSize(tableId);
        
        let idx = Math.floor(Math.random() * tables[tableIdx].deck.length);
        let card = tables[tableIdx].deck[idx];

        tables[tableIdx].deck.splice(idx, 1);

        return card;
    }

    return undefined;
}

function setNextPlayerIdx(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        while (true) {
            table.turnIdx++;
            table.turnIdx %= table.players.length;
            
            if (table.players[table.turnIdx] !== undefined && table.players[table.turnIdx].isSatDown && !table.players[table.turnIdx].isFolded) {
                return ;
            }
        }
    }
}

function getCardsOnTable(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        if (table.round === 2) {
            for (let i = 0; i < 3; i++) {
                const card = drawASingleCard(table.id);
                            
                if (card !== undefined) {
                    table.cards.push(card);
                }
            }
        }
    }
}

/**
 * ********************* BEGIN OF FUNCTIONS *********************
 */

function createTable(playerId, playerName, tableName) {
    const tableId = uuidv4();

    const table = {
        id: tableId,
        name: tableName,
        status: '_1_just_created',
        creator: playerName,
        started: false,
        round: 0,
        turnIdx: 0,
        lastBet: 20,
        turnsSinceLastBet: 0,
        deck: [...deck],
        players: [{
            id: playerId,
            table: tableId,
            status: '_1_just_entered',
            displayName: playerName,
            cards: [],
            betAmount: 0,
            isSatDown: false,
            isCoordinator: true,
            isFolded: false,
        }],
        cards: [],
    }

    tables.push(table)

    return table;
}

function getRestrictedTablesArray() {
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

        let tmp = {
            ...table,
            deck: [],
            players: tmpPlayers,
        }

        result.push({...tmp});
    })

    return result;
}

function getRestrictedTableArray(tableId, session_id) {
    let result = {...sampleTable};

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
                    cards: player.cards.length > 0 ? ['back', 'back'] : '',
                })
            }
        });

        result = {
            ...table,
            players: tmpPlayers,
        }
    }

    return result;
}

function getTable(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tableIdx !== -1) {
        return tables[tableIdx];
    }

    return undefined;
}

function getTableAndPlayer(session_id) {
    for (let tableIdx = 0; tableIdx < tables.length; tableIdx++) {
        const playerIdx = tables[tableIdx].players.map(e=>e.id).indexOf(session_id);

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
        table: sampleTable,
        player: samplePlayer,
    };
}

/**
 * ********************* END OF FUNCTIONS *********************
 */

/**
 * ********************* BEGIN OF REQUEST HANDLER *********************
 */
export default async function handler(req, res) {
    /**
     * GET method
     */
    if (req.method === 'GET') {
        
        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action game_action
         * @param session_id
         * @param specificAction
         * @param betAmount
         */
        if (req.query.action === 'game_action' && req.query?.session_id && req.query?.specificAction && req.query?.betAmount) {
            const { success, table, player } = getTableAndPlayer(req.query.session_id)

            if (success && table.started) {
                if (table.players.map(e=>e.id).indexOf(req.query.session_id) !== table.turnIdx) {
                    res.end();
                    return ;
                }

                let okayToGo = false;

                const satDownPlayers = table.players.filter(e=>e.isSatDown === true);
                const remainingPlayers = satDownPlayers.filter(e=>e.folded === false);

                if (req.query.specificAction === 'check') {

                }
                else if (req.query.specificAction === 'call') {
                    player.betAmount += table.lastBet;
                    table.turnsSinceLastBet++;
                    okayToGo = true;

                    if (table.turnsSinceLastBet === remainingPlayers.length) {
                        table.round++;
                        table.lastBet = 0;

                        getCardsOnTable(table.id);
                    }
                }
                else if (req.query.specificAction === 'raise') {
                    
                }
                else if (req.query.specificAction === 'fold') {
                    player.folded = true;
                }

                if (okayToGo) {
                    setNextPlayerIdx(table.id);
                }
            }
            
            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action start_game
         * @param session_id
         */
        if (req.query.action === 'start_game' && req.query?.session_id) {
            const { success, table } = getTableAndPlayer(req.query.session_id)

            if (success && !table.started) {
                table.started = true;
                table.round = 1;

                const satDownPlayers = table.players.filter(e=>e.isSatDown === true);

                table.turnIdx = Math.floor(Math.random(0, satDownPlayers.length))

                table.players.forEach(player => {
                    if (player.isSatDown) {
                        for (let i = 0; i < 2; i++) {
                            const card = drawASingleCard(table.id);
                            
                            if (card !== undefined) {
                                player.cards.push(card);
                            }
                        }
                    }
                })
            }
            
            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action sit_down
         * @param session_id
         * @param tableId
         */
         if (req.query.action === 'sit_down' && req.query?.session_id && req.query?.tableId) {
            const { success, table, player } = getTableAndPlayer(req.query.session_id)

            if (success && !table.started) {
                player.isSatDown = true;
            }

            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action join_a_table
         * @param session_id
         * @param tableId
         * @param displayName
         */
         if (req.query.action === 'join_a_table' && req.query?.session_id && req.query?.tableId && req.query?.displayName) {
            if (req.query.tableId.length > 0) {
                const { success } = getTableAndPlayer(req.query.session_id);

                if (!success) {
                    const table = getTable(req.query.tableId)

                    if (!table.started) {
                        table.players.push({
                            ...samplePlayer,
                            id: req.query.session_id,
                            table: req.query.tableId,
                            displayName: req.query.displayName
                        })
                    }
                }
            }

            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action create_a_table
         * @param session_id
         * @param displayName
         * @param tableName
         */
        if (req.query.action === 'create_a_table' && req.query?.session_id && req.query?.displayName && req.query?.tableName) {
            const { success } = getTableAndPlayer(req.query.session_id);

            if (!success) {
                createTable(req.query.session_id, req.query.displayName, req.query.tableName);
            }

            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action update_state
         * @param session_id
         */
        if (req.query.action === 'update_state' && req.query?.session_id) {
            const session_id = req.query.session_id;

            const { table, player } = getTableAndPlayer(session_id);

            res.json({
                success: true,
                pokerGame: {
                    tables: getRestrictedTablesArray(),
                    table: getRestrictedTableArray(table.id, req.query.session_id),
                    player: player,
                }
            })
        }

        /**
         * /---------------------- GET ----------------------/
         * If the player is not in an existing room, create a room for them.
         * If they are reconnecting, get the room they were in.
         * @action get_player_info_on_enter
         * @param session_id
         */
        if (req.query.action === 'get_player_info_on_enter' && req.query?.session_id) {
            const session_id = req.query.session_id;

            axios.get(`${process.env.HOME_URL}/api/postgre?action=check_if_logged_in&session_id=${session_id}`).then(postgreRes => {
                if (postgreRes.data?.success) {
                    res.json({
                        success: true,
                        displayName: postgreRes.data?.displayName,
                        session_id: postgreRes.data?.session_id,
                        credits: postgreRes.data?.credits,
                    })
                }
                else {
                    res.json({
                        success: false,
                    })
                }
            });
        }
    }
}
/**
 * ********************* END OF REQUEST HANDLER *********************
 */
