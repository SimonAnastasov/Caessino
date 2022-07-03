import React from 'react'

import Cards from './sections/Cards'
import CardsInTheMiddle from './sections/CardsInTheMiddle'
import Chairs from './sections/Chairs'
import Messages from './sections/Messages'
import PlayButtons from './sections/PlayButtons'
import PickATable from './sections/PickATable'

import { useSelector, useDispatch } from 'react-redux'

const PokerSections = () => {
  const playerState = useSelector(state => state.player);

  if (playerState.pokerGame.player.table.length > 0) {
    return (
      <>
          <Messages/>

          <Chairs/>

          <Cards/>

          <CardsInTheMiddle/>

          <PlayButtons/>
      </>
    )
  }
  else {
    return (
      <>
        <PickATable/>
      </>
    )
  }
}

export default PokerSections