import React from 'react'

import Head from 'next/head'

import BlackjackHeader from './BlackjackHeader'
import PlayButtons from '../../components/blackjack/PlayButtons'
import Cards from '../../components/blackjack/Cards'
import DisplayBet from '../../components/blackjack/DisplayBet'
import Loading from '../Loading'
import Alert from '../Alert'
import Notification from '../Notification'
import LostConnection from '../LostConnection'

const Blackjack = () => {
  return (
    <div className="app blackjackMainContainer" style={{backgroundImage: 'url("/images/blackjack-bg.png")', backgroundPosition: '0% 30%'}}>
      <Head>
        <title>Caessino - Blackjack</title>
      </Head>
  
      <BlackjackHeader/>

      <PlayButtons/>

      <Cards/>

      <DisplayBet/>

      <Loading/>

      <Alert/>

      <Notification/>

      <LostConnection/>
    </div>
  )
}

export default Blackjack