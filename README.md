Online Canvas
-------------
This is a simple drawing app that uses html5 and canvas for the drawing and a
backend that uses socket.io to connect to other clients so that what is drawn
by one user is seen by all other users.

Each time the app is loaded, a new random color is generated.

##Network##
The server contains no drawing logic and all it does is relay messages from one
client to all other clients. New users attempt to get seed data which is an object
containing all previous lines that were drawn.

###Network data type###
This app uses a simple form of [JSON-RPC](http://en.wikipedia.org/wiki/JSON-RPC).
Since there is no drawing logic on the server, there may be multiple responses to the
same method request. Since there is no easy way to generate incremental request
ids, sha-256 is used to generate unique request ids.

```javascript
// Example
--> {"method": "echo", "params": ["Hello JSON-RPC"], "id": hash}
<-- {"result": "Hello JSON-RPC", "error": null, "id": hash}
```

###Getting the seed###
Upon opening the application, the new client uses the getSeed method to tell all
the other clients it wants a copy of all drawing that has occured.

```javascript
// Example
--> {"method": "findSeeder", "params": [], "id": hash}
```

Then, all the connected nodes should respond with their unique clientID (randomly
generated with sha-256).
```javascript
// Response to findSeeder
<-- {"result": string clientID, "error": null, "id": hash}
```

The new client will respond with the the clientHash that they want to get the
seed data from. This is usually the first person that responds to their getSeed.
This is designed to prevent multiple clients from unnecessarily sending seeds.
```javascript
--> {"method": "getSeedData", "params": [string clientID], "id": hash}
```

The client that was picked will now package and send the seed data.
```javascript
// Response to getSeedData
<-- {"result": Object packSeedData(), "error": null, "id": hash}
```

In the event that a nobody responds to getSeed after 5 seconds, the new client
will assume that it is the only client in the room.

###Drawing###
Whenever new lines are drawn, the client broadcasts it using the newPoints method.

```javascript
// Example
--> {"method": "newPoints", "params": [{color, x, y, continuation}, {...}, {...}], "id": hash}
```
Since a few seconds of drawing can generate more than a few hundred nodes, the
paths are coalesced during small time intervals and then sent. Instead of sending line segments
immediately as they are drawn, they are all queued up and sent 100ms after
the first queued item is created. This barely affects the perceived lag in drawing
while reducing the amount of messages sent.

No response to newPoints is expected and therefore it not carry a hash id.