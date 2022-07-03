import React from 'react'

import { useSelector } from 'react-redux'
import FreeflowCard from '../../FreeflowCard';

const CardsInTheMiddle = () => {
    const playerState = useSelector(state => state.player);

    return (
      <div className='cardsInTheMiddleContainer'>
          {playerState?.pokerGame?.table.cards?.map((card, i) => (
            <FreeflowCard key={card + i} card={card}/>
          ))}
      </div>
    )
}

export default CardsInTheMiddle