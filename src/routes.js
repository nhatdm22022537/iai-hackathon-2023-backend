let homeCtrl = require('./controllers/homeController');
let userCtrl = require('./controllers/userController');
let roomCtrl = require('./controllers/roomController');
let balanceCtrl = require('./controllers/BalanceController')
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

    app.route('/room/list')
    .get(roomCtrl.listUserRoom);

    app.route('/storage/get')
        .get(balanceCtrl.getUserPossession);

    app.route('/storage/set')
        .post(balanceCtrl.setUserPossession);

    app.route('/storage/update')
        .put(balanceCtrl.updateUserBalance)
}