// import http from "http"
// import { generate } from "./features.js"
// import fs from "fs"
// import path from "path"

// // const home = fs.readFileSync("./index.html")

// console.log(path.dirname("/home/index.html"))

// const server = http.createServer((req, res) => {
//     if (req.url === "/about") {
//         res.end(`<h1>${generate()} you know About Us</h1>`)
//     }
//     else if (req.url === "/") {
//         // fs.readFile("./index.html", (err,data) => {
//             res.end(home)
//         // })
//     }
//     else if (req.url === "/contact") {
//         res.end("<h1>Contact</h1>")
//     }
//     else {
//         res.end("<h1>Page not found</h1>")
//     }
// })

// server.listen(5000, () => {
//     console.log("server started")
// })




import express from "express"
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
}).then(() => console.log("Database Connected")).catch((e) => console.log(e))

// const messageSchema = new mongoose.Schema({
//     name: String,
//     email: String,
// })

// const message = mongoose.model("Message", messageSchema)
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

const User = mongoose.model("User", userSchema)

const app = express()

const users = [];

// Using Middlewares
app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// Setting up View Engine
app.set("view engine", "ejs")

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies
    if (token) {

        const decoded = jwt.verify(token, "dnajkbionba")

        req.user = await User.findById(decoded._id)

        next()
    } else {
        res.redirect("/login")
    }
}


app.get("/", isAuthenticated, (req, res) => {
    res.render("logout", { name: req.user.name })
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    let user = await User.findOne({ email })

    if (!user) return res.redirect("/register")

    // const isMatch = user.password === password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) return res.render("login", { email, message: "password mismatch" })

    const token = jwt.sign({ _id: user._id }, "dnajkbionba")

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    })
    res.redirect("/")
})

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body

    let user = await User.findOne({ email })

    if (user) {
        return res.redirect("/login")
    }
    const hashPassword = await bcrypt.hash(password, 10)

    user = await User.create({
        name,
        email,
        password: hashPassword,
    })

    const token = jwt.sign({ _id: user._id }, "dnajkbionba")

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    })
    res.redirect("/")
})
app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    res.redirect("/")
})


// app.get("/", (req, res) => {
//     res.render("index", { name: "Sambhav" })
// })

// app.get("/add", async (req, res) => {
//     await message.create({ name: "Abhi2", email: "abhi2@gmail.com" })
//     res.send("nice")
// })

// app.get("/success", (req, res) => {
//     res.render("success")
// })

// app.post("/contact", async (req, res) => {
//     // console.log(req.body.name)
//     // const messageData = { username: req.body.name, email: req.body.email }
//     // console.log(messageData)
//     const { name, email } = req.body
//     await message.create({ name, email })
//     res.redirect("/success")
// })

// app.get("/users", (req, res) => {
//     res.json({
//         users,
//     })
// })

app.listen(5000, () => {
    console.log("server started")
})