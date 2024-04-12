const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt")
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'volt_meme'
})




function initialize(passport){
    // Function to authenticate users
    const authenticateUser = async (email, password, done) => {
        // Get users by email
        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (error, results) => {
              if (error) {
                return done(error);
              }
              if (results.length === 0) {
                return done(null, false, { message: 'No user found with that email' });
              }
              const user = results[0];
              try {
                // Compare the provided password with the hashed password from the database
                if (await bcrypt.compare(password, user.password)) {
                  return done(null, user);
                } else {
                  return done(null, false, { message: 'Password Incorrect' });
                }
              } catch (error) {
                return done(error);
              }
            });
        };
      

        passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
        passport.serializeUser((user, done) => done(null, user.id));
        passport.deserializeUser((id, done) => {
          // Query the database to find user by ID
          connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id],
            (error, results) => {
              if (error) {
                return done(error);
              }
              return done(null, results[0]);
            }
          );
        });
      }

module.exports = initialize