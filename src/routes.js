let homeCtrl = require('./controllers/homeController');
let userCtrl = require('./controllers/userController');

export let initWebRoutes = (app) => {
    app.route('/')
    .get(homeCtrl.getHomePage);

    app.route('/user/:uid')
    .get(userCtrl.getUserInfo)
    .put(userCtrl.setUserInfo);
}