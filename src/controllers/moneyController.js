import {Firestore} from "../config/firebaseInit";

export let getUserPossession = (req, res) => {
    let uid = req.body.uid;
    if(uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    Firestore.collection("storage").doc(uid)
        .get()
        .then((doc) => {
            return res.json({"data": doc.data(), "msg": (doc.exists ? "ok": "err User not found")});
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err "+error});
        });
};

const updateBalance = async (uid, action, amount) => {
    let balanceData = await Firestore.collection("storage")
        .doc(uid)
        .get();
    if (!balanceData.exists) {
        return null;
    }
    let currentBalance = balanceData.data().balance;
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
        res.json({"data": null, "msg": "err User not vaild"});
    }
    if (newBalance === null) {
        res.json({"data": null, "msg": "err Invalid transaction"});
        return;
    }

    Firestore.collection("storage").doc(uid)
        .update("balance", newBalance)
        .then(() => {
            return res.json({"currentBalance": newBalance, "msg": "ok"})
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err "+error});
        });
}