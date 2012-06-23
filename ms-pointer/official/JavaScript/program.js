//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

/// <reference path="base-sdk.js" />

var context;
var brushList;
var canvas;

function onLoad() {
    var element;
    canvas = document.getElementById("paintCanvas");

    // account for margins
    canvas.width = window.innerWidth - 25;
    canvas.height = window.innerHeight - 125;

    context = canvas.getContext("2d");
    canvas.addEventListener("MSPointerDown", canvasHandler, false);
    canvas.addEventListener("MSPointerMove", canvasHandler, false);
    canvas.addEventListener("MSPointerUp", canvasHandler, false);
    canvas.addEventListener("MSPointerOver", canvasHandler, false);
    canvas.addEventListener("MSPointerOut", canvasHandler, false);
    canvas.addEventListener("MSPointerCancel", canvasHandler, false);
    canvas.addEventListener("MSGestureDoubleTap", clearCanvas, false);
    context.lineWidth = 1;
    context.lineCap = "round";
    context.lineJoin = "round";

    initColorPalette();
    initToolbar();

    brushList = new Object();
}

function initColorPalette() {
    var element = document.getElementById("palette");
    var divs = element.getElementsByTagName("div");
    for (var idx = 0; idx < divs.length; idx++) {
        divs[idx].addEventListener("MSPointerUp", colorSelector, false);
    }
}

// Clear canvas for new drawing
function initToolbar() {
    var element = document.getElementById("newFile");
    element.addEventListener("MSPointerUp", clearCanvas, false);
}

function colorSelector(evt) {
    context.strokeStyle = evt.srcElement.id;
    var element = document.getElementById("selectedColor");
    element.style.backgroundColor = evt.srcElement.id;
    evt.preventDefault();
}

function brushTool() {
    var brush = this;
    brush.started = false;
    brush.over = false;
    var x, y;

    // Even though the choice of raw coordinates over predicted coordinates has performance
    // overhead we will use raw coordinates because predicted coordinates don't give
    // accurate results for our purpose.
    this.MSPointerDown = function (evt) {
        canvas.msSetPointerCapture(evt.pointerId);
        context.beginPath();
        context.moveTo(evt.currentPoint.rawPosition.x, evt.currentPoint.rawPosition.y);
        x = evt.currentPoint.rawPosition.x;
        y = evt.currentPoint.rawPosition.y;
        brush.started = true;
        brush.over = true;
    };

    this.MSPointerOver = function (evt) {
        brush.over = true;
        if (brush.started) {
            context.moveTo(x, y);
            context.lineTo(evt.currentPoint.rawPosition.x, evt.currentPoint.rawPosition.y);
            x = evt.currentPoint.rawPosition.x;
            y = evt.currentPoint.rawPosition.y;
        } else if (evt.currentPoint.isInContact) {
            // If the Down occurred outside of the canvas element but the pointer is in contact,
            // simulate the Down behavior when the pointer enters the canvas
            brush.MSPointerDown(evt);
        }
    };

    this.MSPointerMove = function (evt) {
        if (brush.started) {
            // Adjust the line width by reading the contact width from
            // the event parameter. Use a width of 1 for pen and mouse.
            if (evt.pointerType === 2) {
                context.lineWidth = evt.width / 2;
            }   
            else {
                context.lineWidth = 1;
            }
            context.moveTo(x, y);
            context.lineTo(evt.currentPoint.rawPosition.x, evt.currentPoint.rawPosition.y);
            context.stroke();
            x = evt.currentPoint.rawPosition.x;
            y = evt.currentPoint.rawPosition.y;
        }
    };

    this.MSPointerUp = function (evt) {
        canvas.msReleasePointerCapture(evt.pointerId);
        if (brush.started) {
            brush.MSPointerMove(evt);
            context.closePath();
            brush.started = false;
        }
    };

    this.MSPointerOut = function (evt) {
        brush.over = false;
    };

    this.MSPointerCancel = this.MSPointerOut;
}

function canvasHandler(evt) {
    var brush;
    var func;
    
    if (brushList[evt.pointerId] === null ||
        brushList[evt.pointerId] === undefined) {
        brushList[evt.pointerId] = new brushTool();
    }

    brush = brushList[evt.pointerId];

    func = brush[evt.type];
    func(evt);

    if (!brush.started && !brush.over) {
        // clean up when the brush is finished
        brushList[evt.pointerId] = null;
    }
    evt.preventMouseEvent();
}

function clearCanvas(evt) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    evt.preventDefault();
}
