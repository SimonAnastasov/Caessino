import { v4 as uuidv4 } from 'uuid';

import axios from 'axios';

require('dotenv').config();

const crypto = require('crypto');

const nodemailer = require('nodemailer');

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
     * /--------------------- ADMIN ----------------------/
     * Get complaints from the players and show them to the admin
     * @action get_complaints_as_admin
     * @param admin_id
     */
     if (req.query?.action === 'get_complaints_as_admin' && req.query?.admin_id) {
      const admin_id = req.query.admin_id
      const adminSession = adminSessions.find(adminSession => adminSession.id === admin_id)

      if (adminSession) {
        pool.query('SELECT * FROM complaints', (error, results) => {
          if (error) throw error;

          if (results.rows.length > 0) {
            res.json({
              success: true,
              complaints: results.rows,
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
     * Activates an user account if not activated.
     * @action activate_account
     * @param emailActivationId
     */
    if (req.query?.action === 'activate_account' && req.query?.emailActivationId) {
      pool.query('SELECT * FROM users WHERE email_activation_id = $1', [req.query.emailActivationId], (error, results) => {
        if (error) throw error;

        if (results.rows.length > 0) {
          pool.query('UPDATE users SET activated = $1 WHERE email_activation_id = $2', [true, req.query.emailActivationId], (error, results) => {
            if (error) throw error;

            res.json({
              success: true,
            })
          });
        }
        else {
          res.json({
            success: false,
          })
        }
      });
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
          username: session.username,
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
        update_sessions_to_database();

        // remove player from games:
        if (rooms[session_id] !== undefined) {
          delete rooms[session_id];
          update_rooms_to_database();
        }

        if (game.players?.map(e=>e.session_id).indexOf(session_id) !== -1) {
          game.players?.splice(game.players?.map(e=>e.session_id).indexOf(session_id), 1);
          update_game_to_database();
        }

        tables.forEach(table => {
          table.players?.forEach(player => {
            if (player.id === session_id) {
              player.isGhost = true;
            }
          })
        })
        update_tables_to_database();
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
     * Deposits money from credit card to game account.
     * @action register
     * @param session_id
     * @param data
     */
    if (body?.action === 'deposit') {
      // checks
      if (body?.session_id == "undefined" || body?.session_id == "null" || body?.session_id == "") {
        res.json({
          success: false,
          message: 'You are not logged in. Please log in first.',
        });
        return ;
      }
      if (body?.data?.name == "undefined" || body?.data?.name == "null" || body?.data?.name == "") {
        res.json({
          success: false,
          message: 'Name field cannot be empty',
        });
        return ;
      }
      if (body?.data?.card == "undefined" || body?.data?.card == "null" || body?.data?.card == "") {
        res.json({
          success: false,
          message: 'Card numbers field cannot be empty',
        });
        return ;
      }
      if (body?.data?.expire == "undefined" || body?.data?.expire == "null" || body?.data?.expire == "") {
        res.json({
          success: false,
          message: 'Expiration date field cannot be empty',
        });
        return ;
      }
      if (body?.data?.ccv == "undefined" || body?.data?.ccv == "null" || body?.data?.ccv == "") {
        res.json({
          success: false,
          message: 'CCV field cannot be empty',
        });
        return ;
      }
      if (body?.data?.amount == "undefined" || body?.data?.amount == "null" || body?.data?.amount == "") {
        res.json({
          success: false,
          message: 'Amount field cannot be empty',
        });
        return ;
      }
      if (parseInt(body?.data?.amount) > 5000) {
        res.json({
          success: false,
          message: 'Failed to deposit. Insufficient credit on card.',
        });
        return ;
      }

      let session = sessions.find(session => session.id === body?.session_id)

      if (session) {
        if (parseInt(body.data.amount) > 0) {
          session.credits = session.credits + parseInt(body.data.amount)

          pool.query('UPDATE players SET credits = $1 WHERE username = $2', [session.credits, session.username], (error, results) => {
            if (error) throw error;
            
            res.json({
              success: true,
              credits: session.credits
            })
            
            update_sessions_to_database();
          });
        }
      }
    }

    /**
     * /---------------------- POST ----------------------/
     * Withdraws money from game account to personal account.
     * @action register
     * @param session_id
     * @param data
     */
     if (body?.action === 'withdraw') {
      // checks
      if (body?.session_id == "undefined" || body?.session_id == "null" || body?.session_id == "") {
        res.json({
          success: false,
          message: 'You are not logged in. Please log in first.',
        });
        return ;
      }
      if (body?.data?.citibank == "undefined" || body?.data?.citibank == "null" || body?.data?.citibank == "") {
        res.json({
          success: false,
          message: 'Bank name field cannot be empty',
        });
        return ;
      }
      if (body?.data?.iban == "undefined" || body?.data?.iban == "null" || body?.data?.iban == "") {
        res.json({
          success: false,
          message: 'IBAN code field cannot be empty',
        });
        return ;
      }
      if (body?.data?.bic == "undefined" || body?.data?.bic == "null" || body?.data?.bic == "") {
        res.json({
          success: false,
          message: 'BIC code field cannot be empty',
        });
        return ;
      }
      if (body?.data?.beneficiary == "undefined" || body?.data?.beneficiary == "null" || body?.data?.beneficiary == "") {
        res.json({
          success: false,
          message: 'Beneficiary name field cannot be empty',
        });
        return ;
      }
      if (body?.data?.address == "undefined" || body?.data?.address == "null" || body?.data?.address == "") {
        res.json({
          success: false,
          message: 'Bank address field cannot be empty',
        });
        return ;
      }
      if (body?.data?.amount == "undefined" || body?.data?.amount == "null" || body?.data?.amount == "") {
        res.json({
          success: false,
          message: 'Amount field cannot be empty',
        });
        return ;
      }

      let session = sessions.find(session => session.id === body?.session_id)

      if (session) {
        if (parseInt(body.data.amount) > 0) {
          session.credits = Math.max(session.credits - parseInt(body.data.amount), 0)

          pool.query('UPDATE players SET credits = $1 WHERE username = $2', [session.credits, session.username], (error, results) => {
            if (error) throw error;

            res.json({
              success: true,
              credits: session.credits
            })

            update_sessions_to_database();
          });
        }
      }
    }

    /**
     * /---------------------- POST ----------------------/
     * /---------------------- ADMIN ----------------------/
     * Sends an answer to a complaint.
     * @action send_complaint_answer_as_admin
     * @param admin_id
     * @param complaint
     */
     if (body?.action === 'send_complaint_answer_as_admin') {
      // checks
      if (body?.admin_id == "undefined" || body?.admin_id == "null" || body?.admin_id == "") {
        res.json({
          success: false,
          message: 'You are not logged in. Please log in first.',
        });
        return ;
      }
      if (body?.complaint.by == "undefined" || body?.complaint.by == "null" || body?.complaint.by == "") {
        res.json({
          success: false,
          message: 'You cannot send the answer to noone.',
        });
        return ;
      }
      if (body?.complaint.description == "undefined" || body?.complaint.description == "null" || body?.complaint.description == "") {
        res.json({
          success: false,
          message: 'You cannot answer an empty complaint.',
        });
        return ;
      }
      if (body?.complaint.answer == "undefined" || body?.complaint.answer == "null" || body?.complaint.answer == "") {
        res.json({
          success: false,
          message: 'You cannot submit an empty answer.',
        });
        return ;
      }

      let adminSession = adminSessions.find(adminSession => adminSession.id === body.admin_id)

      if (adminSession) {
        pool.query('UPDATE complaints SET answer = $1, answered = $2 WHERE by = $3', [body.complaint.answer, true, body.complaint.by], (error, complaintResults) => {
          if (error) throw error;

          pool.query('SELECT * FROM complaints', (error, results) => {
            if (error) throw error;

            res.json({
              success: true,
              complaints: results.rows,
            })
          });

          sendMailForComplaintAnswered(body.complaint);
        });
      }
    }

    /**
     * /---------------------- POST ----------------------/
     * Sends a complaint.
     * @action complain
     * @param session_id
     * @param description
     */
     if (body?.action === 'complain') {
      // checks
      if (body?.session_id == "undefined" || body?.session_id == "null" || body?.session_id == "") {
        res.json({
          success: false,
          message: 'You are not logged in. Please log in first.',
        });
        return ;
      }
      if (body?.description == "undefined" || body?.description == "null" || body?.description == "") {
        res.json({
          success: false,
          message: 'You cannot submit an empty complaint.',
        });
        return ;
      }

      let session = sessions.find(session => session.id === body.session_id)

      if (session) {
        // date, by, description, answered
        const date = new Date();
        pool.query('INSERT INTO complaints (date, by, description, answered, answer) VALUES ($1, $2, $3, $4, $5)', [date, session.username, body.description, false, ''], (error, complaintResults) => {
          if (error) throw error;

          res.json({
            success: true,
          })
        });
      }
    }

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
      if (body?.email == "undefined" || body?.email == "null" || body?.email == "") {
        res.json({
          success: false,
          message: 'Email is required',
        });
        return ;
      }
      if (!body?.email?.includes('@') || body?.email?.indexOf('@', body?.email?.indexOf('@')+1) !== -1) {
        res.json({
          success: false,
          message: 'Not a valid email',
        });
        return ;
      }
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

        const emailActivationId = uuidv4();

        // store user in database
        pool.query('INSERT INTO users (username, password, salt, email, email_activation_id, activated) VALUES ($1, $2, $3, $4, $5, $6)', [body.username, hashedPassword, salt, body.email, emailActivationId, false], (error, usersResults) => {
          if (error) throw error;

          pool.query('INSERT INTO players (username, display_name, credits) VALUES ($1, $2, $3)', [body.username, body.displayName, 1000], (error, playersResults) => {
            if (error) throw error;

            pool.query('INSERT INTO stats (username, blackjack_games, roulette_games, poker_games, blackjack_won_games, roulette_won_games, poker_won_games, money_bet, money_earned) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [body.username, 0, 0, 0, 0, 0, 0, 0, 0], (error, statsResults) => {
              if (error) throw error;

              sendMailForActivation(body.displayName, body.email, emailActivationId);

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
              if (user.activated === "false") {
                res.json({
                  success: false,
                  message: 'Account not activated. Check your email.',
                })

                return ;
              }

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

    /**
     * /---------------------- POST ----------------------/
     * /---------------------- ADMIN ----------------------/
     * Checks if the entered account info is good, and logs the admin in if so.
     * @action login_as_admin
     * @param username
     * @param password
     */
    if (body?.action === 'login_as_admin') {
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
      pool.query('SELECT * FROM admins WHERE username = $1', [body.username], (error, adminsResults) => {
        if (error) throw error;

        if (adminsResults.rows.length === 0) {
          res.json({
            success: false,
            message: 'Admin does not exist.',
          });
          return ;
        }
        else {
          if (adminsResults.rows.length > 0) {
            const user = adminsResults.rows[0];

            const salt = user.salt;
            const hashedPassword = crypto.pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex');

            if (hashedPassword === user.password) {
              let adminSession = adminSessions.find(session => session.username === adminsResults.rows[0].username)

              if (adminSession) {
                // Already logged in
                res.json({
                  success: true,
                  message: 'Login successful',
                  session: adminSession,
                })
              }
              else {
                // create a session
                adminSession = {
                  id: uuidv4(),
                  username: adminsResults.rows[0].username,
                }

                adminSessions.push(adminSession);

                res.json({
                  success: true,
                  message: 'Login successful',
                  session: adminSession,
                })
              }

              return ;
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

// Mailing
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GOOGLE_EMAIL,
      pass: process.env.GOOGLE_APP_PASSWORD,
  }
})

function sendMailForActivation(displayName, userEmail, emailActivationId) {
  const message = {
      from: process.env.GOOGLE_EMAIL,
      to: userEmail,
      subject: "Caessino - Activate your account",
      html: `
          <h4>Hello, ${displayName}</h4>
          <p>Thank you for creating an account at Caessino. Just one more step and you can start enjoying the games!</p>
          <p>To activate your account please follow this link: <a target="_blank" href="${process.env.HOME_URL}/activate/${emailActivationId}">Activate account</a>
          <br/>
          <p>Cheers and happy playing,</p>
          <p>The Team ESS</p>
      `
  }

  transporter.sendMail(message, (err, data) => {
      if (err) {
          console.log(err);
      }
  })
}

let mailSentTo = {
  poker: [],
  roulette: [],
  blackjack: [],
}
function sendMailForGameCompletition(game, username, displayName) {
  return ;

  const msgPoker = 'Your game was played to the end by the computer with the following rules:<br/>1. No more bets were made by any player;<br/>2. Cards were dealt normally like they would be under normal circumstances;<br/>3. Credits were given to the winners and taken from the losers.';
  const msgRoulette = 'If you reconnect immediately, you can catch this ongoing game. But don\'t worry if you can\'t! If you win, credits will be awarded to you.';
  const msgBlackjack = 'You can now continue playing your game.';
  
  pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
    if (error) throw error;

    if (results.rows.length > 0) {
      const userEmail = results.rows[0].email;

      if ((game === 'poker' && mailSentTo.poker.indexOf(userEmail) === -1) ||
          (game === 'roulette' && mailSentTo.roulette.indexOf(userEmail) === -1) ||
          (game === 'blackjack' && mailSentTo.blackjack.indexOf(userEmail) === -1))
      {
        const message = {
          from: process.env.GOOGLE_EMAIL,
          to: userEmail,
          subject: "Caessino - Server is back online",
          html: `
            <h4>Hello, ${displayName}</h4>
            <p>We are writing to inform you that the server is back online.</p>
            <p>We know that you were in the middle of playing ${game}, and we apologize for the interrupt.</p>
            <p>${game === 'poker' ? msgPoker : game === 'roulette' ? msgRoulette : msgBlackjack}</p>
            <br/>
            <p>All the best,</p>
            <p>The Team ESS</p>
            `
        }

        transporter.sendMail(message, (err, data) => {
          if (err) {
              console.log(err);
          }
        })

        mailSentTo[game].push(userEmail)
      }
    }
  });
}

function sendMailForComplaintAnswered(complaint) {
  pool.query('SELECT * FROM users WHERE username = $1', [complaint.by], (error, results) => {
    if (error) throw error;

    if (results.rows.length > 0) {
      const userEmail = results.rows[0].email;

      const message = {
        from: process.env.GOOGLE_EMAIL,
        to: userEmail,
        subject: "Caessino - Your complaint has been answered",
        html: `
          <h4>Hello, ${complaint.by}</h4>
          <p>You wrote a complaint on ${new Date(complaint.date).toGMTString()}, saying:</p>
          <blockquote><em>${complaint.description}</em></blockquote>
          <br/>
          <p>Your complaint has been listened to, here's what the admin has to say:<p>
          <blockquote><em>${complaint.answer}</em></blockquote>
          <br/>
          <p>We hope this fixes your issue,</p>
          <p>The Team ESS</p>
          `
      }

      transporter.sendMail(message, (err, data) => {
        if (err) {
            console.log(err);
        }
      })
    }
  });
}

/**
 * Admin session data
 */
 export var adminSessions = []

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
 *  Poker game data
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

    tables.forEach(table => {
      if (table.ended) {
        table.players?.forEach(player => {
          if (!player.isGhost) {
            sendMailForGameCompletition('poker', player.username, player.displayName);
          }
        })
      }
    })

    cleanTables();

    update_tables_to_database();
  });
}
load_tables_from_database();

/**
 *  Roulette game data
 */
export var game = {}
  
export function update_game_to_database() {
  pool.query('UPDATE roulette SET data = $1 WHERE identifier = $2', [JSON.stringify(game), 'roulette_data'], (error, results) => {
    if (error) throw error;
  });
}
    
export async function load_game_from_database() {
  pool.query('SELECT data FROM roulette WHERE identifier = $1', ['roulette_data'], (error, results) => {
    if (error) throw error;

    game = JSON.parse(results?.rows[0]?.data || []);

    game.players?.forEach(player => {
      sendMailForGameCompletition('roulette', player.username, player.name);
    })

    game.loaded = true;
  });
}
load_game_from_database();

/**
 *  Blackjack game data
 */
export var rooms = []
  
export function update_rooms_to_database() {
  let tmpRooms = [];
  
  for (let key in rooms) {
    if (key === "loaded") continue ;

    tmpRooms.push(rooms[key]);
    tmpRooms[tmpRooms.length - 1].id = key;
  }

  pool.query('UPDATE blackjack SET data = $1 WHERE identifier = $2', [JSON.stringify(tmpRooms), 'blackjack_data'], (error, results) => {
    if (error) throw error;
  });
}
     
export async function load_rooms_from_database() {
  pool.query('SELECT data FROM blackjack WHERE identifier = $1', ['blackjack_data'], (error, results) => {
    if (error) throw error;

    if (results?.rows[0]?.data) {
      const tmpRooms = JSON.parse(results.rows[0].data);

      tmpRooms.forEach(room => {
        rooms[room.id] = {...room, id: ''}
      })

      tmpRooms.forEach(room => {
        sendMailForGameCompletition('blackjack', room.username, room.displayName);
      })
      
      rooms["loaded"] = true;
    }
  });
}
load_rooms_from_database();
