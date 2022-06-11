import Header from '../components/Header'
import FullwidthText from '../components/FullwidthText'
import GameCircle from '../components/GameCircle'
import Loading from '../components/Loading'
import RegisterScreen from '../components/RegisterScreen'
import LoginScreen from '../components/LoginScreen'
import Alert from '../components/Alert'
import Notification from '../components/Notification'
import Stats from '../components/Stats'

import Head from 'next/head'

import { useDispatch } from 'react-redux'
import ManageCredits from '../components/ManageCredits'

export default function Home() {
  const dispatch = useDispatch();

  return (
    <div className="app" style={{backgroundImage: 'url("/images/bg.png")'}}>
      <Head>
        <title>Caessino</title>
      </Head>
  
      <Header/>
      
      <FullwidthText title="Welcome to Caessino" subtitle="Choose Your Game"/>

      <div className="gameCircles">
        <GameCircle src={"/images/blackjack.png"} text="Play Blackjack" routeTo="/games/blackjack" game="Blackjack"/>
        <GameCircle src={"/images/roulette.png"} text="Play Roulette" routeTo="/games/roulette" game="Roulette"/>
        <GameCircle src={"/images/poker.png"} text="Play Poker" routeTo="/games/poker" game="Poker"/>
      </div>

      <Loading/>

      <RegisterScreen/>

      <LoginScreen/>

      <Alert/>

      <Notification/>

      <Stats/>

      <ManageCredits/>
    </div>
  )
}
