/**
    The drawer object manages all the aspects of drawing and is the bridge between
    the ui and the network.
**/
"use strict";

function Drawer() {
    this.lastPoints = {};
    this.context = null;
    this.lastColorDrawn = "";
}

// If the user drew stuff before seed was received, this makes sure it floats to the top
Drawer.prototype.drawSeed = function(seedData) {
    var newPoints = canvasData.unpackSeedData(seedData);
    var oldPoints = canvasData.unpackSeedData(canvasData.packSeedData()).slice();
    canvasData.delete();
    this.clearCanvas();

    this.drawPoints(newPoints);
    this.drawPoints(oldPoints);
};

Drawer.prototype.setContext = function(context) {
    this.context = context;
    context.lineJoin = "round";
};

Drawer.prototype.drawPoints = function(points, send) {
    for (var i in points) {
        this.drawPoint(points[i], send);
    }
};

// All the canvas heavy lifting is done here. Only new lines are drawn.
// If send is true, then the data will be sent to other clients
Drawer.prototype.drawPoint = function(point, send) {
    if (this.context === null) {
        throw "The drawer's context must be set before attempting to draw points";
    }

    // Queue up the point for other clients
    if (send === true) {
        networkDrawQueue.addPoint(point);
    }
    canvasData.addPoint(point.color, point.x, point.y, point.size, point.continuation);

    this.context.beginPath();

    // Set line attributes
    if (point.color.charAt(0) == ".") {
        // Leading period denotes eraser.
        this.context.strokeStyle = "#fff";
    } else {
        this.context.strokeStyle = point.color;
    }
    this.context.lineWidth = point.size;

    // Figure out where to start the line
    if (point.continuation == true){
        var lastPosition = this.getLastPoint(point.color, point.x, point.y);
        this.context.moveTo(lastPosition.x, lastPosition.y);
    } else { // Starting a new line
        this.context.moveTo(point.x, point.y - 1 /* -1 for dot */);
    }
    
    // Draw the actual line
    this.context.lineTo(point.x, point.y);
    this.context.closePath();
    this.context.stroke();

    // Pave the way for the next line
    this.setLastPoint(point.color, point.x, point.y);
    this.lastColorDrawn = point.color;
};

Drawer.prototype.clearCanvas = function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
};

// Gets the point at which the color last wrote at
Drawer.prototype.getLastPoint = function(color, defaultX, defaultY) {
    if (this.lastPoints.hasOwnProperty(color)) {
        return {x: this.lastPoints[color].x, y: this.lastPoints[color].y};
    } else {
        // If we couldn't find anything, then return the defaultX and defaultY
        return {x: defaultX, y: defaultY};
    }
};

// Records the point at which the color last wrote at
Drawer.prototype.setLastPoint = function(color, x, y) {
    this.lastPoints[color] = {x: x, y: y};
};

var drawer = new Drawer();