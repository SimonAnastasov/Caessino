import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';

require('dotenv').config();

const crypto = require('crypto');

const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: 'postgres://postgres:postgres@db/postgres'
});

const sessions = []
// example session
// const session = {
//   id,
//   displayName,
//   username,
//   credits,
//   lastActivity,
// }

// update credits in database
// setInterval(() => {
//   sessions.filter(session => Date.now() - session.lastActivity > 5*60*1000).forEach(session => {
//     pool.query('UPDATE players SET credits = $1 WHERE username = $2', [session.credits, session.username], (error, results) => {
//       if (error) throw error;
//     });
//   });
// }, 5*60*1000)

export default function handler(req, res) {
  /**
   * GET method
   */
  if (req.method === 'GET') {
    /**
     * /---------------------- GET ----------------------/
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
            }
          });
        }
          
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
     * @action take_credits
     * @param session_id
     * @param credits
     */
    if (req.query?.action === 'take_credits' && req.query?.session_id && req.query?.credits) {
      const session_id = req.query.session_id
      const session = sessions.find(session => session.id === session_id)

      if (session) {
        session.lastActivity = Date.now();

        session.credits = session.credits - parseInt(req.query.credits)

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
     * @action get_player_info_on_enter
     * @param session_id
     */
    if (req.query?.action === 'get_player_info_on_enter' && req.query?.session_id) {
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
                      success: false,
                      message: 'You are already logged in',
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

  /**
   * PUT method
   */
  if (req.method === 'PUT') {

  }
}