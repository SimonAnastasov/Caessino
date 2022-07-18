import React from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { setStyle } from '../redux/reducers/styleSlice';
import FreeflowCard from './FreeflowCard';
import Calculations from './admin/Calculations';

const GamesHistory = () => {
  const dispatch = useDispatch();

  const styleState = useSelector(state => state.style);
  
  function hideGamesHistoryScreen() {
    dispatch(setStyle({
      ...styleState.style,
        displayGamesHistoryScreen: false,
    }))
  }

  if (styleState.style.displayGamesHistoryScreen) {
    return (
        <div className="fullscreen top-to-bottom-centered gamesHistoryScreen">
            <div>
                <p className="link" onClick={() => hideGamesHistoryScreen()}>⬅ Go Back</p>

                <h3>These are all the games you&apos;ve played.</h3>

                <div className="liveGamesMegaContainer">
                <div className="liveBlackjackGames liveGamesContainer">
                    <h3>Blackjack Games:</h3>
                    { styleState.style.gamesHistory.blackjack?.rooms?.map((room, roomIdx) => (
                    <div key={room.id + roomIdx} className="liveBlackjackGame">
                        <div>
                        <div>
                            { room?.playerCards?.map((card, i) => (
                            <FreeflowCard key={`playercard${i}`} card={card}/>
                            ))}
                            <h5><Calculations action="calculateHandValue" cards={room.playerCards}/></h5>
                        </div>
                        <p>Player {room.displayName} (${parseInt(room.initialBet) + parseInt(room.sideBet)})</p>
                        </div>
                        <div>
                        <div>
                            <h6><span>Outcome:</span><br/>{room.outcome}</h6>
                            <h6><span>Side Bet Outcome:</span><br/>{room.sideBetOutcome}</h6>
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
                    <h3>Roulette Games:</h3>
                    { styleState.style.gamesHistory.roulette?.games?.map((game, gameIdx) => (
                        <div key={`roulettegame${gameIdx}`}>
                            <h6>
                                <span>Ball on number: </span>{game?.magicNumber}&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>Winning bets: </span>{game?.winningBets?.join(", ")}
                            </h6>
                            <h6 style={{marginTop: '2rem'}}><span>Players:</span></h6>
                            { game?.players?.map((player, i) => (
                                <div key={player.session_id} className="playerInLiveRouletteGame">
                                <div>
                                    <h6><span>Player {i+1} -&gt;</span></h6>
                                </div>
                                <div>
                                    <h6><span>{player.name} (${player.betAmount})</span></h6>
                                </div>
                                <div>
                                    <h6><span>Betted on: </span>{player.whichBets.join(", ")}</h6>
                                </div>
                                <div>
                                    <h6><span>Outcome: {player.outcome}</span></h6>
                                </div>
                                </div>
                            )) }
                        </div>
                    )) }
                </div>

                <div className="livePokerGames liveGamesContainer">
                    <h3>Poker Games:</h3>
                    { styleState.style.gamesHistory.poker?.tables?.map(table => (
                    <div key={table.id} className="livePokerGame">
                        <h6>
                        <span>Pot: </span>{table?.pot}&nbsp;&nbsp;&nbsp;&nbsp;
                        <span>Winners: </span>{table?.winners?.map(e=>e.displayName)?.join(", ")}
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
                            <h6><span>Player {player.displayName} (${player.betAmount})</span></h6>
                            </div>
                            <div className="cards">
                            { player?.cards?.map((card, i) => (
                                <FreeflowCard key={`playercard${i}`} card={card}/>
                            ))}
                            </div>
                            <div>
                            <h6><span>Hand: </span><Calculations action="getBestHandDetails" cards={player.cards} cards2={table.cards}/></h6>
                            </div>
                        </div>
                        ))}
                    </div>
                    )) }
                </div>
                </div>
            </div>
        </div>
    )}
    else {
        return <></>
    }
}

export default GamesHistory