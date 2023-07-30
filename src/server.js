import express from "express";
import bodyParser from "body-parser";
import {initWebRoutes} from "./routes";
const cors = require("cors");
const NodeCache = require("node-cache");

import morgan from "morgan";
import {errorHandling} from "./errorHandling";
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.all('/err', (req, res, next) => {
    const err = new Error(`Error`);
    next(err);
})

initWebRoutes(app);

const port = process.env.BACKEND_PORT || 5678;

app.listen(port, () => {
    console.log("I'm a cute backend and as the brain of this project I'm happy to serve everyone' request at port " + port);
});

export const globalCache = new NodeCache({stdTTL: process.env.CACHE_TTL || 259200, checkperiod: process.env.CACHE_CHECK || 302400});

app.use(errorHandling);