import axios from 'axios';

require('dotenv').config();

import { createTable, getRestrictedTablesArray, getRestrictedTableArray, getTable, getTableAndPlayer } from './gameStates';

import { drawASingleCard, setNextPlayerIdx, progressRoundIfNeeded } from './tableSpecific'

import { update_tables_to_database } from '../postgre/index'

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
                    table.lastActivity = Date.now();
                    setNextPlayerIdx(table.id);
                }
            }
            
            update_tables_to_database();

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

                table.lastActivity = Date.now();
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

            update_tables_to_database();
            
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

            update_tables_to_database();

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
                table.lastActivity = Date.now();
                
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

            update_tables_to_database();

            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action join_a_table
         * @param session_id
         * @param tableId
         * @param displayName
         * @param username
         */
         if (req.query.action === 'join_a_table' && req.query?.session_id && req.query?.tableId && req.query?.displayName && req.query?.username) {
            if (req.query.tableId.length > 0) {
                const { success } = getTableAndPlayer(req.query.session_id);

                if (!success) {
                    const table = getTable(req.query.tableId)

                    if (table !== undefined && !table.started) {
                        table.players.push({
                            id: req.query.session_id,
                            table: req.query.tableId,
                            username: req.query.username,
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

            update_tables_to_database();

            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Creates the table and enters the user inside
         * @action create_a_table
         * @param session_id
         * @param displayName
         * @param tableName
         * @param username
         */
        if (req.query.action === 'create_a_table' && req.query?.session_id && req.query?.displayName && req.query?.tableName && req.query?.username) {
            const { success } = getTableAndPlayer(req.query.session_id);

            if (!success) {
                createTable(req.query.session_id, req.query.displayName, req.query.tableName, req.query.username);
            }

            update_tables_to_database();

            res.end();
        }

        /**
         * /---------------------- GET ----------------------/
         * Updates the state periodically
         * @action update_state
         * @param session_id
         */
        if (req.query.action === 'update_state' && req.query?.session_id) {
            const session_id = req.query.session_id;

            const { success, table, player } = getTableAndPlayer(session_id);

            if (success && table.started && !table.ended) {
                const d = Date.now();

                if (d - table.lastActivity > 30000) {
                    if (table.players[table.turnIdx] !== undefined) {
                        table.players[table.turnIdx].isFolded = true;

                        table.lastActivity = Date.now();
                        setNextPlayerIdx(table.id);
                        
                        update_tables_to_database();
                    }
                }
            }

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
                        username: postgreRes.data?.username,
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
