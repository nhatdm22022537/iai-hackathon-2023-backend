import {addShopItem, Item, removeShopItem} from "./shop";
import {addItem, addItemToUser} from "./controllers/PossessionController";

let homeCtrl = require('./controllers/homeController');
let userCtrl = require('./controllers/userController');
let roomCtrl = require('./controllers/roomController');
let possessionCtrl = require('./controllers/PossessionController')
let shop = require('./shop.js')
export let initWebRoutes = (app) => {
    app.route('/')
    .get(homeCtrl.getHomePage);

    app.route('/user/get')
    .get(userCtrl.getUserInfo);
    
    app.route('/user/update')
    .post(userCtrl.setUserInfo);

    app.route('/room/create')
    .post(roomCtrl.createRoom);

    app.route('/room/join')
    .post(roomCtrl.joinRoom);

    app.route('/room/leave')
    .post(roomCtrl.leaveRoom);

    app.route('/storage/get')
        .get(possessionCtrl.getUserPossession);

    app.route('/storage/update')
        .put(possessionCtrl.updateUserBalance);

    app.route('/shop')
        .get(shop.getShop)

    app.route('/shop')
        .post(shop.buyItem);

}