import axios from 'axios';

require('dotenv').config();

import { v4 as uuidv4 } from 'uuid';

import { tables, deck, sampleTable, samplePlayer } from './gameStates'

import { drawASingleCard, setNextPlayerIdx, progressRoundIfNeeded } from './tableSpecific'

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
        ended: false,
        round: 0,
        turnIdx: -1,
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

function getRestrictedTableArray(tableId, session_id) {
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

function getTable(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tableIdx !== -1) {
        return tables[tableIdx];
    }

    return undefined;
}

function getTableAndPlayer(session_id) {
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

            if (success && table.started && !table.ended && player.isSatDown && !player.isFolded) {
                if (table.players.map(e=>e.id).indexOf(req.query.session_id) !== table.turnIdx) {
                    res.end();
                    return ;
                }

                let okayToGo = false;

                if (req.query.specificAction === 'check') {
                    if (table.lastBet === 0) {
                        table.turnsSinceLastBet++;
                        okayToGo = true;
                        
                        progressRoundIfNeeded(table.id);
                    }
                }
                else if (req.query.specificAction === 'call') {
                    await axios.get(`${process.env.HOME_URL}/api/postgre/?action=take_credits&session_id=${req.query.session_id}&credits=${table.lastBet}&takeWhatYouCan=true`).then(postgreRes => {
                        if (postgreRes.data?.success) {
                            player.credits = postgreRes.data?.credits;

                            if (player.credits >= table.lastBet)
                                player.betAmount += table.lastBet;
                            else
                                player.betAmount += player.credits;
                                
                            table.pot += table.lastBet;
                            table.turnsSinceLastBet++;
                            okayToGo = true;
        
                            progressRoundIfNeeded(table.id);
                        }
                    });
                }
                else if (req.query.specificAction === 'raise') {
                    const betAmount = parseInt(req.query.betAmount);

                    if (betAmount >= table.lastBet) {
                        await axios.get(`${process.env.HOME_URL}/api/postgre/?action=take_credits&session_id=${req.query.session_id}&credits=${betAmount}&takeWhatYouCan=true`).then(postgreRes => {
                            if (postgreRes.data?.success) {
                                player.credits = postgreRes.data?.credits;

                                player.betAmount += betAmount;
                                table.pot += betAmount;
                                table.turnsSinceLastBet = 1;
                                okayToGo = true;
                                
                                progressRoundIfNeeded(table.id);
                            }
                        });
                    }
                }
                else if (req.query.specificAction === 'fold') {
                    player.isFolded = true;
                    okayToGo = true;

                    progressRoundIfNeeded(table.id);
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

            if (success && !table.started && !table.ended && table.players.filter(e=>e.isSatDown===true).length >= 2) {
                table.players.forEach(player => {
                    axios.get(`${process.env.HOME_URL}/api/postgre/?action=check_if_logged_in&session_id=${player.id}`).then(postgreRes => {
                        if (postgreRes.data?.success) {
                            player.credits = postgreRes.data?.credits;
                        }
                    });
                })

                table.started = true;
                table.round = 1;

                table.turnIdx = Math.floor(Math.random(0, table.players.length))
                setNextPlayerIdx(table.id);

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
         * @action leave_table
         * @param session_id
         */
         if (req.query.action === 'leave_table' && req.query?.session_id) {
            const { success, table, player } = getTableAndPlayer(req.query.session_id);

            if (success) {
                player.isGhost = true;
                player.isFolded = true;

                if (table.started) {
                    if (table.players[table.turnIdx] !== undefined && table.players[table.turnIdx] === player) {
                        setNextPlayerIdx(table.id);
                    }
                }
                else {
                    table.players = table.players.filter(e=>e.isGhost === false);
                }
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

                    if (table !== undefined && !table.started) {
                        table.players.push({
                            id: req.query.session_id,
                            table: req.query.tableId,
                            credits: 0,
                            status: '_1_just_entered',
                            displayName: req.query.displayName,
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

            const { success, table, player } = getTableAndPlayer(session_id);

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
