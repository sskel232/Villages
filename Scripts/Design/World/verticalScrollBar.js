var verticalScrollBar = {
    width: 15,
    bounds: [],
    zoom: null,
    baseZoom: null,

    init: function (anchor, height, zoom) {
        this.zoom = zoom;
        this.baseZoom = zoom;
        this.bounds = [anchor,
            { x: anchor.x + this.width, y: anchor.y },
            { x: anchor.x + this.width, y: anchor.y + height },
            { x: anchor.x, y: anchor.y + height },
            anchor];
        canvas.drawShape(this.bounds, this.bounds, '#DDDDDD');
    },

    redraw: function () {

    }
}