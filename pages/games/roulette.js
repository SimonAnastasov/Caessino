import React from 'react'

import Header from '../../components/Header'
import FullwidthText from '../../components/FullwidthText'

import Head from 'next/head'

const roulette = () => {
  return (
    <div className="app">
      <Head>
        <title>Caessino - Roulette</title>
      </Head>
  
      <Header main="false"/>
      <FullwidthText title="Roulette" subtitle="Under Construction..."/>
    </div>
  )
}

export default roulette