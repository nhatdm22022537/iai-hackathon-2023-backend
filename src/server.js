import express from "express";
import bodyParser from "body-parser";
import {initWebRoutes} from "./routes";
const NodeCache = require("node-cache");

import morgan from "morgan";
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));

initWebRoutes(app);

const port = process.env.BACKEND_PORT || 5678;

app.listen(port, () => {
    console.log("I'm a cute backend and as the brain of this project I'm happy to serve everyone' request at port " + port);
});

export const globalCache = new NodeCache({stdTTL: process.env.CACHE_TTL || 259200, checkperiod: process.env.CACHE_CHECK || 302400});
