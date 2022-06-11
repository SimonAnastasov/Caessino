import Head from 'next/head'

import Header from '../components/Header'
import FullwidthText from '../components/FullwidthText'
import GameCircle from '../components/GameCircle'
import Loading from '../components/Loading'
import RegisterScreen from '../components/RegisterScreen'
import LoginScreen from '../components/LoginScreen'
import Alert from '../components/Alert'
import Notification from '../components/Notification'
import Stats from '../components/Stats'
import ManageCredits from '../components/ManageCredits'

export default function Home() {
  return (
    <div className="app" style={{backgroundImage: 'url("/images/bg.png")'}}>
      <Head>
        <meta charSet="utf-8"/>
        <meta name="description" content="Enjoy your stay at Caessino (The best E-Casino out there!). Play Blackjack, Roulette or Poker and win huge prizes!"/>
        <meta name="keywords" content="caessino, e-casino, casino, blackjack, roulette, poker"/>

        <meta name="author" content="ESS" />
        <meta name="copyright" content="ESS CORP" />

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
