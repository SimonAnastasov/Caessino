import React from 'react'

import { useSelector } from 'react-redux'

import Card from '../Card'

const Cards = () => {
  const playerState = useSelector(state => state.player)

  let playerPos = {
    left: 50,
    top: 75.5
  }

  let dealerPos = {
    left: 50,
    top: 32,
  }

  const splitCardsMultiplyByInt = 2;

  return (
    <div className="blackjackCards">
      {playerState?.game?.playerCards?.map((card, i) => (
        <Card key={card} card={card} rotateZ={i*splitCardsMultiplyByInt} pos={{left: playerPos.left+i*splitCardsMultiplyByInt, top: playerPos.top}}/>
      ))}
      {playerState?.game?.dealerCards?.map((card, i) => (
        <Card key={card} card={card} rotateZ={i*splitCardsMultiplyByInt} pos={{left: dealerPos.left+i*splitCardsMultiplyByInt, top: dealerPos.top}}/>
      ))}
    </div>
  )
}

export default Cards