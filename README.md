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
- If you are running in a development environment, run the server with:
```
npm run dev
```
- If running in a server, run the server by:
    - Build: `npm run build`
    - Serve: `npm run serve`
    - Use `serve` whenever the server restarts, use `build` whenever the code changed.

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

Request (POST): Get details of an specific user. Return the data of that user.
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

Request (POST): Get the data of the desired room. 
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

Request (POST): Get the current user list and their details of the desired room.
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
- This module uses WebSocket (aka WS), specifically Socket.io for the most part.
- Each user will now be identified by a socket ID, and multiple socket ID can be used by a single user at the same time (i.e. an user can join multiple game at the same time).
- The event name starting with `post-` is from client (you post the requests to the server), `get-` is from server (you get the updates from the server).
- Note: You would need the Flask server running to be able to check for the answer.

#### Route `/game/get`
Request (POST): Get the current data of this game (of course not including other players "sensitive" data).

This should be (mostly) used whenever the user join in the first time, or when the user reconnect (to get the lost game data). The intended way to get the data in real-time is through listening to WS events.

Note: The response is not entirely completed at the moment.
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
    "data": {
        "details": {},
        "players": {
            "QdAErfCdDOZl4sgDe3e0vlxPUWn1": {
                "online": false,
                "ready": 0
            },
            "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3": {
                "online": false,
                "ready": 9
            }
        }
    }
}
```

#### Event `post-joinRoom`
Request server to join the current socket to a WS room, so that this socket can listen to events happening in the desired WS room.

Note that it's different from the very first request to join a "game room" (use `/room/join` above). This can be used whenever the user reconnect.

Body:
- Arg1: `<User's id>`
- Arg2: `<Room's id>`

Example:
```
hPnZoOJ5K3VPD9BWgo7KtxkuUBC3
pngTjn
```

#### Event `get-join`
Notify when a new user join the game room. It will be sent automatically to all user in the room by server when someone use `/room/join`.

Body:
- Arg1: `<New user details>`

Example:
```
{
    "uid": "QdAErfCdDOZl4sgDe3e0vlxPUWn1",
    "uname": "ball08",
    "priv": "0",
    "email": "maivannhatminh2005@gmail.com"
}
```

#### Event `get-leave`
Notify when a user leave the game room. It will be sent automatically to all user in the room by server when someone use `/room/leave`.

Body:
- Arg1: `<Left user's id>`

Example:
```
QdAErfCdDOZl4sgDe3e0vlxPUWn1
```

#### Event `get-state`
Notify when a user is online/offline. It will be sent automatically to all user in the room by server when someone connect/disconnect.

Body:
- Arg1: `<User's id>`
- Arg2: `<State> (online: true / offline: false)`

Example:
```
QdAErfCdDOZl4sgDe3e0vlxPUWn1
false
```

#### Event `get-ready`
Notify when a user is ready. It will be sent automatically to all user in the room by server when someone update their ready state.

There are 3 values possible:
- `0`: User is not ready yet/cancel ready (needs to press ready button).
- `1`: User pressed ready button (ready to participate).
- `2`: User client loaded all the game content and fully prepared for the game (ready to start the timer).

Body:
- Arg1: `<User's id>`
- Arg2: `<State> (0: not ready / 1: pressed ready button / 2: fully prepared)`

Example:
```
QdAErfCdDOZl4sgDe3e0vlxPUWn1
1
```

#### Event `post-ready`
Post the current user's ready status to the server.

There are 3 values possible:
- `0`: User is not ready yet/cancel ready (needs to press ready button).
- `1`: User pressed ready button (ready to participate).
- `2`: User client loaded all the game content and fully prepared for the game (ready to start the timer).

Body:
- Arg1: `<State> (0: not ready, 1: pressed ready button / 2: fully prepared)`

#### Event `get-start`
Notify when the game started/the timer started.

There are 2 values possible:
- `1`: Owner pressed the start button (and then all players started to load the game content...).
- `2`: **All** user had loaded the game content and fully prepared for the game (start the timer).

Body:
- Arg1: `<State> (1: pressed start button / 2: fully prepared)`

