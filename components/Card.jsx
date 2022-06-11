import React from 'react'

const Card = ( { card, pos, rotateZ } ) => {
    const src = `/cards/${card}.png`;

    return (
      <div className="card" style={{backgroundImage: `url("${src}")`, left: `${pos?.left}vw`, top: `${pos?.top}vh`, transform: `translate(-50%, -50%) rotateZ(${rotateZ}deg)`}}>
        
      </div>
    )
}

export default Card