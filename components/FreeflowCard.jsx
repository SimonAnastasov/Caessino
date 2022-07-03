import React from 'react'

const FreeflowCard = ( { card } ) => {
    const src = `/cards/${card}.png`;

    return (
      <div className="card" style={{backgroundImage: `url("${src}")`}}>
        
      </div>
    )
}

export default FreeflowCard