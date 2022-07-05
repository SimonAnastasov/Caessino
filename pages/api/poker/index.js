import axios from 'axios';

require('dotenv').config();

import { v4 as uuidv4 } from 'uuid';

const sampleTable = {
    id: '',
    name: '',
    status: '_1_just_created',
    creator: '',
    started: false,
    ended: false,
    round: 0,
    turnIdx: -1,
    pot: 0,
    lastBet: 0,
    turnsSinceLastBet: 0,
    players: [],
    deck: [],
    cardsOnTable: [],
    winners: [],
    splitWinners: false,
    turnTimeout: null,
}

const samplePlayer = {
    id: '',
    table: '',
    status: '_1_just_entered',
    displayName: '',
    cards: [],
    hand: {
        hand: '',
        highCard: 0,
    },
    betAmount: 0,
    isSatDown: false,
    isCoordinator: false,
    isFolded: false,
    isGhost: false,
    credits: 0,
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

const deck = [...singleDeck];

/* We are using 5 decks */
// const deck = singleDeck.concat(singleDeck).concat(singleDeck).concat(singleDeck).concat(singleDeck);

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

function getMaxBet(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        let maxBet = 0;
        table.players.forEach(player => {
            if (player.betAmount > maxBet) {
                maxBet = player.betAmount;
            }
        })
        
        return maxBet;
    }
    
    return 0;
}

function setNextPlayerIdx(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        if (table.turnTimeout !== null) clearTimeout(table.turnTimeout);

        let counter = 10;

        while (true) {
            counter--;

            table.turnIdx++;
            table.turnIdx %= table.players.length;
            
            if (table.players[table.turnIdx] !== undefined && table.players[table.turnIdx].isSatDown && !table.players[table.turnIdx].isFolded) {
                if (table.round >= 2 && table.players[table.turnIdx].credits === 0) continue;

                let prevTurnIdx = table.turnIdx;
                table.turnTimeout = setTimeout(() => {
                    if (prevTurnIdx === table.turnIdx) {
                        if (table.players[table.turnIdx] !== undefined) {
                            table.players[table.turnIdx].isFolded = true;

                            setNextPlayerIdx(table.id);
                        }
                    }
                }, 30000);

                table.lastBet = getMaxBet(table.id) - table.players[table.turnIdx].betAmount;
                if (table.round === 1 && getMaxBet(table.id) <= 20) table.lastBet = 20;

                return ;
            }

            if (counter <= 0) return ;
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
        else if (table.round > 2) {
            const card = drawASingleCard(table.id);
                            
            if (card !== undefined) {
                table.cards.push(card);
            }
        }
    }
}

function resetGame(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        table.started = false;
        table.ended = false;
        table.round = 0;
        table.turnIdx = 0;
        table.turnTimeout = null;
        table.pot = 0;
        table.lastBet = 20;
        table.turnsSinceLastBet = 0;
        table.deck = [...deck];

        table.players = table.players.filter(e=>e.isGhost === false);

        table.players.forEach(player => {
            player.credits = 0;
            player.cards = [];
            player.isFolded = false;
            player.betAmount = 0;
            player.wonAmount = 0;
            player.hand = {
                hand: '',
                highCard: 0,
            }
        })
        table.winners = [];
        table.splitWinners = false;
        table.cards = [];
    }
}

