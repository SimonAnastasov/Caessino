import React from 'react'

import BetModal from './BetModal';
import BetsImage from './BetsImage';
import CoinOnTable from './CoinOnTable';
import PlayersDisplay from './PlayersDisplay';
import Timer from './Timer';

const Sections = () => {

  return (
    <>
        <p className="rouletteInfoText">Please click on the number(s) you wish to bet on and select the amount you&apos;ll bet.<br/>Then, wait for the timer to go down to 0, and the wheel will spin. Best of luck 🍀</p>

        <BetsImage/>

        <CoinOnTable/>

        <img id="rouletteWheelImg" src="/images/roulette-wheel.png" alt="Roulette wheel"/>

        <PlayersDisplay/>

        <Timer/>

        <BetModal/>
    </>
  )
}

export default Sections