import React from 'react'

import { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux'

import axios from 'axios';
import { setAdminInformation } from '../../redux/reducers/adminInformationSlice';
import { setAdmin } from '../../redux/reducers/adminSlice';
import FreeflowCard from '../FreeflowCard';
import Calculations from './Calculations';

const LiveGames = () => {
  const dispatch = useDispatch();

  const adminState = useSelector(state => state.admin);
  const adminInformationState = useSelector(state => state.adminInformation);

  useEffect(() => {
    let interval = setInterval(() => {
      axios.get(`/api/postgre?action=get_live_games_as_admin&admin_id=${localStorage.CAESSINO_ADMIN_ID}`).then(res => {
        if (res.data?.success) {
          dispatch(setAdminInformation({
            ...adminInformationState.adminInformation,
            liveGames: {
              blackjack: {
                rooms: res.data?.blackjack,
              },
              roulette: res.data?.roulette,
              poker: {
                tables: res.data?.poker,
              },
            }
          }))
        }
      })
    }, 1000);

    return () => {
      if (interval !== null) clearInterval(interval);
  };
  }, [])
  
  function hideLiveGamesScreen() {
    dispatch(setAdmin({
      ...adminState.admin,
      displays: {
        ...adminState.admin.displays,
        liveGamesScreen: false,
      }
    }))
  }

  return (
    <div className="fullscreen top-to-bottom-centered admin liveGamesScreen">
      <div>
        <p className="link" onClick={() => hideLiveGamesScreen()}>⬅ Go Back</p>

        <h3>These are the current live games.</h3>

        <div className="liveGamesMegaContainer">
          <div className="liveBlackjackGames liveGamesContainer">
            <h3>Live BLackjack Games:</h3>
            { adminInformationState.adminInformation.liveGames.blackjack?.rooms?.map(room => (
              <div key={room.id} className="liveBlackjackGame">
                <div>
                  <div>
                    { room?.playerCards?.map((card, i) => (
                      <FreeflowCard key={`playercard${i}`} card={card}/>
                    ))}
                    <h5><Calculations action="calculateHandValue" cards={room.playerCards}/></h5>
                  </div>
                  <p>Player {room?.displayName} (${parseInt(room.initialBet) + parseInt(room.sideBet)})</p>
                </div>
                <div>
                  <div>
                      <h6><span>Status:</span><br/>{room.status}</h6>
                      { room?.outcome?.length > 0 && <h6><span>Outcome:</span><br/>{room.outcome}</h6> }
                      { room?.sideBetOutcome?.length > 0 && <h6><span>Side Bet Outcome:</span><br/>{room.sideBetOutcome}</h6> }
                  </div>
                </div>
                <div>
                  <div>
                    <h5><Calculations action="calculateHandValue" cards={room.dealerCards}/></h5>
                    { room?.dealerCards?.map((card, i) => (
                      <FreeflowCard key={`dealercard${i}`} card={card}/>
                    ))}
                  </div>
                  <p>Dealer {room.dealerName}</p>
                </div>
              </div>
            )) }
          </div>

          <div className="liveRouletteGame liveGamesContainer">
            <h3>Live Roulette Game:</h3>
            <div>
              <h6>
                <span>Status: </span>{adminInformationState.adminInformation?.liveGames?.roulette?.status}&nbsp;&nbsp;&nbsp;&nbsp;
                <span>Time to start: </span>{adminInformationState.adminInformation?.liveGames?.roulette?.timeToStart}&nbsp;&nbsp;&nbsp;&nbsp;
                { adminInformationState.adminInformation?.liveGames?.roulette?.magicNumber != -1 && <><span>Ball on number: </span>{adminInformationState.adminInformation?.liveGames?.roulette?.magicNumber}&nbsp;&nbsp;&nbsp;&nbsp;</> }
                { adminInformationState.adminInformation?.liveGames?.roulette?.magicNumber != -1 && <><span>Winning bets: </span>{adminInformationState.adminInformation?.liveGames?.roulette?.winningBets?.join(", ")}</> }
              </h6>
              <h6 style={{marginTop: '2rem'}}><span>Players:</span></h6>
              { adminInformationState.adminInformation?.liveGames?.roulette?.players?.map((player, i) => (
                <div key={player.session_id} className="playerInLiveRouletteGame">
                  <div>
                    <h6><span>Player {i+1} -&gt;</span></h6>
                  </div>
                  <div>
                    <h6><span>{player.name} (${player?.betAmount})</span></h6>
                  </div>
                  <div>
                    { player?.whichBets?.length > 0 && <h6><span>Betted on: </span>{player?.whichBets?.join(", ")}</h6> }
                  </div>
                  <div>
                    { adminInformationState.adminInformation?.liveGames?.roulette?.magicNumber != -1 && player?.whichBets?.length > 0 && <h6><span>Outcome: </span>{player.outcome}</h6> }
                  </div>
                </div>
              )) }
            </div>
          </div>

          <div className="livePokerGames liveGamesContainer">
            <h3>Live Poker Games:</h3>
            { adminInformationState.adminInformation.liveGames.poker?.tables?.map(table => (
              <div key={table.id} className="livePokerGame">
                <h6>
                  <span>Round: </span>{table?.round}/4&nbsp;&nbsp;&nbsp;&nbsp;
                  <span>Started: </span>{table?.started}&nbsp;&nbsp;&nbsp;&nbsp;
                  <span>Player on turn: </span>{table.players[table.turnIdx]?.displayName ?? '-'}&nbsp;&nbsp;&nbsp;&nbsp;
                  <span>Pot: </span>${table?.pot}&nbsp;&nbsp;&nbsp;&nbsp;
                  { table?.winners?.length > 0 && <><span>Winners: </span>{table?.winners?.map(e=>e?.displayName)?.join(", ")}</> }
                </h6>
                <div className="cardsOnTable" style={{marginTop: '2rem'}}>
                  { table?.cards?.map((card, i) => (
                    <FreeflowCard key={`tablecard${i}`} card={card}/>
                  ))}
                </div>
                <h6 style={{marginTop: '2rem'}}><span>Players:</span></h6>
                {table.players?.map(player => (
                  <div key={player.id} className="playerInLivePokerGame">
                    <div>
                      <h6><span>Player {player?.displayName} (${player.betAmount})</span></h6>
                    </div>
                    <div className="cards">
                      { player?.cards?.map((card, i) => (
                        <FreeflowCard key={`playercard${i}`} card={card}/>
                      ))}
                    </div>
                    <div>
                      { table?.cards?.length > 0 && <h6><span>Hand: </span><Calculations action="getBestHandDetails" cards={player.cards} cards2={table.cards}/></h6> }
                    </div>
                  </div>
                ))}
              </div>
            )) }
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveGames