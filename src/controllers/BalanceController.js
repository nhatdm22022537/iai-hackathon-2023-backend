import {Firestore} from "../config/firebaseInit";

export const getUserPossession = (req, res) => {
    const uid = req.body.uid;
    if (uid == null || uid == "") res.json({"data": null, "msg": "err User not vaild"});
    Firestore.collection("storage").doc(uid)
        .get()
        .then((doc) => {
            return res.json({"data": doc.data(), "msg": (doc.exists ? "ok" : "err User not found")});
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err " + error});
        });
};
export const setUserPossession = async (req, res) => {
    const uid = req.body.uid;
    if (uid == null || uid == "") {
        res.json({"data": null, "msg": "err User not vaild"});
    }
    const balance = req.body.data.balance;
    const items = req.body.data.items;
    Firestore.collection("storage").doc(uid)
        .set({balance: balance, items: items})
        .then(() => {
            res.json({"data": {"balance": balance, "items": items}, "msg": "hihi"});
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err " + error});
        });
};

const updateBalance = async (uid, action, amount) => {
    const balanceData = await Firestore.collection("storage")
        .doc(uid)
        .get();

    const currentBalance = balanceData.data().balance;
    if (!balanceData.exists || amount < 0) {
        return null;
    }
    if (action === "set") {
        return amount;
    } else if (action === "deposit") {
        return currentBalance + amount;
    } else if (action === "withdraw") {
        if (currentBalance < amount) {
            return null;
        }
        return currentBalance - amount;
    }
};

export const updateUserBalance = async (req, res) => {
    const uid = req.body.uid;
    const amount = req.body.data.amount;
    const action = req.body.data.action;
    const newBalance = await updateBalance(uid, action, amount);
    if (uid == null || uid == "") {
        return res.json({"data": null, "msg": "err User not vaild"});
    }
    if (newBalance === null) {
        return res.json({"data": null, "msg": "err Invalid transaction"});
    }

    Firestore.collection("storage").doc(uid)
        .update("balance", newBalance)
        .then(() => {
            return res.json({"data": newBalance, "msg": "ok"});
        })
        .catch((error) => {
            return res.json({"data": null, "msg": "err " + error});
        });
};
