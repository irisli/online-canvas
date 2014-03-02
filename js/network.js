"use strict";

var socket = io.connect("http://drawserver.iris.li/");

function getRandomHash() {
    return CryptoJS.SHA256("" + new Date().getTime() + Math.random() + Math.random()).toString();
}

var clientID = getRandomHash();
var myColor = "#" + clientID.substr(0, 6);

var network = {
    ready: false, // Turns to true when we are ready to seed
    sendRequest: function (method, params, callback, noID) {
        /**
         * Sends a JSON-RPC request. The callback is triggered when a request is received
         */
        if (noID === true) {
            var requestHash = "";
        } else {
            var requestHash = getRandomHash();
        }
        params = (typeof params === "undefined") ? [] : params;
        socket.emit("message", {method: method, params: params, id: requestHash});

        if (typeof callback === "function") {
            this.responseListener.add(requestHash, callback);
        }

        //console.log("Sending Request: " + JSON.stringify({method: method, params: params, id: requestHash}));
        return requestHash;
    },
    sendResponse: function (result, error, id) {
        error = (typeof result === "undefined") ? error : null;
        //console.log("Sending Response: " + JSON.stringify({result: result, error: error, id: id}));
        socket.emit("message", {result: result, error: error, id: id});
    },

    /**
     * Whenever a JSON-RPC response is seen, the trigger() method is invoked to see
     * if there is any response bound to that id.
     */
    responseListener: {
        listeners: [],
        add: function(id, callback) {
            if (typeof callback === "function") {
                this.listeners.push({"id":id, "callback":callback});
            }
        },
        trigger: function(result, id) {
            for (var i = 0, l = this.listeners.length; i < l; i++) {
                if (id == this.listeners[i].id) {
                    if (typeof this.listeners[i].callback === "function") {
                        this.listeners[i].callback(result, id);
                    }
                    return;
                }
            }
        },
        // Removes a listener by id
        remove: function(id) {
            //console.log("Event listener for " + id + " was removed.");
            for (var i = 0, l = this.listeners.length; i < l; i++) {
                if (this.listeners[i] !== "undefined" && this.listeners[i].hasOwnProperty("id") && this.listeners[i].id == id) {
                    this.listeners.splice(i, 1);
                }
            }
        }
    }
};

/**
 * These are the events that the websocket server will emit
 *
 * When sending messages, make sure the type is set to "message", or other clients won't receive your data
 * (e.g. socket.emit("message", { ... }); )
 */
socket.on("welcome", function () {
    // Connection is established, start using the socket
    
    if (!network.ready) { // Just in case we get multiple welcomes
        console.log("%cWelcome. You are (" + myColor + ")" + clientID.substr(6, 58), "color: green");
        console.log("Finding a seeder.");

        var findSeederID = network.sendRequest("findSeeder", [], function (response, id) {
            // Callback triggered when a response to findSeeder is received
            window.clearTimeout(findSeederTimeoutID);
            network.responseListener.remove(id);

            var getSeedDataID = network.sendRequest("getSeedData", [response], function(response, id) {
                // Seed data received. Now render it.
                console.log("Got seed data. ~" + JSON.stringify(response).length/1000 + " KB");
                window.clearTimeout(seederResponseTimeoutID);
                network.responseListener.remove(id);
                network.ready = true;
                drawer.drawSeed(response);
            });

            // If there is no response after 2 seconds, then we assume that there are no clients.
            var seederResponseTimeoutID = setTimeout(function(id) {
                network.responseListener.remove(id);
                network.ready = true;
                console.log("Seeder didn't respond.");
            }, 5000, getSeedDataID);
        });

        // If there is no response after 2 seconds, then we assume that there are no clients.
        var findSeederTimeoutID = setTimeout(function(id) {
            network.responseListener.remove(id);
            network.ready = true;
            console.log("No seeders found.");
        }, 2000, findSeederID);
    }
});

socket.on("message", function (data) {
    if (typeof data.method !== "undefined") {
        if (network.ready && data.method == "findSeeder") {
            console.log("A client is looking for a seeder");
            network.sendResponse(clientID, null, data.id);
        } else if (network.ready && data.method == "getSeedData" && data.params[0] == clientID) {
            console.log("A client wants us to seed to them.");
            network.sendResponse(canvasData.packSeedData(), null, data.id);
        } else if (network.ready && data.method == "newPoints") {
            console.log("Got some new points.");
            drawer.drawPoints(data.params);
        }
    } else if (typeof data.result !== "undefined") {
        network.responseListener.trigger(data.result, data.id);
    }
});

socket.on("error", function (err) {
    // Sometimes things go wrong!
    var type = err.type;    // This is the type of error that occurred
    var message = err.message;    // This is a friendly message that should describe the error
    alert("Socket error: " + message);
});