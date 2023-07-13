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

let port = process.env.PORT || 6969;

app.listen(port, () => {
    console.log("Backend Nodejs is runing on the port: " + port)
})
