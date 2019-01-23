const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const dbFuncs = require("./dbFunctions");
// const KnexSessionStore = require("connect-session-store")(session);
const server = express();

// 3 ways to store cookies
// In memory - if server goes down, the session info is gone
// Use Redis or mem-cache to store session data
// Use a database

const sessionConfig = {
  name: "monkey",
  secret: "1.23,emrndskzjhxbnaks-098uertg,//[pkjdbnxcmnku87t0ijdllkjmanzcv",
  cookie: {
    maxAge: 1000 * 30,
    secure: false //when true, send the cookie over https
  },
  httpOnly: true, // prevents js from reading and manipulating this cookie
  resave: false,
  saveUninitialized: false
};

server.use(helmet());
server.use(express.json());
server.use(session(sessionConfig));

server.get("/", (req, res) => {
  res.status(200).send("<h1>The server is up</h1>");
});

server.post("/users/register", async (req, res) => {
  const userInfo = req.body;

  const hash = bcrypt.hashSync(userInfo.password, 12);
  userInfo.password = hash;

  try {
    const response = await dbFuncs.addUser(userInfo);
    res.status(201).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

server.post("/login", async (req, res) => {
  const creds = req.body;
  try {
    const user = await dbFuncs.getUser(creds);
    if (user && bcrypt.compareSync(creds.password, user.password)) {
      req.session.user = user;
      res.status(200).json({ message: `Welcome ${user.name}` });
    } else {
      res
        .status(401)
        .json({ message: `Username and/or password are incorrect` });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: `Server error`, error: err });
  }
});

server.get("/users", async (req, res) => {
  try {
    const users = await dbFuncs.getUsers();
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return err;
  }
});

function protected(req,res,next){
    console.log(req.session);
    if(req.session && req.session.user){
        next()
    } else {
        res.status(401).json({message:"Not Authorized or Not Logged in"})
    }
}

server.get("/user", protected, async (req, res) => {
    try {
      const user = await dbFuncs.getUser(req.body);
      res.status(200).json(user);
    } catch (err) {
      console.log(err);
      return err;
    }
  });



server.get("/logout",(req,res) => {
    console.log(req.session)
    if(req.session){
        req.session.destroy(err => {
            if(err){
                res.status(500).send("<h1>Error with logout request</h1>")
            } else {
                res.status(500).send("<h1>You have successfully logged out</h1>")
            }
        })
    } else {
        res.send("<h1>You are already logged out</h1>")
    }
})

const port = process.env.PORT || 3300;

server.listen(port, () =>
  console.log(`The server is listening on port ${port}`)
);
