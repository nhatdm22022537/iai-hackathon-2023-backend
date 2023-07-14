import express from "express";
import bodyParser from "body-parser";
import {initWebRoutes} from './routes';
import morgan from "morgan";
require('dotenv').config();

let app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

initWebRoutes(app);

let port = process.env.BACKEND_PORT || 6969;

app.listen(port, () => {
    console.log("I'm a cute backend and as the brain of this project I'm happy to serve everyone' request at the port " + port)
})
