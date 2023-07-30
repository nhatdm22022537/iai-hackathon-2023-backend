const homeCtrl = require("./controllers/homeController");
const userCtrl = require("./controllers/userController");
const roomCtrl = require("./controllers/roomController");
const gameCtrl = require("./controllers/gameController");
const possessionCtrl = require("./controllers/possessionController");
const shopCtrl = require("./controllers/shopController");
const groupCtrl = require("./controllers/groupController");
const objCtrl = require("./controllers/frontEndObjectController");
export const initWebRoutes = (app) => {
    app.route("/")
        .get(homeCtrl.getHomePage);

    app.route("/user/get")
        .post(userCtrl.getUserInfo);

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

    app.route("/room/userlist")
        .get(roomCtrl.getRoomUserList);

    app.route("/room/get")
        .get(roomCtrl.getRoomInfo);

    app.route("/game/get")
        .get(gameCtrl.getGameStatus);

    app.route("/storage/get")
        .get(possessionCtrl.getUserPossession);

    app.route("/storage/update")
        .put(possessionCtrl.updateUserBalance);

    app.route("/shop")
        .get(shopCtrl.getShop);

    app.route("/shop/buy")
        .post(shopCtrl.buyItem);

    app.route("/group")
        .get(groupCtrl.getGroup);

    app.route("/group/create")
        .post(groupCtrl.createGroup);

    app.route("/group/delete")
        .post(groupCtrl.deleteGroup);

    app.route("/group/members/add")
        .post(groupCtrl.groupAddMember);

    app.route("/group/rooms/create")
        .post(groupCtrl.groupAddNewRoom);

    app.route("/object/get")
        .post(objCtrl.getObject);

    app.route("/object/post")
        .post(objCtrl.postObject);

};