#### Event `post-start`
Post the request to start the game. Only the owner can post this request (others' will be ignored).

Body: None.

#### Event `post-answer`
Post the user's answer of a specific question to the server.

Note: You would need the Flask server running.

Body:
- Arg1: `<Question Number> (index start from 0)`
- Arg2: `<User's answer> (index start from 0, i.e 0=A, 1=B, 2=C, 3=D)`
- Arg3: `<User's stats> (includes hp, atk, def)` 

Example (Fifth question, chose A):
```
4
0
{
    "hp": 20,
    "def": 15,
    "atk": 4
}
```

#### Event `get-answer`
The server's verdict of the user's answer.

Note: You would need the Flask server running.

Body:
- Arg1: `<Question Number> (index start from 0)`
- Arg2: `<Verdict> (false = Incorrect, true = Correct)`

Example (Fifth question, user was correct):
```
4
true
```

#### Event `get-playerData`
Notify when the data of a user is changed.

Body:
- Arg1: `<User's id>`
- Arg2: `<Correct streak>`
- Arg3: `<Number of correct answers>`
- Arg4: `<Points>`

Example:
```
QdAErfCdDOZl4sgDe3e0vlxPUWn1
5
7
1707
```

#### Event `get-end`
Notify when a user ended the game.

Note: Gems will be added automatically after the game. Data of that player in the game will also be saved.

Body:
- Arg1: `<User's id>`
- Arg2: `<Rewarded gems>`

Example:
```
QdAErfCdDOZl4sgDe3e0vlxPUWn1
27
```

#### Event `post-end`
Declare that this user ended the game.

Body: None.

### Shop module
#### Route `/shop` 
Request (POST): Get all the items the shop currently have.
- Requirement: None.
- Body: None.
  
Response:
```
{
    "msg": "ok",
    "itemList": {
        "hihi": {
            "cost": 99999,
            "name": "hihi",
            "type": "skin",
            "description": "blue eye's white dragonn"
        }
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
    "msg": "ok thank for purchasing"
}
```

- When buy failed (insufficient balance):
```
{
    "data": "lol",
    "msg": "err insufficient balance"
}
```
- When buy failed (item possessed):
```
{
    "data": "lol",
    "msg": "err you already have this item"
}
```
### Group module 
#### Route `/group/get`
Request (POST): Get the required group
- Requirement:
  - groupId
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "groupId": "tk6YtR"
    }
}
```

Response:
```
{
    "msg": "ok",
    "data": {
        "groupId": "tk6YtR",
        "name": "TeamOne",
        "description": "20 mil",
        "ownerId": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3"
    }
}
```

#### Route `group/create`
Request (POST): Create a new group
- Requirement: 
  - user's id
  - group's data
- Body 
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "name": "TeamOne",
        "desc": "20 mil"

    }
}
```

Response:
```
{
    "msg": "ok group created",
    "data": {
        "groupId": "tk6YtR",
        "ownerId": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
        "name": "TeamOne",
        "description": "20 mil"
    }
}
```
#### Route `/group/members/add`
Request (POST): Add a member to the group
- Requirement:
  - groupId
  - memberId
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "groupId": "tk6YtR",
        "member": "xd8dbmwQ0ES6Uy5iwFGPri1v0Cu2"
    }
}
```

Response:
```
{
    "msg": "ok added member",
    "data": "xd8dbmwQ0ES6Uy5iwFGPri1v0Cu2"
}
```

#### Route `group/rooms/create`
Request (POST): Add a new room into the group
- Requirement:
  - user's id
  - group id
  - room data
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "groupId": "tk6YtR",
        "roomData": {
            "name":"",
            "desc":"",
            "diff":"",
            "testId":"",
            "qNum":""
        }
    }
}
```
Response:
```
{
    "msg": "ok added new room",
    "data": "5v6hrh"
}
```

#### Route `group/rooms/add`
Request (POST): Add an existing room into the group
- Requirement:
  - user's id
  - group id
  - room's id
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "groupId": "tk6YtR",
        "roomId": "iSe9VR"
    }
}
```
Response: 
```
{
    "msg": "ok added room",
    "data": "iSe9VR"
}
```
#### Route `group/ranking`
Request(POST): Get the group's ranking
- Requirement:
  - Group's id
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "groupId": "tk6YtR"
    }
}
```
Response:
```
{
    "msg": "ok ranking",
    "data": [
        {
            "rank": 1,
            "memberData": {
                "uid": "xd8dbmwQ0ES6Uy5iwFGPri1v0Cu2",
                "uname": "kanaluvu",
                "priv": "0",
                "email": "mail@gmail.com"
            },
            "overallEvaluation": 2100
        },
        {
            "rank": 2,
            "memberData": {
                "uid": "QdAErfCdDOZl4sgDe3e0vlxPUWn1",
                "uname": "ball08",
                "priv": "0",
                "email": "maivannhatminh2005@gmail.com"
            },
            "overallEvaluation": 1428
        }
    ]
}
```

### Storage module 
#### Route `/storage/get`
Request (POST): Get the user's balance and inventory
- Requirement: 
  - user's uid
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3"
}
```
Response:
```
{
    "data": {
        "items": {
            "hihi": {
                "cost": 99999,
                "name": "hihi",
                "description": "blue eye's white dragonn",
                "type": "skin"
            }
        },
        "balance": 1234550
    },
    "msg": "ok"
}
```
#### Route `/storage/update`
Request (POST): Update user's balance (balance only because user's items will be updated from the server)
- Requirement
  - user's uid
  - action: "set", "deposit", "withdraw"
  - the new's balance("set") / the amount of changes("deposit","withdraw")
- Body:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "action": "set",
        "amount": 1234550
    }
}
```
Response:
```
{
    "msg": "ok",
    "currentBalance": 1234550
}
```
