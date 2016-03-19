"use strict";
function Canvas(ctx) {
    var obj = {
        ctx: null,

        init: function (ctx) {
            this.ctx = ctx;
            designerSurface.init(ctx, { x: 50, y: 50 }, 1435, 735, 100);

            //temporary to test offsets
            var shape = [{ x: 0, y: 0 },
                            { x: 1500, y: 0 },
                            { x: 1500, y: 50 },
                            { x: 0, y: 50 },
                            { x: 0, y: 0 }];
            this.drawShape(shape, shape, '#DDDD00');

            shape = [{ x: 0, y: 50 },
                            { x: 50, y: 50 },
                            { x: 50, y: 800 },
                            { x: 0, y: 800 },
                            { x: 0, y: 50 }];
            this.drawShape(shape, shape, '#996666');

            //verticalScrollBar.init({ x: 1485, y: 50 }, 735, 100);

            shape = [{ x: 1485, y: 785 },
                            { x: 1500, y: 785 },
                            { x: 1500, y: 800 },
                            { x: 1485, y: 800 },
                            { x: 1485, y: 785 }];
            this.drawShape(shape, shape, '#BBBBBB');
        },

        click($event, landType) {
            var location = { x: $event.pageX - $event.currentTarget.offsetLeft, y: $event.pageY - $event.currentTarget.offsetTop };
            if (vectorLogic.isPointInsideShape(location, designerSurface.bounds)) {
                designerSurface.click(location, landType);
            }
            return location;
        },

        drawLine: function (vector, color) {
            this.ctx.moveTo(vector[0].x, vector[0].y);
            this.ctx.lineTo(vector[1].x, vector[1].y);
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        },

        drawShape: function (coordinates, bounds, color) {
            this.ctx.beginPath();
            var arrangedCoordinates = this.arrangeCoordinates(coordinates, bounds);
            if (arrangedCoordinates.isInBounds) {
                coordinates = arrangedCoordinates.coordinates;

                var previousPoint = coordinates[0];
                this.ctx.moveTo(previousPoint.x, previousPoint.y);
                var isBorderPoint = false;
                var isPreviousBorderPoint = false;
                var q;

                for (var i = 1; i < coordinates.length; i++) {
                    var p = coordinates[i];
                    isBorderPoint = vectorLogic.isPointOutsideBounds(coordinates[i], bounds);
                    if (isBorderPoint) {
                        q = vectorLogic.getIntersectionWithBounds([coordinates[i], coordinates[i - 1]], bounds);
                        p = q.points[0];
                    }

                    if (isPreviousBorderPoint && !isBorderPoint) {
                        q = vectorLogic.getIntersectionWithBounds([coordinates[i], coordinates[i - 1]], bounds);
                        this.ctx.lineTo(q.points[0].x, q.points[0].y);
                    }
                    else if (isPreviousBorderPoint && isBorderPoint && q.points.length > 1) {
                        //determine order to draw, first one should be on the same side
                        if (q.points[0].x === previousPoint.x || q.points[0].y === previousPoint.y) {
                            r = q.points[0];
                            p = q.points[1];
                        }
                        else {
                            r = q.points[1];
                            p = q.points[0];
                        }
                        this.ctx.lineTo(r.x, r.y);
                    }

                    this.ctx.lineTo(p.x, p.y);

                    previousPoint = p;
                    isPreviousBorderPoint = isBorderPoint;
                }
            }
            this.ctx.fillStyle = color;
            this.ctx.fill();
        },

        arrangeCoordinates: function (coordinates, bounds) {
            var firstInboundsIndex = -1;
            for (var i = 0; i < coordinates.length && firstInboundsIndex === -1; i++) {
                if (vectorLogic.isPointInsideShape(coordinates[i], bounds)) {
                    firstInboundsIndex = i;
                }
            }
            if (firstInboundsIndex === -1)
                return { isInBounds: false };
            else if (firstInboundsIndex !== 0) {
                var initialCount = coordinates.length;
                var firstHalf = coordinates.slice(0, firstInboundsIndex);
                var secondHalf = coordinates.slice(firstInboundsIndex, coordinates.length - 1);
                var finalPoint;
                if (secondHalf.length !== 0)
                    finalPoint = { x: secondHalf[0].x, y: secondHalf[0].y };
                else
                    finalPoint = [];
                coordinates = secondHalf.concat(firstHalf).concat(finalPoint);
            }
            return { isInBounds: true, coordinates: coordinates };
        }
    }
    obj.init(ctx);
    return obj;
}