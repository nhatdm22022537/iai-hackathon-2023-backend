import {Firestore} from "../config/firebaseInit";

const internalGetUserPossession = async (uid) => {
    const doc = await Firestore.collection("storage")
        .doc(uid).get();
    if (doc.exists) {
        return doc.data();
    } else {
        return null;
    }
}

export const getUserPossession = async (req, res) => {
    const uid = req.body.uid;
    if (uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    const data = await internalGetUserPossession(uid);
    if (data) {
        return res.json({"data": data, "msg": "ok"});
    } else {
        return res.json({"data": null, "msg": "err"});
    }
};
export const setUserPossession = (uid, data) => {
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

export const addItemToUser = async (uid, data) => {
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
    const balanceData = await internalGetUserPossession(uid);
    if (balanceData === null) {
        return null;
    }
    const currentBalance = balanceData.balance;
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

export const updateUserBalance = async (req, res) => {
    const uid = req.body.uid;
    const amount = req.body.data.amount;
    const action = req.body.data.action;
    const newBalance = await updateBalance(uid, action, amount)
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

export const internalUpdateUserBalance = async (uid, action, amount) => {
    const newBalance = await updateBalance(uid, action, amount);
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