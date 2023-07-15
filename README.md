# IAI Hackathon 2023 - Testeria - NodeJS Backend
20mil will be in our hands.

## Getting started
- Clone this repo.
- Config the `.env` file based on the `.env.example` file (optional).
- Use your own Firebase Service Account if you want to use your own Firebase database, or to connect to the main database, use the file that was secretly given.

## Usage
### General
- The route can be found in the `routes.js` file.
- All request must be in JSON raw format like this:
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
- `/user/get` (GET): Get details of an specific user. Return the data of that user.

Request:
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

- `/user/update` (POST): Update details of the current user (not other user).

Request:
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
- `/room/create` (POST): Create a new room, current user is the owner. Require the room's data. Return the newly created room's id (rid).
The rid uses base56 character set (`23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz`).

Request:
```
{
    "uid": "hPnZoOJ5K3VPD9BWgo7KtxkuUBC3",
    "data": {
        "name": "t1 is the winner",
        "desc": "never gonna happen"
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

- `/room/join` (POST): Join the desired room. Require the room's id.
When execute, all users joined in the room will be notified (using WS).
Request:
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

WS emit:
```
    room: "sEGg69",
    key: "join",
    data: <user details>
```

- `/room/leave` (POST): Leave the desired room. Require the room's id.
When execute, all users joined in the room will be notified (using WS).
Request:
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

WS emit:
```
    room: "sEGg69",
    key: "leave",
    data: <uid>
```
