var designerSurface = {
    ctx: null,
    anchor: null,
    width: null,
    height: null,
    previouslocation: null,
    parent: null,
    firstLocation: null,
    isBorderPoint: false,
    landType: null,
    shapes: [],
    coordinates: [],
    bounds: [],
    plainsColor: '#ccff99',
    desertColor: '#ffe680',
    forestColor: '#006600',
    mountainsColor: '#8b8b7b',
    waterColor: '#006bb3',
    zoom: null,
    baseZoom: null,
    adjustment: null,

    init: function (ctx, anchor, width, height, zoom) {
        this.ctx = ctx;
        this.anchor = anchor;
        this.width = width;
        this.height = height;
        this.zoom = zoom;
        this.baseZoom = zoom;
        this.bounds = [anchor, { x: anchor.x + width, y: anchor.y }, { x: anchor.x + width, y: anchor.y + height }, { x: anchor.x, y: anchor.y + height }, anchor];
        this.adjustment = { x: 0, y: 0 };
    },

    click: function (location, landType) {
        this.landType = landType;
        var clearPrevious = false;
        if (this.previouslocation !== null) {
            this.ctx.beginPath();

            //close path

            if (Math.abs(location.x - this.firstLocation.x) < 10 && Math.abs(location.y - this.firstLocation.y) < 10) {
                location = this.firstLocation;
                clearPrevious = true;
            }
            else if (this.parent !== null) {
                //make sure point is not outside of parent
                var p = vectorLogic.isPointInsideShape(location, this.shapes[this.parent].coordinates, true, this.isBorderPoint, this.previouslocation);
                if (!p.result)
                    location = p.point;
                this.isBorderPoint = !p.result;
            }
            this.drawLine([this.previouslocation, location], landType);
        }
        else {
            this.firstLocation = location;
            this.setParent(location);
        }
        this.coordinates.push(location);

        if (clearPrevious) {
            this.previouslocation = null;
            this.shapes.push({ coordinates: this.coordinates, landType: landType, parent: this.parent });
            this.drawLandType(this.coordinates, landType);
            this.parent = null;
            this.coordinates = [];
        }
        else {
            this.previouslocation = location;
        }
    },

    drawLine: function (vector, landType) {
        canvas.drawLine(vector, this.getColor(landType));
    },

    move: function (adjustment) {
        this.adjustment.x += adjustment.x;
        this.adjustment.y += adjustment.y;

        if (adjustment.x !== 0 || adjustment.y !== 0) {
            for (var i = 0; i < this.shapes.length; i++) {
                for (var j = 1; j < this.shapes[i].coordinates.length; j++) {
                    var point = this.shapes[i].coordinates[j];
                    point.x += adjustment.x;
                    point.y += adjustment.y;
                }
            }
            this.redraw();
        }
    },

    redraw: function () {
        this.ctx.clearRect(this.anchor.x, this.anchor.y, this.width, this.height);
        for (var i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].parent === null) {
                this.drawShape(i);
            }
        }
        for (var i = 1; i < this.coordinates.length; i++) {
            this.drawLine([this.coordinates[i - 1], this.coordinates[i]], this.landType);
        }

    },

    undo: function () {
        if (this.coordinates.length === 0) {
            var removedShape = this.shapes.pop();
            if (removedShape !== null) {
                this.coordinates = removedShape.coordinates;
            }
        }

        this.coordinates.pop();
        if (this.coordinates.length === 0)
            this.previouslocation = null;
        else
            this.previouslocation = this.coordinates[this.coordinates.length - 1];
        this.redraw();
    },

    drawShape: function (index) {
        var shape = this.shapes[index];
        var coordinates = shape.coordinates;
        this.drawLandType(coordinates, shape.landType);
        for (var i = 0; i < this.shapes.length; i++) {
            if (this.shapes[i].parent === index) {
                this.drawShape(i);
            }
        }
    },

    drawLandType: function (coordinates, landType) {
        canvas.drawShape(coordinates, this.bounds, this.getColor(landType));
    },

    getColor: function (landType) {
        var color;
        switch (landType) {
            case 'plains':
                color = this.plainsColor;
                break;
            case 'desert':
                color = this.desertColor;
                break;
            case 'forest':
                color = this.forestColor;
                break;
            case 'mountains':
                color = this.mountainsColor;
                break;
            default:
                color = this.waterColor;
                break;
        }
        return color;
    },

    setParent(location) {
        for (var i = 0; i < this.shapes.length; i++) {
            if (vectorLogic.isPointInsideShape(location, this.shapes[i].coordinates)) {
                this.parent = i;
            }
        }
    },

    setZoom: function (zoom) {
        if (this.zoom !== zoom) {
            var diff = (zoom / this.baseZoom) * (this.baseZoom / this.zoom);
            for (var i = 0; i < this.shapes.length; i++) {
                var shape = this.shapes[i];
                for (var j = 1; j < shape.coordinates.length; j++) {
                    var coordinate = shape.coordinates[j];
                    coordinate.x = (coordinate.x - this.adjustment.x) * diff + this.adjustment.x;
                    coordinate.y = (coordinate.y - this.adjustment.y) * diff + this.adjustment.y;
                }
            }
            for (var i = 0; i < this.coordinates; i++) {
                var coordinate = this.coordinates[i];
                coordinate.x = (coordinate.x - this.adjustment.x) * diff + this.adjustment.x;
                coordinate.y = (coordinate.y - this.adjustment.y) * diff + this.adjustment.y;
            }
            if (this.previouslocation !== null) {
                this.previouslocation.x = (this.previouslocation.x - this.adjustment.x) * diff + this.adjustment.x;
                this.previouslocation.y = (this.previouslocation.y - this.adjustment.y) * diff + this.adjustment.y;
            }
            this.zoom = zoom;
            return this.redraw();
        }
        return true;
    }
}