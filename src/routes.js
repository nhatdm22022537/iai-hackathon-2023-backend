let homeCtrl = require('./controllers/homeController');
let userCtrl = require('./controllers/userController');
let roomCtrl = require('./controllers/roomController');
let moneyCtrl = require("./controllers/moneyController");
export let initWebRoutes = (app) => {
    app.route('/')
    .get(homeCtrl.getHomePage);

    app.route('/user/get')
    .get(userCtrl.getUserInfo);
    
    app.route('/user/update')
    .post(userCtrl.setUserInfo);

    app.route('/room/create')
    .post(roomCtrl.createRoom);

    app.route('/user/possession')
        .get(moneyCtrl.getUserPossesion);

    app.route('/user/possession')
        .put(moneyCtrl.updateUserBalance)
}