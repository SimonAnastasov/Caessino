import React from 'react'

import { ArcText } from '@arctext/react'

import { useRouter } from 'next/router'

import { useState } from 'react'

import { setInGame } from '../redux/reducers/playerSlice'
import { useDispatch } from 'react-redux'
import FullwidthText from './FullwidthText'

const GameCircle = ( { src, text, routeTo, game } ) => {
  const router = useRouter()

  function clicked() {
    router.push(routeTo)
  }

  return (
    <div className="gameCircle" onClick={() => clicked()}>
        <div className="circleLarge">
            <div className="circle" style={{backgroundImage: `url('${src}')`}}>

            </div>
        </div>
        <h3>
            <ArcText
                text={text}
                upsideDown
                width={600}
                characterWidth={4.8}
                style={{color: 'white',
                        position: 'relative',
                        transform: 'rotateZ(180deg) scaleX(-1)',
                        marginTop: '30px',
                        fontSize: '1.6rem',
                        color: '#FFD700',
                        fontWeight: 'bold'
                }}
            />
        </h3>
    </div>
  )
}

export default GameCircle