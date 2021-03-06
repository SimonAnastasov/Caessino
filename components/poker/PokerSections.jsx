import React from 'react'

import CardsInTheMiddle from './sections/CardsInTheMiddle'
import Chairs from './sections/Chairs'
import Messages from './sections/Messages'
import PlayButtons from './sections/PlayButtons'
import PickATable from './sections/PickATable'

import { useSelector } from 'react-redux'
import Pot from './sections/Pot'
import RaiseModal from './sections/RaiseModal'

const PokerSections = () => {
  const playerState = useSelector(state => state.player);

  if (playerState.pokerGame?.player?.table?.length > 0) {
    return (
      <>
          <Messages/>

          <Chairs/>

          <CardsInTheMiddle/>

          <Pot/>

          <PlayButtons/>

          <RaiseModal/>
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