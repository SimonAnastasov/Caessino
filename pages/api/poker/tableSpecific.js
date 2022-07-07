import { tables, deck } from './gameStates'

import { hands, getBestHandDetails } from './handEvaluations';

import axios from 'axios';

require('dotenv').config();

/**
 * Replace deck if empty
 */
export function checkDeckSize(tableId) {
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
export function drawASingleCard(tableId) {
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

export function getMaxBet(tableId) {
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

export function setNextPlayerIdx(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined && !tables[tableIdx].ended) {
        const table = tables[tableIdx];

        const remainingPlayers = table.players.filter(e=>e.isSatDown===true).filter(e=>e.isGhost===false);
        if (remainingPlayers.length === 1) {
            setWinnerDirect(table.id, remainingPlayers[0]);

            return ;
        }

        const remainingPlayersWithCredits = table.players.filter(e=>e.isSatDown===true).filter(e=>e.isGhost===false).filter(e=>e.isFolded===false).filter(e=>e.credits > 0);
        if (remainingPlayersWithCredits.length === 1) {
            progressRoundTillTheEnd(table.id);

            return ;
        }

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

            if (counter <= 0) {
                return ;
            }
        }
    }
}

export function getCardsOnTable(tableId) {
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

export function resetGame(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        table.started = false;
        table.ended = false;
        table.round = 0;
        table.turnIdx = -1;
        table.turnTimeout = null;
        table.pot = 0;
        table.lastBet = 20;
        table.turnsSinceLastBet = 0;
        table.deck = [...deck];

        table.players = table.players.filter(e=>e.isGhost === false).filter(e=>e.credits >= 20);

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

        table.onlyOnePlayerLeft = false;
        table.winners = [];
        table.splitWinners = false;
        table.cards = [];
    }
}

export function giveMoneyToTheWinners(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

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

export function setWinnerDirect(tableId, player) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        table.turnIdx = -1;
        table.started = false;
        table.ended = true;

        table.onlyOnePlayerLeft = true;
        table.winners = [player];

        giveMoneyToTheWinners(table.id);
    }
}

export function setWinner(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        table.turnIdx = -1;

        table.players.forEach(player => {
            if (player.isSatDown && !player.isFolded) {
                player.hand = getBestHandDetails(player.cards, table.cards);
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

export function progressRoundTillTheEnd(tableId) {
    const tableIdx = tables.map(e=>e.id).indexOf(tableId);

    if (tables[tableIdx] !== undefined) {
        const table = tables[tableIdx];

        while (table.round < 4) {
            table.round++;
            getCardsOnTable(table.id);
        }

        table.started = false;
        table.ended = true;
        if (table.ended && table.winners.length === 0) {
            setWinner(table.id);
        }
    }
}

export function progressRoundIfNeeded(tableId) {
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
                table.started = false;
                table.ended = true;
            }

            if (table.ended && table.winners.length === 0) {
                setWinner(table.id);
            }
        }
    }
}