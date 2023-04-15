const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

//Environmental Variables
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const mongoPassword = process.env.MONGOPASSWORD;

//Next.JS config
const next = require('next');
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const requestHandler = app.getRequestHandler();

//Express config
const express = require('express');
const server = express();

//MongoDB config
const {MongoClient, Db }= require('mongodb');
uri = `mongodb+srv://rainee-rainee:${mongoPassword}@cluster1.w4bgg7t.mongodb.net/?retryWrites=true&w=majority`;
client = new MongoClient(uri);

usersCollection = client.db("notes-db").collection("users");

app.prepare().then(async () => {

  let stringTable = {
    //Registration status variables
    "USERNAME_EXISTS": "Username already exists",
    "USERNAME_NOT_WITHIN": "Username not within 3 to 15 characters",
    "USERNAME_CONTAINS_INVALID": "Username can only contain letters, numbers, hyphens, and underscores",
    "PASSWORD_NOT_WITHIN": "Password not within 5 to 32 characters",
    "REGISTRATION_SUCCESS": "User successfully registered",
    "REGISTRATION_FAILED": "User registration failed",

  };

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
    console.log("Post Request on \"/register\" \n\nRequest Header:\n", `${JSON.stringify(req.headers)}`, "\n\nRequest Body:\n", req.body, "\n ");
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
        res.status(500).send([stringTable, "USERNAME_EXISTS"]);
        throw new Error("Username already exists");
      }
      //Check if username is at least 3 characters or more
      const usernameWithinCharacters = (newUser.username.length >= 3) && (newUser.username.length <= 15);
      if (!usernameWithinCharacters){
        res.status(500).send([stringTable, "USERNAME_NOT_WITHIN"]);
        throw new Error("Username not within 3 to 15 characters")
      }
      //Check if username only contain letters, numbers, hyphens, and underscores.
      const usernameOnlyContains = /^[a-zA-Z0-9_-]+$/.test(newUser.username);
      if (!usernameOnlyContains) {
        res.status(500).send([stringTable, "USERNAME_CONTAINS_INVALID"]);
        throw new Error("Username can only contain letters, numbers, hyphens, and underscores.");
      }
      //Check if password is between 5 to 32 characters
      const passwordWithinCharacters = (password.length >= 5) && (password.length <= 32)
      if (!passwordWithinCharacters) {
        res.status(500).send([stringTable, "PASSWORD_NOT_WITHIN"]);
        throw new Error("Password not within 5 to 32 characters");
      }

      //Insert user object into db
      const result = await usersCollection.insertOne(newUser);

      //Confirm registration success/failure
      console.log("Result:\n", result);
      if (result.acknowledged == true) {
        res.status(201).send([stringTable, "SUCCESS"]);
      } else {
        res.status(500).send(stringTable, "FAILED");
      }

    } catch (err) {
      console.log("Error Encountered:\n", err);
      res.status(500).send(err);  
    }
  })

  // "/login"
  server.post("/login", async (req, res) => {
    try {
      console.log("Post Request on \"/login\" \n\nRequest Header:\n", `${JSON.stringify(req.headers)}`, "\n\nRequest Body:\n", req.body, "\n ");

      // Validation
      // Check if user exists in db
      const user = await usersCollection.findOne({username: req.body.username});    
      if (!user) {
        console.log("User doesn't exist");
        throw new Error ("User doesn't exist.");
      }
      // Check if password is correct
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        console.log("Password does not match");
        throw new Error ("Password doesn't match.");
      }

      console.log("User verified. Returning Auth Token:");
      const token = jwt.sign({id: user._id}, JWT_SECRET);
      console.log(token);
      res.header({"auth-token": token}).send(token);
      

    } catch (err) {
      console.log("Error Encountered\n", err);
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