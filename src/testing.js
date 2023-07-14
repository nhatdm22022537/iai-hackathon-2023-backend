import {Firestore, Database} from "./config/firebaseInit";

Database.ref('users/').set({
    username: '???'
})