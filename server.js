if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Importing all Libraies that we installed using npm
const express = require("express");
const app = express();
const bcrypt = require("bcrypt"); // Importing bcrypt package
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

initializePassport(passport);

//const users = []

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Configuring the register post functionality
app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/register", checkNotAuthenticated, async (req, res) => {
  var { name, email, password } = req.body;

  // if (!name || !email || !password) {
  //   res.status(400).send("Please provide all required fields.");
  //   return;
  // }

  try {
    if (!name || name.trim() === "") {
      req.flash("error", "Name cannot be empty");
      throw new Error("Name cannot be empty");
    }

    if (!email || email.trim() === "") {
      req.flash("error", "Email cannot be empty");
      throw new Error("Email cannot be empty");
    }

    if (!password || password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long");
      throw new Error("Password must be at least 8 characters long");
    }

    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, results) => {
        if (error) {
          console.error(error);
          req.flash("error", "Failed to register user");
          return res.redirect("/register");
        }
        if (results.length > 0) {
          // User with the same email already exists
          req.flash("error", "Email is already registered");
          console.log("Email already registered");
          return res.redirect("/register");
        }
        // Email is not registered, proceed with registration
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert user into database
        connection.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (error, results) => {
            if (error) {
              console.error(error);
              req.flash("error", "Failed to register user");
              return res.redirect("/register");
            }
            console.log("User registered successfully");
            res.redirect("/login");
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.redirect("/register");
  }
});

// app.post('/register', checkNotAuthenticated, async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
// Check if user with the same email already exists

// Configuring the register post functionality
// app.post("/register", checkNotAuthenticated, async (req, res) => {

//   try {
//       const hashedPassword = await bcrypt.hash(req.body.password, 10)
//       users.push({
//           id: Date.now().toString(),
//           name: req.body.name,
//           email: req.body.email,
//           password: hashedPassword,
//       })
//       console.log(users); // Display newly registered in the console
//       res.redirect("/login")

//   } catch (e) {
//       console.log(e);
//       res.redirect("/register")
//   }
// })

// Routes
//app.use(express.static("public"));

app.get("/dashboard", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname + "/public/dashboard.html"), {
    name: req.user.name,
  });
});

app.get("/presale", checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname + "/public/presale.html"), {
    name: req.user.name,
  });
});

app.get("/", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/public/register.html");
});

app.get("/resetpw", checkNotAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/public/resetpw.html");
});

app.use(express.static(__dirname + "/public"));

app.post("/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Redirect to the homepage or login page after logout
      res.redirect("/");
      console.log("logged out");
    }
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}

const PORT = process.env.PORT; // or any other port you prefer
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
