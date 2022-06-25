import React from 'react'

import Head from 'next/head'

import RouletteHeader from './RouletteHeader'
import Loading from '../Loading'
import Alert from '../Alert'
import Notification from '../Notification'
import Sections from './Sections'

const Roulette = () => {
  return (
    <div className="app rouletteMainContainer">
      <Head>
        <title>Caessino - Roulette</title>
      </Head>

      <RouletteHeader/>

      <Sections/>

      <Loading/>

      <Alert onTop="true"/>

      <Notification/>
    </div>
  )
}

export default Roulette