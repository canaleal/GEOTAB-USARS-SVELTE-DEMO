/* eslint-disable no-undef */
import express from "express";
import morgan from "morgan";
import dotenv from 'dotenv/config';
dotenv.config()
const app = express();  //Create new instance

import treesRouter from './source/routes/trees.js';

const PORT = process.env.PORT || 5000; //Declare the port number
app.use(express.json()); //allows us to access request body as req.body
app.use(morgan("dev"));  //enable incoming request logging in dev mode
 
app.use('/trees', treesRouter);

//Define the endpoint
app.get("/ping", (req, res) => {  
  return res.send({
    status: "Healthy",
  });
});

app.get("/", (req, res) => {
    return res.send({
        status: "API is working",
    });
});

app.listen(PORT, () => {
  console.log("Server started listening on port : ", PORT);
});