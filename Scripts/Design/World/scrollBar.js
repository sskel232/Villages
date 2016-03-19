"use strict";
function ScrollBar(anchor, width, zoom, horizontal) {
    var obj = {
        width: 15,
        bounds: [],
        boundsMinMax: null,
        zoom: null,
        baseZoom: null,
        arrow1: [],
        arrow2: [],
        moveBar: null,
        barColor: '#F0F0F0',
        disabledColor: '#BBBBBB',
        enabledColor: '#666666',
        moveBarColor: null,
        moveBarNoSelectColor: '#CDCDCD',
        moveBarSelectColor: '#A6A6A6',
        isMouseDownBar: false,
        isMouseDownArrow1: false,
        isMouseDownArrow2: false,
        mouseMoveOffset: null,
        maxPosition: 0,
        position: 0,
        arrowLength: 10,
        lengthBuffer: 2,
        widthBuffer: 1,
        movebarAnchor: 0,
        moveButtonIncrement: 4,
        moveTimer: null,
        moveTimerDelay: 20,
        horizontal: false,

        init: function (anchor, width, zoom, horizontal) {
            this.zoom = zoom;
            this.baseZoom = zoom;
            var halfHeight = this.width / 2;
            this.moveBarColor = this.moveBarNoSelectColor;
            this.horizontal = horizontal;

            if (this.horizontal) {
                this.bounds = [anchor,
                    { x: anchor.x + width, y: anchor.y },
                    { x: anchor.x + width, y: anchor.y + this.width },
                    { x: anchor.x, y: anchor.y + this.width },
                    anchor];
                this.boundsMinMax = vectorLogic.getMinMaxes(this.bounds);
                this.maxPosition = this.boundsMinMax.maxX - this.boundsMinMax.minX - 2 * this.arrowLength - 4 * this.lengthBuffer;
                this.arrow1 = [
                    { x: anchor.x + this.lengthBuffer, y: anchor.y + halfHeight },
                    { x: anchor.x + this.lengthBuffer + this.arrowLength, y: anchor.y + this.width - this.widthBuffer },
                    { x: anchor.x + this.lengthBuffer + this.arrowLength, y: anchor.y + this.widthBuffer },
                    { x: anchor.x + this.lengthBuffer, y: anchor.y + halfHeight }];

                this.arrow2 = [
                    { x: anchor.x + width - this.lengthBuffer, y: anchor.y + halfHeight },
                    { x: anchor.x + width - this.lengthBuffer - this.arrowLength, y: anchor.y + this.width - this.widthBuffer },
                    { x: anchor.x + width - this.lengthBuffer - this.arrowLength, y: anchor.y + this.widthBuffer },
                    { x: anchor.x + width - this.lengthBuffer, y: anchor.y + halfHeight }];
                this.movebarAnchor = anchor.x + this.lengthBuffer * 2 + this.arrowLength;
                this.moveBar = [
                    { x: this.movebarAnchor, y: anchor.y + this.width },
                    { x: anchor.x + width - this.arrowLength - this.lengthBuffer * 2, y: anchor.y + this.width },
                    { x: anchor.x + width - this.arrowLength - this.lengthBuffer * 2, y: anchor.y },
                    { x: this.movebarAnchor, y: anchor.y },
                    { x: this.movebarAnchor, y: anchor.y + this.width }
                ];
            }
            else {
                this.bounds = [anchor,
                    { x: anchor.x + this.width, y: anchor.y },
                    { x: anchor.x + this.width, y: anchor.y + width },
                    { x: anchor.x, y: anchor.y + width },
                    anchor];
                this.boundsMinMax = vectorLogic.getMinMaxes(this.bounds);
                this.maxPosition = this.boundsMinMax.maxY - this.boundsMinMax.minY - 2 * this.arrowLength - 4 * this.lengthBuffer;
                this.arrow1 = [
                    { x: anchor.x + halfHeight, y: anchor.y + this.lengthBuffer },
                    { x: anchor.x + this.width - this.widthBuffer, y: anchor.y + this.lengthBuffer + this.arrowLength },
                    { x: anchor.x + this.widthBuffer, y: anchor.y + this.lengthBuffer + this.arrowLength },
                    { x: anchor.x + halfHeight, y: anchor.y + this.lengthBuffer }];

                this.arrow2 = [
                    { x: anchor.x + halfHeight, y: anchor.y + width - this.lengthBuffer },
                    { x: anchor.x + this.width - this.widthBuffer, y: anchor.y + width - this.lengthBuffer - this.arrowLength },
                    { x: anchor.x + this.widthBuffer, y: anchor.y + width - this.lengthBuffer - this.arrowLength },
                    { x: anchor.x + halfHeight, y: anchor.y + width - this.lengthBuffer }];
                this.movebarAnchor = anchor.y + this.lengthBuffer * 2 + this.arrowLength;
                this.moveBar = [
                    { x: anchor.x, y: this.movebarAnchor },
                    { x: anchor.x + this.width, y: this.movebarAnchor },
                    { x: anchor.x + this.width, y: anchor.y + width - this.arrowLength - this.lengthBuffer * 2 },
                    { x: anchor.x, y: anchor.y + width - this.arrowLength - this.lengthBuffer * 2 },
                    { x: anchor.x, y: this.movebarAnchor }
                ];
            }

            this.redraw();
        },

        mouseDown: function (loc) {
            var that = this;
            if (vectorLogic.isPointInsideShape(loc, this.arrow1)) {
                this.isMouseDownArrow1 = true;
                this.moveTimer = setInterval(function () { that.moveIncrement(that); }, this.moveTimerDelay);
            }
            else if (vectorLogic.isPointInsideShape(loc, this.arrow2)) {
                this.isMouseDownArrow2 = true;
                this.moveTimer = setInterval(function () { that.moveIncrement(that); }, this.moveTimerDelay);
            }
            else if (!this.isMouseDownBar && vectorLogic.isPointInsideShape(loc, this.moveBar)) {
                if (this.horizontal)
                    this.mouseMoveOffset = loc.x - this.moveBar[0].x;
                else
                    this.mouseMoveOffset = loc.y - this.moveBar[0].y;
                this.moveBarColor = this.moveBarSelectColor;
                this.isMouseDownBar = true;
                this.redraw();
            }
        },

        mouseUp: function (loc) {
            if (this.isMouseDownBar) {
                this.moveBarColor = this.moveBarNoSelectColor;
                this.isMouseDownBar = false;
                this.redraw();
            }
            if (this.isMouseDownArrow1) {
                this.isMouseDownArrow1 = false;
                clearInterval(this.moveTimer);
            }
            if (this.isMouseDownArrow2) {
                this.isMouseDownArrow2 = false;
                clearInterval(this.moveTimer);
            }
        },

        mouseMove: function (loc) {
            if (this.isMouseDownBar) {
                var change;
                if (this.horizontal)
                    change = loc.x - (this.moveBar[0].x + this.mouseMoveOffset);
                else
                    change = loc.y - (this.moveBar[0].y + this.mouseMoveOffset);
                this.move(change);
            }
        },

        moveIncrement: function (scrollBar) {
            var increment = scrollBar.moveButtonIncrement;
            if (scrollBar.isMouseDownArrow1)
                increment *= -1;
            scrollBar.move(increment);
        },

        move: function (change, scrollBar) {
            if (scrollBar === undefined) scrollBar = this;
            var newPosition = this.position + change;

            if (newPosition < 0) {
                newPosition = 0;
                change = -1 * this.position;
            }
            else if(this.horizontal) {
                if (newPosition + (this.moveBar[1].x - this.moveBar[0].x) > this.maxPosition) {
                    newPosition = this.maxPosition - (this.moveBar[1].x - this.moveBar[0].x);
                    change = newPosition - this.position;
                }
            }
            else {
                if (newPosition + (this.moveBar[2].y - this.moveBar[0].y) > this.maxPosition) {
                    newPosition = this.maxPosition - (this.moveBar[2].y - this.moveBar[0].y);
                    change = newPosition - this.position;
                }
            }

            var denominator
            if (this.horizontal)
                denominator = this.boundsMinMax.maxX - this.boundsMinMax.minX;
            else
                denominator = this.boundsMinMax.maxY - this.boundsMinMax.minY;

            var percentChange = change / (denominator);
            var worldChange = -1 * this.maxPosition * percentChange;
            for (var i = 0; i < this.moveBar.length; i++) {
                if (this.horizontal)
                    this.moveBar[i].x += change;
                else
                    this.moveBar[i].y += change;
            }

            if(this.horizontal)
                designerSurface.move({ x: worldChange, y: 0 });
            else
                designerSurface.move({ x: 0, y: worldChange });
            this.position = newPosition;
            this.redraw();
        },

        setZoom: function (zoom) {
            if (this.zoom !== zoom) {
                var worldWidthZoom = (zoom / this.baseZoom) * (this.baseZoom / this.zoom);
                var moveBarZoom = 1 / worldWidthZoom;

                //this.movebarAnchor move to here then zoom then add back in difference

                if (this.horizontal) {
                    var xDiff = this.moveBar[0].x - this.movebarAnchor;

                    this.moveBar[1].x = (this.moveBar[1].x - xDiff) * moveBarZoom + xDiff;
                    this.moveBar[2].x = (this.moveBar[2].x - xDiff) * moveBarZoom + xDiff;
                }
                else {
                    var yDiff = this.moveBar[0].y - this.movebarAnchor;
                    //LOOK HERE!!!!!
                    this.moveBar[2].y = (this.moveBar[2].y - yDiff) * moveBarZoom + yDiff;
                    this.moveBar[3].y = (this.moveBar[3].y - yDiff) * moveBarZoom + yDiff;
                }
            }
            this.zoom = zoom;
            return this.redraw();
        },

        redraw: function () {
            canvas.drawShape(this.bounds, this.bounds, this.barColor);

            var arrowColor = this.enabledColor;

            if (this.position <= 0)
                arrowColor = this.disabledColor;
            canvas.drawShape(this.arrow1, this.arrow1, arrowColor);
            arrowColor = this.enabledColor;

            if (this.horizontal) {
                if (this.position + (this.moveBar[1].x - this.moveBar[0].x) >= this.maxPosition)
                    arrowColor = this.disabledColor;
            }
            else {
                if (this.position + (this.moveBar[2].y - this.moveBar[0].y) >= this.maxPosition)
                    arrowColor = this.disabledColor;
            }
            canvas.drawShape(this.arrow2, this.arrow2, arrowColor);

            canvas.drawShape(this.moveBar, this.moveBar, this.moveBarColor);
        }
    }
    obj.init(anchor, width, zoom, horizontal);
    return obj;
}
