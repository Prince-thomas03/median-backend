import express from 'express';
import httpServer from "http"
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import PostRoute from './Routes/PostRoute.js';
import UploadRoute from './Routes/UploadRoute.js'
import ChatRoute from './Routes/ChatRoute.js'
import MessageRoute from './Routes/MessageRoute.js'

// Routes
const app = express()

// to serve image for public

app.use(express.static('public'))
app.use('/images', express.static('images'))

//Middleware
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({ origin: '*' }))

dotenv.config();

// mongoose
mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true }).
    then(() => server.listen(process.env.PORT, () => console.log(`server connectd port: ${process.env.PORT}`))).
    catch((error) => console.log(error))


//Usage of Routes

app.use('/auth', AuthRoute)
app.use('/user', UserRoute)
app.use('/post', PostRoute)
app.use('/upload', UploadRoute)
app.use('/admin', UserRoute)
app.use('/chat', ChatRoute)
app.use('/message', MessageRoute)
app.use('/posts', PostRoute)
app.use('/savepost', UserRoute)
app.use('/savedpost', PostRoute)





const io = require("socket.io")(server);

let activeUsers = [];

io.on("connection", (socket) => {
    // add new User
    socket.on("new-user-add", (newUserId) => {
        // if user is not added previously
        if (!activeUsers.some((user) => user.userId === newUserId)) {
            activeUsers.push({ userId: newUserId, socketId: socket.id });
            console.log("New User Connected", activeUsers);
        }
        // send all active users to new user
        io.emit("get-users", activeUsers);
    });

    socket.on("disconnect", () => {
        // remove user from active users
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);
        // send all active users to all users
        io.emit("get-users", activeUsers);
    });


    socket.on("send-message", (data) => {
        const { receiverId } = data;
        const user = activeUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to :", receiverId)
        console.log("Data: ", data)
        if (user) {
            io.to(user.socketId).emit("recieve-message", data);
        }
    });
})  