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


export let getShop = async (req, res) => {
    let itemList = {}
    let collection = (await Firestore.collection('shop')
        .get());
    collection.forEach((snapshot) => {
        let doc = snapshot.data();
        itemList[doc.name] = doc;
    })
    return res.json(itemList)
}

// param 'item' is in JSON format. Can be passed with toJSON method.
export let addShopItem = (id, item) => {
    Firestore.collection('shop').doc(id).set(
        item
    ).then(() => {
        console.log(item)
    })
}

export let removeShopItem = (id) => {
    Firestore.collection('shop').doc(id)
        .delete()
        .then(() => {
            console.log(`item with id=${id} gone`)
        })
}

export let buyItem = async (req, res) => {
    let uid = req.body.uid;
    let item = req.body.data.item;
    let possession = await Firestore.collection("storage")
        .doc(uid)
        .get()

    let currentPossession = possession.data();
    if (currentPossession.items[item]) {
        return res.json({'data': 'lol', 'msg': 'you already have this item'});
    }

    let itemData = (await Firestore.collection("shop")
        .doc(item)
        .get())
        .data();


    if (currentPossession.balance > itemData.cost) {
        let newItem = new Item(itemData.name, itemData.type, itemData.cost, itemData.description);
        await addItemToUser(uid, {item: item, itemInfo: newItem.toJSON()})
        await internalUpdateUserBalance(uid,  "withdraw", itemData.cost);
        return res.json({'data': 'lol', 'msg': 'thank for purchasing'});
    } else {
        return res.json({'data': 'lol', 'msg': 'gtfo poor people'});
    }
}



