import React from 'react'

import InGameHeader from '../../components/InGameHeader'

import Head from 'next/head'
import PlayButtons from '../../components/blackjack/PlayButtons'
import Cards from '../../components/blackjack/Cards'
import DisplayBet from '../../components/blackjack/DisplayBet'
import Loading from '../Loading'
import Alert from '../Alert'
import Notification from '../Notification'

const Blackjack = () => {
  return (
    <div className="app" style={{backgroundImage: 'url("/images/blackjack-bg.png")', backgroundPosition: '0% 30%'}}>
      <Head>
        <title>Caessino - Blackjack</title>
      </Head>
  
      <InGameHeader/>

      <PlayButtons/>

      <Cards/>

      <DisplayBet/>

      <Loading/>

      <Alert/>

      <Notification/>
    </div>
  )
}

export default Blackjack