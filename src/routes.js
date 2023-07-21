const homeCtrl = require("./controllers/homeController");
const userCtrl = require("./controllers/userController");
const roomCtrl = require("./controllers/roomController");
const possessionCtrl = require("./controllers/PossessionController");
const shop = require("./shop")
export const initWebRoutes = (app) => {
    app.route("/")
        .get(homeCtrl.getHomePage);

    app.route("/user/get")
        .get(userCtrl.getUserInfo);

    app.route("/user/update")
        .post(userCtrl.setUserInfo);

    app.route("/room/create")
        .post(roomCtrl.createRoom);

    app.route("/room/update")
        .post(roomCtrl.updateRoom);

    app.route("/room/delete")
        .post(roomCtrl.deleteRoom);

    app.route("/room/join")
        .post(roomCtrl.joinRoom);

    app.route("/room/leave")
        .post(roomCtrl.leaveRoom);

    app.route("/room/list")
        .get(roomCtrl.getRoomUserList);

    app.route("/room/get")
        .get(roomCtrl.getRoomInfo);

    app.route("/storage/get")
        .get(possessionCtrl.getUserPossession);

    app.route("/storage/update")
        .put(possessionCtrl.updateUserBalance);

    app.route("/shop")
        .get(shop.getShop);

    app.route("/shop/buy")
        .post(shop.buyItem);
};
