/**
    The canvasData object contains all the vector data used to draw the lines.
**/
 "use strict";

function CanvasData() {
    /*jshint validthis: true */
    this.pathNodes = [];
}

CanvasData.prototype.addPoint = function(color, x, y, size, continuation) {
    this.pathNodes.push(new this.PathNode(color, x, y, size, continuation));
};

CanvasData.prototype.addPoints = function(points) {
    this.pathNodes = this.pathNodes.concat(points);
};

CanvasData.prototype.PathNode = function(color, x, y, size, continuation) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.size = size;
    this.continuation = continuation;
};

// Creates the seed data to send to a new client
CanvasData.prototype.packSeedData = function () {
    return {
        "pathNodes": this.pathNodes
    };
};

// Unpack the seed data (which is very simple but may become complex in the future)
CanvasData.prototype.unpackSeedData = function(seedData) {
    // This doesn't sanitize data so a malicious client could do bad things
    return seedData.pathNodes;
};

CanvasData.prototype.delete = function () {
    this.pathNodes.length = 0;
};

var canvasData = new CanvasData();