//installed dependencies init
const express = require("express")
const app = express()
app.use(express.static('public'));



// Your other routes and middleware come here
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
  });


  app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
  });

  app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/public/signup.html');
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
