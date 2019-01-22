const express = require("express");
const helmet = require("helmet");
const bcrypt = require("bcryptjs");
const knex = require("knex");
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

    db('users')
    .insert(userInfo)
    .then(ids => {
        res.status(201).json(ids);
    })
    .catch(err => res.status(500).json(err));
});

server.get("/users", async (req,res) => {
    const users = await db("users");
    res.status(200).json(users);
})

const port = process.env.PORT || 3300;

server.listen(port,console.log(`The server is listening on port ${port}`))