function giveMoneyToTheWinners(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        const satDownPlayers = table.players.filter(e => e.isSatDown === true);
        const satDownCount = satDownPlayers.length;

        table.players.forEach(player => {
            let winnings = 0;
            if (table.winners.indexOf(player) !== -1) {
                // winner
                winnings = 0;
                table.players.forEach(tmpPlayer => {
                    winnings += Math.min(tmpPlayer.betAmount, player.betAmount);
                })

                axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${player.id}&credits=${winnings}&game=poker&outcome=won`).then(postgreRes => {
                    if (postgreRes.data?.success) {
                        player.credits = postgreRes.data?.credits;
                    }
                });
            }
            else {
                // loser
                winnings = player.betAmount;
                table.players.forEach(tmpPlayer => {
                    if (table.winners.indexOf(tmpPlayer) !== -1) {
                        winnings -= tmpPlayer.betAmount;
                    }
                })

                axios.get(`${process.env.HOME_URL}/api/postgre/?action=add_credits&session_id=${player.id}&credits=${winnings}&game=poker&outcome=lost`).then(postgreRes => {
                    if (postgreRes.data?.success) {
                        player.credits = postgreRes.data?.credits;
                    }
                });
            }

            player.wonAmount = winnings;
        })

        setTimeout(() => {
            resetGame(table.id);
        }, 15000);
    }
}

function setWinner(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        table.turnIdx = -1;

        table.players.forEach(player => {
            if (player.isSatDown && !player.isFolded) {
                player.hand = getHandDetails(player.cards.concat(table.cards))
            }
        })

        hands.forEach(hand => {
            const playerHands = table.players.filter(e=>e.hand.hand === hand);

            if (table.winners.length === 0) {
                if (playerHands.length === 1) {
                    table.winners.push(playerHands[0])
                }
                else if (playerHands.length > 1) {
                    let tmp = playerHands[0].hand.highCard;
                    let tmpWinners = [];

                    playerHands.forEach(player => {
                        if (player.hand.highCard > tmp) {
                            tmp = player.hand.highCard;
                        }
                    })

                    playerHands.forEach(player => {
                        if (player.hand.highCard === tmp) {
                            tmpWinners.push(player);
                        }
                    })

                    if (tmpWinners.length > 1) table.splitWinners = true;
                    table.winners = [...tmpWinners];
                }
            }
        })

        giveMoneyToTheWinners(table.id);
    }
}

function progressRoundIfNeeded(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        const satDownPlayers = table.players.filter(e=>e.isSatDown === true);
        const remainingPlayers = satDownPlayers.filter(e=>e.isFolded === false);

        if (table.turnsSinceLastBet === remainingPlayers.length) {
            table.round++;
            table.lastBet = 0;
            table.turnsSinceLastBet = 0;

            if (table.round <= 4) {
                getCardsOnTable(table.id);
            }
            else {
                table.ended = true;
            }

            if (table.ended && table.winners.length === 0) {
                setWinner(table.id);
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

            if (success && !table.started) {
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

                if (table.players[table.turnIdx] !== undefined && table.players[table.turnIdx] === player) {
                    setNextPlayerIdx(table.id);
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

const hands = [
    'Royal Flush',
    'Straight Flush',
    'Four of a Kind',
    'Full House',
    'Flush',
    'Straight',
    'Three of a Kind',
    'Two Pairs',
    'Pair',
    'High Card',
]

const order = "23456789TJQKA"
function getHandDetails(hand) {
    const cards = hand
    const faces = cards.map(a => String.fromCharCode([77 - order.indexOf(a[1])])).sort()
    const suits = cards.map(a => a[0]).sort()
    const counts = faces.reduce(count, {})
    const duplicates = Object.values(counts).reduce(count, {})
    const flush = suits[0] === suits[4]
    const first = faces[0].charCodeAt(1)
    const straight = faces.every((f, index) => f.charCodeAt(1) - first === index)
    let rank =
        (flush && straight && 1) ||
        (duplicates[4] && 2) ||
        (duplicates[3] && duplicates[2] && 3) ||
        (flush && 4) ||
        (straight && 5) ||
        (duplicates[3] && 6) ||
        (duplicates[2] > 1 && 7) ||
        (duplicates[2] && 8) ||
        9;

    return { hand: hands[rank], highCard: faces.sort(byCountFirst).join("") }

    function byCountFirst(a, b) {
        //Counts are in reverse order - bigger is better
        const countDiff = counts[b] - counts[a]
        if (countDiff) return countDiff // If counts don't match return
        return b > a ? -1 : b === a ? 0 : 1
    }

    function count(c, a) {
        c[a] = (c[a] || 0) + 1
        return c
    }
}

function getCardCombinations(playerCards, tableCards) {
    let combinations = [];

    combinations.push([playerCards[0], tableCards[0], tableCards[1], tableCards[2], tableCards[3]])
    combinations.push([playerCards[0], tableCards[0], tableCards[1], tableCards[2], tableCards[4]])

    combinations.push([playerCards[0], tableCards[0], tableCards[1], tableCards[4], tableCards[3]])
    combinations.push([playerCards[0], tableCards[0], tableCards[4], tableCards[2], tableCards[3]])
    combinations.push([playerCards[0], tableCards[4], tableCards[1], tableCards[2], tableCards[3]])

    
    combinations.push([playerCards[1], tableCards[0], tableCards[1], tableCards[2], tableCards[3]])
    combinations.push([playerCards[1], tableCards[0], tableCards[1], tableCards[2], tableCards[4]])

    combinations.push([playerCards[1], tableCards[0], tableCards[1], tableCards[4], tableCards[3]])
    combinations.push([playerCards[1], tableCards[0], tableCards[4], tableCards[2], tableCards[3]])
    combinations.push([playerCards[1], tableCards[4], tableCards[1], tableCards[2], tableCards[3]])


    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[1], tableCards[2]])
    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[1], tableCards[3]])
    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[1], tableCards[4]])

    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[2], tableCards[3]])
    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[2], tableCards[4]])
    combinations.push([playerCards[0], playerCards[1], tableCards[0], tableCards[3], tableCards[4]])

    combinations.push([playerCards[0], playerCards[1], tableCards[1], tableCards[2], tableCards[3]])
    combinations.push([playerCards[0], playerCards[1], tableCards[1], tableCards[2], tableCards[4]])
    combinations.push([playerCards[0], playerCards[1], tableCards[1], tableCards[3], tableCards[4]])

    combinations.push([playerCards[0], playerCards[1], tableCards[2], tableCards[3], tableCards[4]])


    return combinations;
}
