const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

//Environmental Variables
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

//Next.JS config
const next = require('next');
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const requestHandler = app.getRequestHandler();

//Express config
const express = require('express');
const server = express();

//MongoDB config
const {MongoClient, Db }= require('mongodb');
uri = "mongodb+srv://rainee-rainee:Password1@cluster1.w4bgg7t.mongodb.net/?retryWrites=true&w=majority";
client = new MongoClient(uri);

usersCollection = client.db("notes-db").collection("users");

app.prepare().then(async () => {
  // Connecting with the app's database
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:\n", err);
    return;
  }
  // Middleware
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  // Custom Express routes here
  // "/register"
  server.post("/register", async (req, res) => {
    console.log("Post Request on \"/register\" \nRequest Body:\n", req.body);
    try {
      const password = req.body.password
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        username: req.body.username,
        password: hashedPassword
      };

      //Validation
      //Check if username already exists
      const usernamesFound = await usersCollection.find({username: newUser.username}).toArray();
      const usernamesFoundLength = usernamesFound.length;
      if ( usernamesFoundLength != 0 ){
        throw new Error("Username already exists")
      }
      //Check if username is at least 3 characters or more
      const usernameWithinCharacters = (newUser.username.length >= 3) && (newUser.username.length <= 15);
      if (!usernameWithinCharacters){
        throw new Error("Username not within 3 to 15 characters")
      }
      //Check if username only contain letters, numbers, hyphens, and underscores.
      const usernameOnlyContains = /^[a-zA-Z0-9_-]+$/.test(newUser.username);
      if (!usernameOnlyContains) {
        throw new Error("Username can only contain letters, numbers, hyphens, and underscores.");
      }
      //Check if password is between 5 to 32 characters
      const passwordWithinCharacters = (password.length >= 5) && (password.length <= 32)
      if (!passwordWithinCharacters) {
        throw new Error("Password not within 5 to 32 characters");
      }

      //Insert user object into db
      const result = await usersCollection.insertOne(newUser);

      //Confirm registration success/failure
      console.log("Result:\n", result);
      if (result.acknowledged == true) {
        res.status(201).send("User successfully registered");
      } else {
        res.status(500).send("User registration failed");
      }

    } catch (err) {
      console.log("Error:", err);
      res.status(500).send(err);  
    }
  })

  // "/login"
  server.post("/login", async (req, res) => {
    try {
      console.log("Post Request on \"/login\" \nRequest Body:\n", req.body);

      // Validation
      // Check if user exists in db
      const user = await usersCollection.findOne({username: req.body.username});    
      if (!user) {
        throw new Error ("User doesn't exist")
      }
      // Check if password is correct
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        throw new Error ("Password doesn't match")
      }
      const token = jwt.sign({id: user._id}, JWT_SECRET);
      res.header("auth-token", token).send(token);

    } catch (err) {
      res.status(500).send(err);
    }
  })


  // Passing on all other route requests to be handled by Next
  server.all('*', (req, res) => {
    return requestHandler(req, res);
  });

  // Initializing the server
  server.listen(PORT, (err) => {
    if (err) {
      throw err;
    }
    console.log(`Server ready on: http://localhost:${PORT}`);
  });
});