import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';

require('dotenv').config();

const crypto = require('crypto');

import { progressRoundTillTheEnd } from '../poker/tableSpecific';

const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DB}`
});

export default function handler(req, res) {
  /**
   * GET method
   */
  if (req.method === 'GET') {
    /**
     * /---------------------- GET ----------------------/
     * If the player won credits, update them in the database.
     * Also, update the stats in the database.
     * @action give_credits
     * @param session_id
     * @param credits
     */
    if (req.query?.action === 'add_credits' && req.query?.session_id && req.query?.credits) {
      const session_id = req.query.session_id
      const session = sessions.find(session => session.id === session_id)

      if (session) {
        session.lastActivity = Date.now();

        if (parseInt(req.query.credits) > 0) {
          session.credits = session.credits + parseInt(req.query.credits)

          pool.query('UPDATE players SET credits = $1 WHERE username = $2', [session.credits, session.username], (error, results) => {
            if (error) throw error;
          });
        }

        if (req.query?.dont_update_stats) {
          // continue
        } else {
          pool.query('SELECT * FROM stats WHERE username = $1', [session.username], (error, results) => {
            if (error) throw error;

            if (results.rows.length > 0) {
              const stats = results.rows[0]

              if (parseInt(req.query.credits) > 0) {
                pool.query('UPDATE stats SET money_earned = $1 WHERE username = $2', [parseInt(stats.money_earned) + parseInt(req.query.credits), session.username], (error, results) => {
                  if (error) throw error;
                });
              }

              if (req.query?.game === 'blackjack') {
                if (req.query?.outcome === 'player_busted' || req.query?.outcome === 'player_lost') {
                  pool.query('UPDATE stats SET blackjack_games = $1 WHERE username = $2', [parseInt(stats.blackjack_games) + 1, session.username], (error, results) => {
                    if (error) throw error;
                  });
                }
                else if (req.query?.outcome === 'dealer_busted' || req.query?.outcome === 'player_won') {
                  pool.query('UPDATE stats SET blackjack_games = $1, blackjack_won_games = $2 WHERE username = $3', [parseInt(stats.blackjack_games) + 1, parseInt(stats.blackjack_won_games) + 1, session.username], (error, results) => {
                    if (error) throw error;
                  });
                }
              }
              else if (req.query?.game === 'roulette') {
                if (req.query?.outcome === 'lost') {
                  pool.query('UPDATE stats SET roulette_games = $1 WHERE username = $2', [parseInt(stats.roulette_games) + 1, session.username], (error, results) => {
                    if (error) throw error;
                  });
                }
                else if (req.query?.outcome === 'won') {
                  pool.query('UPDATE stats SET roulette_games = $1, roulette_won_games = $2 WHERE username = $3', [parseInt(stats.roulette_games) + 1, parseInt(stats.roulette_won_games) + 1, session.username], (error, results) => {
                    if (error) throw error;
                  });
                }
              }
              else if (req.query?.game === 'poker') {
                if (req.query?.outcome === 'lost') {
                  pool.query('UPDATE stats SET poker_games = $1 WHERE username = $2', [parseInt(stats.poker_games) + 1, session.username], (error, results) => {
                    if (error) throw error;
                  });
                }
                else if (req.query?.outcome === 'won') {
                  pool.query('UPDATE stats SET poker_games = $1, poker_won_games = $2 WHERE username = $3', [parseInt(stats.poker_games) + 1, parseInt(stats.poker_won_games) + 1, session.username], (error, results) => {
                    if (error) throw error;
                  });
                }
              }
            }
          });
        }

        update_sessions_to_database();
          
        res.json({
          success: true,
          credits: session.credits,
        })

        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * The player lost credits, update this in the database.
     * @action take_credits
     * @param session_id
     * @param credits
     */
    if (req.query?.action === 'take_credits' && req.query?.session_id && req.query?.credits) {
      const session_id = req.query.session_id
      const session = sessions.find(session => session.id === session_id)

      let takeWhatYouCan = false;
      if (req.query?.takeWhatYouCan === "true") takeWhatYouCan = true;

      if (session) {
        session.lastActivity = Date.now();

        if (session.credits < parseInt(req.query.credits)) {
          if (takeWhatYouCan) {
            session.credits = 0;
          }
          else {
            res.json({
              success: false,
            });

            return ;
          }
        }
        else {
          session.credits = session.credits - parseInt(req.query.credits)
        }

        pool.query('UPDATE players SET credits = $1 WHERE username = $2', [session.credits, session.username], (error, results) => {
          if (error) throw error;
        });

        pool.query('SELECT * FROM stats WHERE username = $1', [session.username], (error, results) => {
          if (error) throw error;

          if (results.rows.length > 0) {
            const stats = results.rows[0]

            pool.query('UPDATE stats SET money_bet = $1 WHERE username = $2', [parseInt(stats.money_bet) + parseInt(req.query.credits), session.username], (error, results) => {
              if (error) throw error;
            });
          }
        });

        update_sessions_to_database();

        res.json({
          success: true,
          credits: session.credits,
        })
        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * Get stats for the player, so we can display them in the front end.
     * @action get_stats
     * @param session_id
     */
    if (req.query?.action === 'get_stats' && req.query?.session_id) {
      const session_id = req.query.session_id
      const session = sessions.find(session => session.id === session_id)

      if (session) {
        session.lastActivity = Date.now();

        pool.query('SELECT * FROM stats WHERE username = $1', [session.username], (error, results) => {
          if (error) throw error;

          if (results.rows.length > 0) {
            res.json({
              success: true,
              stats: results.rows[0],
            })
          }
          else {
            res.json({
              success: false,
            })
          }
        });
        
        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * Checks if the player is logged in, and returns his session if so.
     * @action check_if_logged_in
     * @param session_id
     */
     if (req.query?.action === 'check_if_logged_in' && req.query?.session_id) {
      const session_id = req.query.session_id
      const session = sessions.find(session => session.id === session_id)

      if (session) {
        res.json({
          success: true,
          displayName: session.displayName,
          session_id: session.id,
          credits: session.credits,
        })
        return ;
      }

      res.json({
        success: false,
      })
    }

    /**
     * /---------------------- GET ----------------------/
     * Takes the credits in the player's session, and updates the database.
     * Logs the player out and kills the session.
     * @action logout
     * @param session_id
     */
    if (req.query?.action === 'logout' && req.query?.session_id) {
      const session_id = req.query.session_id
      const session = sessions.find(session => session.id === session_id)

      if (session) {
        pool.query('UPDATE players SET credits = $1 WHERE username = $2', [session.credits, session.username], (error, results) => {
          if (error) throw error;
        });

        sessions.splice(sessions.indexOf(session), 1);

        axios.get(`${process.env.HOME_URL}/api/blackjack/?action=remove_room&session_id=${session_id}`);

        update_sessions_to_database();
      }

      res.json({
        success: true,
        message: 'Successfully logged out',
      })
    }
  }

  /**
   * POST method
   */
  if (req.method === 'POST') {
    const { body } = req;

    /**
     * /---------------------- POST ----------------------/
     * Checks if the entered account info is good, and registers a new user in the database if so.
     * @action register
     * @param username
     * @param displayName
     * @param password
     */
    if (body?.action === 'register') {
      // checks
      if (body?.username == "undefined" || body?.username == "null" || body?.username == "") {
        res.json({
          success: false,
          message: 'Username is required',
        });
        return ;
      }
      if (/[^a-zA-Z]/g.test(body?.username)) {
        res.json({
          success: false,
          message: 'Username must contain only letters',
        })
        return ;
      }
      if (body?.displayName == "undefined" || body?.displayName == "null" || body?.displayName == "") {
        res.json({
          success: false,
          message: 'Display name is required',
        });
        return ;
      }
      if (body?.displayName?.toLowerCase() === "guest") {
        res.json({
          success: false,
          message: 'Display name cannot be guest',
        });
        return ;
      }
      if (body?.password == "undefined" || body?.password == "null" || body?.password == "") {
        res.json({
          success: false,
          message: 'Password is required',
        });
        return ;
      }

      // everything's okay
      body.username = body.username.toLowerCase()

      // hash password
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto.pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex');

      // check if user already exists
      pool.query('SELECT * FROM users WHERE username = $1', [body.username], (error, results) => {
        if (error) throw error;

        if (results.rows.length > 0) {
          res.json({
            success: false,
            message: 'Username already exists',
          });
          return ;
        }

        // store user in database
        pool.query('INSERT INTO users (username, password, salt) VALUES ($1, $2, $3)', [body.username, hashedPassword, salt], (error, usersResults) => {
          if (error) throw error;

          pool.query('INSERT INTO players (username, display_name, credits) VALUES ($1, $2, $3)', [body.username, body.displayName, 1000], (error, playersResults) => {
            if (error) throw error;

            pool.query('INSERT INTO stats (username, blackjack_games, roulette_games, poker_games, blackjack_won_games, roulette_won_games, poker_won_games, money_bet, money_earned) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [body.username, 0, 0, 0, 0, 0, 0, 0, 0], (error, statsResults) => {
              if (error) throw error;

              res.json({
                success: true,
                message: 'Registration successful',
              });
              return ;
            });
          });
        });
      });
    }

    /**
     * /---------------------- POST ----------------------/
     * Checks if the entered account info is good, and logs the user in if so.
     * @action login
     * @param username
     * @param password
     */
    if (body?.action === 'login') {
      // checks
      if (body?.username == "undefined" || body?.username == "null" || body?.username == "") {
        res.json({
          success: false,
          message: 'Username is required',
        });
        return ;
      }
      if (/[^a-zA-Z]/g.test(body?.username)) {
        res.json({
          success: false,
          message: 'Username must contain only letters',
        })
        return ;
      }
      if (body?.password == "undefined" || body?.password == "null" || body?.password == "") {
        res.json({
          success: false,
          message: 'Password is required',
        });
        return ;
      }

      // everything's okay
      body.username = body.username.toLowerCase();

      // check if user exists
      pool.query('SELECT * FROM users WHERE username = $1', [body.username], (error, usersResults) => {
        if (error) throw error;

        if (usersResults.rows.length === 0) {
          res.json({
            success: false,
            message: 'User does not exist. Try Registering instead.',
          });
          return ;
        }
        else {
          if (usersResults.rows.length > 0) {
            const user = usersResults.rows[0];
            const salt = user.salt;
            const hashedPassword = crypto.pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex');

            if (hashedPassword === user.password) {
              pool.query('SELECT * FROM players WHERE username = $1', [body.username], (error, playersResults) => {
                if (playersResults.rows.length > 0) {
                  let session = sessions.find(session => session.username === playersResults.rows[0].username)

                  if (session) {
                    // Already logged in
                    res.json({
                      success: true,
                      message: 'Login successful',
                      session: session,
                    })
                  }
                  else {
                    // create a session
                    session = {
                      id: uuidv4(),
                      displayName: playersResults.rows[0].display_name,
                      username: playersResults.rows[0].username,
                      credits: playersResults.rows[0].credits,
                      lastActivity: Date.now(),
                    }

                    sessions.push(session);

                    update_sessions_to_database();
    
                    res.json({
                      success: true,
                      message: 'Login successful',
                      session: session,
                    })
                  }

                  return ;
                }
              });
            }
            else {
              res.json({
                success: false,
                message: 'Username and password do not match.',
              });
            }
          }
        }
      });
    }
  }
}


/**
 * User session data
 */
export var sessions = []

export function update_sessions_to_database() {
   pool.query('UPDATE sessions SET data = $1 WHERE identifier = $2', [JSON.stringify(sessions), 'sessions_data'], (error, results) => {
     if (error) throw error;
   });
}
   
export function load_sessions_from_database() {
   pool.query('SELECT data FROM sessions WHERE identifier = $1', ['sessions_data'], (error, results) => {
     if (error) throw error;
 
     sessions = JSON.parse(results?.rows[0]?.data || []);
   });
}
load_sessions_from_database();
 
 /**
  * Poker game data
  */
export var tables = []
 
export function cleanTables() {
   tables = [];
}
 
export function update_tables_to_database() {
   tables = tables.map(table => ({...table, turnTimeout: null}));
 
   pool.query('UPDATE poker SET data = $1 WHERE identifier = $2', [JSON.stringify(tables), 'poker_data'], (error, results) => {
     if (error) throw error;
   });
}
   
export async function load_tables_from_database() {
   pool.query('SELECT data FROM poker WHERE identifier = $1', ['poker_data'], (error, results) => {
       if (error) throw error;
 
       tables = JSON.parse(results?.rows[0]?.data || []);
 
       tables.forEach(table => {
         if (table.started) {
           progressRoundTillTheEnd(table.id);
         }
       })
 
       cleanTables();
 
       update_tables_to_database();
   });
}
load_tables_from_database();
