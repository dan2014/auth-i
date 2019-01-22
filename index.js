const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const knex = require("knex");
const knexConfig = require('./knexfile.js');
const db = knex(knexConfig.development);
const server = express();


server.use(helmet());
server.use(express.json())

server.get("/",(req,res) => {
    res.status(200).send("<h1>The server is up</h1>")
})

server.post("/users/register", (req,res) => {
    const userInfo = req.body;

    const hash = bcrypt.hashSync(userInfo.password,12);
    userInfo.password = hash;
    console.log(hash)

    db('users')
    .insert(userInfo)
    .then(ids => {
        res.status(201).json(ids);
    })
    .catch(err => res.status(500).json(err));
});

server.post("/login", (req,res) => {
    const creds = req.body;

    db("users")
    .where({username: creds.username})
    .first()
    .then(user => {
        if (user && bcrypt.compareSync(creds.password,user.password)){
            res.status(200).json({message:`Welcome ${user.name}`})
        } else {
            res.status(401).json({message:`Username and/or password are incorrect`})
        }
    })
    .catch( err => {
        console.log(err);
        res.status(500).json({message:`Server error`,error:err})
    })
});

server.get("/users", async (req,res) => {
    const users = await db("users");
    res.status(200).json(users);
})

const port = process.env.PORT || 3300;

server.listen(port,console.log(`The server is listening on port ${port}`))