import {Firestore} from "../config/firebaseInit";

let internalGetUserPossession = async (uid) => {
    let doc = await Firestore.collection("storage")
        .doc(uid).get();
    if (doc.exists) {
        return doc.data();
    } else {
        return null;
    }
}

export let getUserPossession = async (req, res) => {
    let uid = req.body.uid;
    if (uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    let data = await internalGetUserPossession(uid);
    if (data) {
        return res.json({"data": data, "msg": "ok"});
    } else {
        return res.json({"data": null, "msg": "err"});
    }
};
export let setUserPossession = (uid, data) => {
    if (uid == null || uid == "") {
        return;
    }
    const balance = data.balance;
    const items = data.items;
    Firestore.collection("storage").doc(uid)
        .set({balance: balance, items: items})
        .then(() => {
            console.log('possession set')
        })
        .catch((error) => {
            console.log(error)
        });
}

export let addItemToUser = async (uid, data) => {
    if (uid == null || uid == "") {
        return;
    }
    const item = data.item;
    const itemInfo = data.itemInfo;
    const currentPossession = await internalGetUserPossession(uid);
    const itemList = currentPossession.items;
    itemList[item] = itemInfo;
    setUserPossession(uid, {balance:currentPossession.balance, items:itemList});
}

const updateBalance = async (uid, action, amount) => {
    let balanceData = await internalGetUserPossession(uid);
    if (balanceData === null) {
        return null;
    }
    let currentBalance = balanceData.balance;
    if (amount < 0) {
        return null;
    }
    if (action === 'set') {
        return amount;
    } else if (action === 'deposit') {
        return currentBalance + amount;
    } else if (action === 'withdraw') {
        if (currentBalance < amount) {
            return null;
        }
        return currentBalance - amount;
    }
}

export let updateUserBalance = async (req, res) => {
    let uid = req.body.uid;
    let amount = req.body.data.amount;
    let action = req.body.data.action;
    let newBalance = await updateBalance(uid, action, amount)
    if (uid == null || uid == "") {
        return res.json({"data": null, "msg": "err User not vaild"});
    }
    if (newBalance === null) {
        return res.json({"data": null, "msg": "err Invalid transaction"});
    }

    Firestore.collection("storage").doc(uid)
        .update("balance", newBalance)
        .then(() => {
            return res.json({"currentBalance": newBalance, "msg": "ok"})
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err " + error});
        });
}

export let internalUpdateUserBalance = async (uid, action, amount) => {
    let newBalance = await updateBalance(uid, action, amount);
    if (uid == null || uid == "") {
        return ;
    }
    if (newBalance === null) {
        return ;
    }
    Firestore.collection("storage").doc(uid)
        .update("balance", newBalance)
        .then(() => {
            console.log('balance updated');
        })
        .catch((error) => {
            console.log(error);
        });
}