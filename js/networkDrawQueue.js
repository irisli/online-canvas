/**
    This object is the layer between drawing and sending. It manages when to
    actually send the data. It waits for a small period of time for items
    to queue up before sending the data to other clients.
**/
"use strict";

function NetworkDrawQueue() {
    this.pointQueue = [];
    this.sendTimer = null;
}

NetworkDrawQueue.prototype.addPoint = function(point) {
    if (this.pointQueue.length === 0) {
        this.sendTimer = setTimeout(this.sendQueue.bind(this), 100);
    }
    this.pointQueue.push(point);
};

NetworkDrawQueue.prototype.sendQueue = function() {
    var queuedPoints = this.pointQueue;
    this.pointQueue = []; // Change the reference but don't change the actual points
    network.sendRequest("newPoints", queuedPoints, false, true);
};

var networkDrawQueue = new NetworkDrawQueue();