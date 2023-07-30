import {Database, Firestore} from "../config/firebaseInit";
import {Group} from "../models/Group";
import {b56gen} from "../utils";
import {internalGetUserInfo} from "./userController";
import {createRoom, internalGetRoomInfo, internalUpdateCacheListRoom} from "./roomController";
import {Room} from "../models/Room";
require("dotenv").config();

const internalGetGroup = async (groupId) => {
    if (groupId == null || groupId == "") {
        return null;
    }
    const groupData = await Firestore.collection('group')
        .doc(groupId)
        .get();
    if (!groupData.exists) {
        return null;
    } else {
        return groupData.data();
    }
}
const internalGetMembers = async (groupId) => {
    let groupData = await internalGetGroup(groupId);
    if (groupData === null) {
        return null;
    } else {
        return groupData.members;
    }
}

const internalGetRooms = async (groupId) => {
    let groupData = await internalGetGroup(groupId);
    if (groupData === null) {
        return null;
    } else {
        return groupData.rooms;
    }
}

const internalGetCourses = async (groupId) => {
    let groupData = await internalGetGroup(groupId);
    if (groupData === null) {
        return null;
    } else {
        return groupData.courses;
    }
}

export const getGroup = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == "" || uid == null) {
        return res.json({msg: 'err invalid uid', data: null})
    }
    const groupId = data.groupId;
    let group = await internalGetGroup(groupId);
    if (group) {
        return res.json({msg: 'ok', data: group});
    } else {
        return res.json({msg: 'err invalid group', data: null});
    }
}

export const createGroup = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == "" || uid == null) {
        return res.json({msg: 'err invalid uid', data: null})
    }
    const name = data.name;
    const desc = data.desc;
    const members = data.members;
    const rooms = data.rooms;
    const courses = data.courses;
    const groupId = b56gen(process.env.GROUP_ID_LENGTH || 6);
    while (true) {
        const tmpDoc = await Firestore.collection("group")
            .doc(groupId)
            .get();
        if (!tmpDoc.exists) {
            break;
        }
    }

    const newGroup = new Group(groupId,
        uid,
        name,
        desc,
        members || {},
        rooms || {},
        courses || {}
    );

    Firestore.collection('group').doc(groupId).set(
        newGroup.infoToJSON()
    ).then(() => {
        Database.ref(`groups/${groupId}/members`).child(uid).set({role: 'owner'});
        return res.json({msg: 'ok group created', data: data.infoToJSON});
    }, (error) => {
        return res.json({msg: `err ${error}`, data: null});
    });
}
export const deleteGroup = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == "" || uid == null) {
        return res.json({msg: `err invalid uid`, data: null})
    }
    const groupId = data.groupId;
    const group = await internalGetGroup(groupId);
    const ownerId = group.ownerId;
    if (uid !== ownerId) {
        return res.json({msg: "err invalid action"});
    }
    Firestore.collection('group').doc(groupId)
        .delete();
    Database.ref("groups").child(groupId).remove();
    return res.json({msg:'ok'});
}
export const groupAddMember = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == "" || uid == null) {
        return res.json({msg: 'error', data: null})
    }
    const groupId = data.groupId;
    const memberId = data.member;
    const group = await internalGetGroup(groupId);
    const user = await internalGetUserInfo(memberId);
    if (group == null || user == null) {
        return (group == null) ? res.json({msg: "err invalid group", data: null}) : res.json({msg:"err invalid user", data:null});
    }
    await Database.ref(`groups/${groupId}/members`).child(memberId).set({role: "member"});
    return res.json({msg: "ok added member", data: memberId});
}
const internalCreateRoom = async (uid, data) => {
    if (uid == null || uid == "") {
        return null;
    }
    let ok = false;
    const rid = b56gen(process.env.ROOM_ID_LENGTH || 6);
    while (!ok) {
        const tmpDoc = await Firestore.collection("rooms")
            .doc(rid)
            .get();
        if (!tmpDoc.exists) ok = true;
    }
    let newRoom = new Room(rid,
        uid,
        data.name || "",
        data.desc || "",
        data.diff || "",
        data.testId || 0,
        data.qNum || 0
    );
    Firestore.collection("rooms").doc(rid)
        .set(newRoom.toJSON())
        .catch((error) => {
            return console.log({"msg": `err ${error}`, "data": null});
        });

    Database.ref("rooms_data/"+rid+"/userPart").child(uid).set({
        "mode": 9,
    }).then(
        () => {
            internalUpdateCacheListRoom(rid);
        },
        (error) => (console.log(error))
    )
    return rid;
}
export const groupAddNewRoom = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == "" || uid == null) {
        return res.json({msg: 'err invalid uid', data: null})
    }
    const groupId = data.groupId;
    const roomData = data.roomData;
    const group = await internalGetGroup(groupId);

    if (group == null) {
        return res.json({msg: "err invalid group", data: null});
    }
    const roomId = await internalCreateRoom(uid, roomData);
    await Database.ref(`groups/${groupId}/rooms`).child(roomId).set({status:"ok"});
    return res.json({msg: "ok added new room", data: roomId});

}
export const groupAddExistingRoom = async (req, res) => {
    const uid = req.body.uid;
    const data = req.body.data;
    if (uid == "" || uid == null) {
        return res.json({msg: 'err invalid uid', data: null})
    }
    const groupId = data.groupId;
    const roomId = data.roomId;
    const group = await internalGetGroup(groupId);

    if (group == null) {
        return res.json({msg: "err invalid group", data: null});
    }

    const room = await internalGetRoomInfo(roomId);
    if (room == null) {
        return res.json({msg: "err no such room", data: null});
    }
    await Database.ref(`groups/${groupId}/rooms`).child(roomId).set({status:"ok"});
    return res.json({msg: "ok added room", data: roomId});

}

