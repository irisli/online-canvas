/**
    This file sets up the layout and creates a handler that adjusts the canvas
    size. This also manages the drawing events.
**/
"use strict";

var myColor = "#000"; // Will be overwritten after client ID is created

$(document).ready(function() {
    var canvas = $("#draw-container canvas")[0];
    var CANVAS_RATIO = canvas.width/canvas.height; // Aspect ratio of the canvas (16:9 -> 16/9)

    var penDown = false;
    var penSize = 10;
    var eraser = false;

    var context = canvas.getContext("2d");
    drawer.setContext(context);

    // Mouse and touch drawing events
    $(canvas).bind("mousedown mousemove mouseup mouseleave " +
                   "touchstart touchmove touchend touchleave",function(e) {
        // Prevent scrolling when touching canvas
        if (e.type == "touchmove") {
            event.preventDefault();
        }

        if (e.type.substr(0,5) == "touch") {
            var canvasX = Math.round((e.originalEvent.touches[0].pageX - canvas.offsetX)*canvas.width / $(canvas).width()),
                canvasY = Math.round((e.originalEvent.touches[0].pageY - canvas.offsetY)*canvas.height / $(canvas).height());
        } else {
            var canvasX = Math.round((e.pageX - canvas.offsetX)*canvas.width / $(canvas).width()),
                canvasY = Math.round((e.pageY - canvas.offsetY)*canvas.height / $(canvas).height());
        }

        if (e.type == "mouseup" || e.type == "touchend") {
            penDown = false;
        } else if (e.type == "mouseleave" || e.type == "touchleave") {
            if (penDown) {
                context.addPoint(canvasX, canvasY, true);
            }
            penDown = false;
        } if (e.type == "mousedown" || e.type == "touchstart") {
            penDown = true;
            context.addPoint(canvasX, canvasY, false);
        } else if ((e.type == "mousemove" || e.type == "touchmove") && penDown) {
            context.addPoint(canvasX, canvasY, true);
        }
    });

    $("#draw-tools ul li.pen").css("color", myColor);
    $("#draw-tools ul li.pen.small").addClass("current");
    $("#draw-tools ul li").bind("click ",function(e) {
        $("#draw-tools ul li").removeClass("current");
        $(this).addClass("current");
        if ($(this).hasClass("eraser")) {
            eraser = true;
            myColor = ".#" + clientID.substr(0, 6);
            if ($(this).hasClass("small")) {
                penSize = 20;
            } else if ($(this).hasClass("medium")) {
                penSize = 40;
            } else if ($(this).hasClass("large")) {
                penSize = 80;
            }
        } else {
            eraser = false;
            myColor = "#" + clientID.substr(0, 6);
            if ($(this).hasClass("small")) {
                penSize = 10;
            } else if ($(this).hasClass("medium")) {
                penSize = 20;
            } else if ($(this).hasClass("large")) {
                penSize = 40;
            }
        }
    });

    context.addPoint = function(x, y, continuation) {
        drawer.drawPoint({color: myColor, x: x, y: y, size: penSize, continuation: continuation}, true);
    };

    // reLayout() calculates what the size of the canvas should be
    function reLayout() {
        var newHeight, newWidth;
        // Figure out what is limiting the size of our container and resize accordingly
        if ($("body").height() * CANVAS_RATIO > $("body").width()) {
            // Limited by width
            newWidth = $("body").width();
            newHeight = $("body").width() / CANVAS_RATIO;
        } else {
            // Limited by height
            if ($("body").height() < parseInt($("#draw-container").css("min-height"))) {
                newWidth = $("#draw-container").css("min-height") * CANVAS_RATIO;
                newHeight = $("#draw-container").css("min-height");
            } else {
                newWidth = $("body").height() * CANVAS_RATIO;
                newHeight = $("body").height();
            }
        }

        $("#draw-container").css({"width" : newWidth, "height": newHeight});
        $(canvas).css({"width": newWidth, "height": newHeight});

        // Save some info about the canvas for later calculations
        canvas.offsetX = $(canvas).offset()["left"];
        canvas.offsetY = $(canvas).offset()["top"];
    }

    $(window).resize(function() {
        reLayout();
    }).trigger("resize");
});