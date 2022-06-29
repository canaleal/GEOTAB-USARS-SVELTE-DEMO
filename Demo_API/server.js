/* eslint-disable no-undef */
import express from "express";
import morgan from "morgan";
import cors from "cors";
import treesRouter from './source/routes/trees.js';

const app = express();  //Create new instance
const PORT = process.env.PORT || 5000; //Declare the port number
app.use(cors({origin: ['https://www.section.io', 'https://www.google.com/', 'http://localhost:8080', 'https://geotab-demo-2.netlify.app/']}));
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