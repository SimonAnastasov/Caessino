import React from 'react'

import Header from '../../components/Header'
import FullwidthText from '../../components/FullwidthText'

import Head from 'next/head'

const poker = () => {
  return (
    <div className="app">
      <Head>
        <title>Caessino - Poker</title>
      </Head>
  
      <Header main="false"/>
      <FullwidthText title="Poker" subtitle="Under Construction..."/>
    </div>
  )
}

export default poker