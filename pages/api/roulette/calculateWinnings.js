export function getWinningBets(magicNumber) {
    let winningBets = [];
    winningBets.push(magicNumber);
    
    if (magicNumber != 0) {
        if ((magicNumber <= 9 && magicNumber % 2 == 1) || (magicNumber > 10 && magicNumber <= 18 && magicNumber % 2 == 0) ||
            (magicNumber > 19 && magicNumber <= 27 && magicNumber % 2 == 1) || (magicNumber > 27 && magicNumber % 2 == 0)) {

            winningBets.push('Red');
        }
        else {
            winningBets.push('Black');
        }

        if (magicNumber % 2 === 0)      winningBets.push('Even');
        else                            winningBets.push('Odd');

        if (magicNumber <= 12)          winningBets.push('1-12');
        else if (magicNumber <= 24)     winningBets.push('13-24');
        else                            winningBets.push('25-36');

        if (magicNumber <= 18)          winningBets.push('1-18');
        else                            winningBets.push('19-36');

        if (magicNumber % 3 === 0)      winningBets.push('Remainder3');
        else if (magicNumber % 3 === 2) winningBets.push('Remainder2');
        else                            winningBets.push('Remainder1');
    }

    return winningBets;
}

export function calculateWinnings(player) {
    if (player.outcome === 'lost') return 0;

    let bets = player.whichBets;
    let bet = player.betAmount;

    if (bets[0] === 'Even' || bets[0] === 'Odd') return 2 * bet;
    else if (bets[0] === 'Red' || bets[0] === 'Black') return 2 * bet;
    else if (bets[0].includes('Remainder')) return 3 * bet;
    else if (bets[0] === '1-12' || bets[0] === '13-24' || bets[0] === '25-36') return 3 * bet;
    else if (bets[0] === '1-18' || bets[0] === '19-36') return 2 * bet;
    else if (bets.length === 4) return 9 * bet;
    else if (bets.length === 2) return 18 * bet;
    else if (bets.length === 1) return 36 * bet;

    return 0;
}