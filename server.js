//installed dependencies init
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

//database pool
const {
    createPool
} = require("mysql");

const pool = createPool({
    host: "localhost",
    user: "admin",
    password: "Gabbyessentials",
    database: "volt",
    connectionLimit: 10
});


//end of pool


//posts
 

// Your other routes and middleware come here

//Error route




  app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
  });


  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  });

  app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
  });


  app.get("/dashboard", (req, res) => {
    res.render("dashboard.ejs");
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
