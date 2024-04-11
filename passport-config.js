const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function init(passport, getUserByEmail, geetUserById){
    //Authenticate users
    const authenticateUsers = async (email, password, done) => {
        //get user by email
        const user = getUserByEmail(email);
        if (user == null){
            return done(null, false, {message: "Email not found"})
        }
        try {
            if (await bcrypt.compare(password, users.password)){
                return done(null, user)
            } else {
                return done (null, false, {message: "Incorrect password"})
            }
        } catch (e) {
            console.log(e);
            return done(e);
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers))
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((user, done) => {
        return done(null, geetUserById)
    });
}

module.exports = init;