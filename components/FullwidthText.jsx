import React from 'react'

import { useSelector } from 'react-redux'

const FullwidthText = ({title, subtitle}) => {
  const playerState = useSelector(state => state.player);

  return (
    <div className="fullwidthText">
      <h1>{title}, {playerState.player.displayName}</h1>
      <h3>{subtitle}</h3>
   </div>
  )
}

export default FullwidthText