/*
    Item: The fundamental objects which users can possess
    Item's property:
    - id: This act as item's identifier, and it's unique
    - type: For now there is only 1 type: "skin"
    - cost: Cost, obviously
    - description: Item's description
*/
import {Firestore} from "./config/firebaseInit";
import {addItemToUser, internalUpdateUserBalance} from "./controllers/PossessionController";

export class Item {
    constructor(name, type, cost, description) {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.description = description;
    }

    // fuck getter and setter
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            cost: this.cost,
            description: this.description
        }
    }
}


export const getShop = async (req, res) => {
    const itemList = {}
    const collection = (await Firestore.collection('shop')
        .get());
    collection.forEach((snapshot) => {
        const doc = snapshot.data();
        itemList[doc.name] = doc;
    })
    return res.json(itemList)
}

// param 'item' is in JSON format. Can be passed with toJSON method.
export const addShopItem = (id, item) => {
    Firestore.collection('shop').doc(id).set(
        item
    ).then(() => {
        console.log(item)
    })
}

export const removeShopItem = (id) => {
    Firestore.collection('shop').doc(id)
        .delete()
        .then(() => {
            console.log(`item with id=${id} gone`)
        })
}

export const buyItem = async (req, res) => {
    const uid = req.body.uid;
    const item = req.body.data.item;
    const possession = await Firestore.collection("storage")
        .doc(uid)
        .get()

    const currentPossession = possession.data();
    if (currentPossession.items[item]) {
        return res.json({'data': 'lol', 'msg': 'you already have this item'});
    }

    const itemData = (await Firestore.collection("shop")
        .doc(item)
        .get())
        .data();


    if (currentPossession.balance > itemData.cost) {
        const newItem = new Item(itemData.name, itemData.type, itemData.cost, itemData.description);
        await addItemToUser(uid, {item: item, itemInfo: newItem.toJSON()})
        await internalUpdateUserBalance(uid,  "withdraw", itemData.cost);
        return res.json({'data': 'lol', 'msg': 'thank for purchasing'});
    } else {
        return res.json({'data': 'lol', 'msg': 'gtfo poor people'});
    }
}



