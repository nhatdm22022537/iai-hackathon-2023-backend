# IAI Hackathon 2023 - Testeria - NodeJS Backend
20mil will be in our hands.

## Getting started
- Clone this repo. Set the active directory to the newly generated folder.
- Install `npm` and then install required libraries:
```
npm install
```
- Copy and change `.env` file based on the `.env.example` file (optional).
- In the `config` folder, a JSON file that contains a Firebase Service Account (`firebaseAdminPK.json`) is needed. Use your self-generated file if you want to use your own Firebase database, or to use the official database, use the file that was secretly given.
- Run the server with:
```
npm start
```

## Usage
### General
- The route can be found in the `routes.js` file.
- The front-end should try to validate the user input first (although we tried to validate as thorough as possible).
- All request must be in JSON raw format like this (the `uid` or `data` is not needed every time but just add for safety measures):
```
{
    "uid": <the user's current uid>,
    "data": <request data, required data>
}
```
- All response will be in JSON raw format like this:
```
{
    "msg": <status, could be ok/err>,
    "data": <additional response data>
}
```

### User module
#### Route: `/user/get`

Request (GET): Get details of an specific user. Return the data of that user.
- Requirement: Current user's uid
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3"
}
```

Response:
```
{
    "msg": "ok",
    "data": {
        "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
        "priv": "0",
        "email": "kna@gmail.com",
        "uname": "knc"
    }
}
```

#### Route `/user/update`
Request (POST): Update details of the current user (not other user).
- Requirement:
    - Current user's uid
    - New data
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
        "priv": "0",
        "email": "kna@gmail.com",
        "uname": "knc"
    }
}
```

Response:
```
{
    "msg": "ok",
    "data": null
}
```

### Room module
#### Route `/room/create`: 

Request (POST): Create a new room, current user is the owner.

- Requirement: 
    - Require the room's data (as many as possible). Return the newly created room's id (rid).
    - The value of `testid` and `qnum` must be obtained first (by Flask server's API) before sending to this server.
    - `testid` and `qnum` can be blank (if user didn't upload the question file before).
    - `diff` represent the difficulty of the game, please set it in the range from `0` to `1` as float.
    - `tframe` is the maximum time allowed to answer a question (in seconds).
    - The rid uses base56 character set (`23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz`).
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "name": "t1 is the winner",
        "desc": "never gonna happen",
        "diff": 0.2,
        "tframe": 25,
        "testid": "f3cb7dc5bcda46d7999d0daaacefb4d6"
        "qnum": 69,
    }
}
```

Response:
```
{
    "msg": "ok",
    "data": "sEGg69",
}
```

#### Route `/room/update` 

Request (POST): Update the data of the desired room. Only change if the user sending it is the owner. 
- Requirement: Data contains room's id (everything else is optional).
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "desc": "save me",
        "name": "cute name",
        "diff": 0.3,
        "rid": "4naDWJ"
    }
}
```

Response:
```
{
    "msg": "ok",
    "data": null,
}
```

#### Route `/room/delete` 

Request (POST): Delete the desired room. Only delete if the user sending it is the owner. 
- Requirement: Room's id.
- Body
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": "4naDWJ"
}
```

Response:
```
{
    "msg": "ok",
    "data": null,
}
```
#### Route `/room/get` 

Request (GET): Get the data of the desired room. 
- Requirement: Room's id.
- Body
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": "5MAtq9"
}
```

Response:
```
{
    "msg": "ok",
    "data": {
        "owner": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
        "name": "t1 is the winner",
        "rid": "5MAtq9",
        "desc": "kill me",
        "diff": 0.2,
        "tframe": 25,
        "testid": "f3cb7dc5bcda46d7999d0daaacefb4d6"
        "qnum": 69,
    }
}
```

#### Route `/room/userlist` 

Request (GET): Get the current user list and their details of the desired room.
- Requirement:
    - The room's id.
- Body:
```
{
    "uid": "f2iEv5kKrtOua3bazpVFfW5t4hB2",
    "data": "sEGg69"
}
```

Response:
```
{
    "msg": "ok",
    "data": [
        {
            "user": {
                "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
                "priv": "0",
                "email": "kna@gmail.com",
                "uname": "knc"
            },
            "data": {
                "mode": 9
            }
        },
        {
            "user": {
                "uid": "QdAErfCdDOZl4sgDe3e0vlxPUWn1",
                "uname": "ball08",
                "priv": "0",
                "email": "maivannhatminh2005@gmail.com"
            },
            "data": {
                "mode": 1
            }
        }
    ]
}
```

#### Route `/room/join` 
Request (POST): Join the desired room. 
- Requirement:
    - Room's id.
    - When execute, all users joined in the room will be notified (using WS, more detail in the WS section).
- Body:
```
{
    "uid": "f2iEv5kKrtOua3bazpVFfW5t4hB2",
    "data": "sEGg69"
}
```

Response:
```
{
    "msg": "ok",
    "data": null,
}
```

#### Route `/room/leave` 

Request (POST): Leave the desired room. 
- Requirement:
    - The room's id.
    - When execute, all users joined in the room will be notified (using WS, more detail in the WS section).
- Body:
```
{
    "uid": "f2iEv5kKrtOua3bazpVFfW5t4hB2",
    "data": "sEGg69"
}
```

Response:
```
{
    "msg": "ok",
    "data": null,
}
```

### Game module
- This module uses WebSocket (specifically Socket.io) for the most part.
- Each user will now be identified by a socket ID, and multiple socket ID can be used by a single user in the same time (i.e. an user can join multiple game at the same time).


### Shop module
#### Route `/shop` 
Request (GET): Get all the items the shop currently have.
- Requirement: None.
- Body: None.
  
Response:
```
{
    "hihi": {
        "cost": 99999,
        "name": "hihi",
        "type": "skin",
        "description": "blue eye's white dragonn"
    }
}
```

#### Route `/shop/buy` 
Request (POST): Buy an item
- Requirement:
  - user's uid
  - item's name/id
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "item": "hihi"
    }
}
```

Response:
- When buy successfully:
```
{
    "data": "lol",
    "msg": "thank for purchasing"
}
```

- When buy failed (insufficient balance):
```
{
    "data": "lol",
    "msg": "gtfo poor people"
}
```
- When buy failed (item possessed):
```
{
    "data": "lol",
    "msg": "you already have this item"
}
```
