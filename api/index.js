// Importing required modules
const express = require("express"); // Express framework for building web applications and APIs.
const cors = require("cors"); // CORS (Cross-Origin Resource Sharing) allows your server to handle requests from different origins.
const mongoose = require("mongoose"); // Mongoose is a library to interact with MongoDB (database).
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // JWT (JSON Web Token) is used for authentication (generating and verifying tokens).
const UserModel = require("./models/User");
const cookieParser = require("cookie-parser"); // Parses cookies attached to the client request object.
const imageDownloader = require("image-downloader");
require("dotenv").config();

// Creating an instance of an Express application
const app = express(); // This initializes the Express app which will handle the server functionality.

// Setting up constants for password hashing and JWT secrets
const bcryptSalt = bcrypt.genSaltSync(10); // Generates a salt value for hashing passwords with bcrypt (increases security).
const jwtSecret = "jh56w5fd6bsrt6jqksrylx2yl4t8+7r5j+qqq"; // Secret key used to sign JWT tokens (used to verify user identity).

// Middlewares: functions that handle requests before reaching the routes

app.use(express.json()); // Parses incoming JSON requests and puts the parsed data in `req.body`.
app.use(cookieParser()); // Parses cookies so that `req.cookies` is populated with any cookies sent by the client.
app.use("/uploads", express.static(__dirname + "/uploads"));

// CORS configuration middleware to allow requests from a specific origin
app.use(
  cors({
    credentials: true, // Allows cookies to be sent with requests from the client.
    origin: "http://localhost:5173", // Allows only this client origin to access the API.
  })
);

// Connect to the MongoDB database using the MONGO_URL environment variable
mongoose.connect(process.env.MONGO_URL);

// Route for registering a new user
app.post("/register", async (req, res) => {
  // Extracts the name, email, and password from the request body
  const { name, email, password } = req.body;

  try {
    // Creates a new user document in the database with the hashed password
    const userDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });

    res.json(userDoc);
  } catch (error) {
    res.status(422).json(error);
  }
});

// Route for user login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDoc = await UserModel.findOne({ email });

  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      // If password is correct, sign a JWT token for the user
      jwt.sign(
        { email: userDoc.email, id: userDoc._id }, // Payload: data embedded in the JWT (user's email and ID).
        jwtSecret, // Secret key to sign the JWT.
        {}, // Options (empty in this case).
        (err, token) => {
          if (err) throw err; // If there is an error generating the token, throw an error.

          // Send the token as a cookie and respond with the user data
          res
            .cookie("token", token, {
              httpOnly: true, // Cookie cannot be accessed through JavaScript (for security).
              sameSite: "strict", // Prevents cross-site request forgery attacks.
            })
            .json(userDoc); // Responds with the user data.
        }
      );
    } else {
      // If the password is incorrect, send a 422 error
      res.status(422).json("pass not ok");
    }
  } else {
    // If no user with that email is found, send a 404 error
    res.status(404).json("User not found");
  }
});

// Route to get the profile of the currently logged-in user
app.get("/profile", (req, res) => {
  // Extracts the token from the request's cookies
  const { token } = req.cookies;

  if (token) {
    // Verifies the token to get the user's data
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err; // If token verification fails, throw an error.

      // If token is valid, fetch the user's profile from the database using the user ID
      const { name, email, _id } = await UserModel.findById(userData.id);

      // Respond with the user's profile data
      res.json({ name, email, _id });
    });
  } else {
    // If no token is found, respond with `null` (user is not logged in)
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});
console.log(__dirname);
app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;

  const newName = "photo" + Date.now() + ".jpg";

  await imageDownloader.image({
    url: link,
    dest: __dirname + "/uploads/" + newName, //C:\Users\khalid\projects\booking-app-mern\api
  });
  res.json(newName);
});

// Start the Express server and listen on port 4000
app.listen(4000); // Starts the server on port 4000 and begins listening for incoming HTTP requests.
