import React from 'react'

import Head from 'next/head'

import PokerHeader from './PokerHeader'
import Loading from '../Loading'
import Alert from '../Alert'
import Notification from '../Notification'
import PokerSections from './PokerSections'

const Poker = () => {
  return (
    <div className="app pokerMainContainer" style={{backgroundImage: 'url("/images/poker-bg.jpg")'}}>
      <Head>
        <title>Caessino - Poker</title>
      </Head>

      <PokerSections/>

      <PokerHeader/>

      <Loading/>

      <Alert/>

      <Notification/>
    </div>
  )
}

export default Poker