function GetLoc($event) {
    return { x: $event.pageX - $event.currentTarget.offsetLeft, y: $event.pageY - $event.currentTarget.offsetTop };
}

var canvas;
var horizontalScrollBar;
var verticalScrollBar;

designerApp.controller('designerController', function ($scope) {
    var ctx = $('canvas')[0].getContext('2d');
    var zooming = false;

    $scope.zoom = 0;
    $scope.setZoom = function (zoom) {
        //$scope.zoom = zoom;
        //setTimeout(function () {
        //    if ($scope.zoom === zoom) {
        //        $scope.$$phase = true;
        designerSurface.setZoom(zoom);
        horizontalScrollBar.setZoom(zoom);
        verticalScrollBar.setZoom(zoom);
        $scope.zoom = zoom;
        //        $scope.$$phase = false;
        //    }
        //}, 1);
    }

    $scope.init = function () {
        $scope.shapes = [];
        $scope.coordinates = [];
        canvas = Canvas(ctx, $scope);
        horizontalScrollBar = ScrollBar({ x: 50, y: 785 }, 1435, 100, true);
        verticalScrollBar = ScrollBar({ x: 1485, y: 50 }, 735, 100, false);

        //canvas.init(ctx);
    }

    $scope.canvasClick = function ($event) {
        var loc = canvas.click($event, $scope.landType);
        $scope.clickloc = '{' + loc.x + ', ' + loc.y + '}';
    }

    $scope.redrawClick = function () {
        designerSurface.redraw();
    }

    $scope.undoClick = function () {
        designerSurface.undo();
    }

    $scope.canvasHover = function ($event) {
        var loc = GetLoc($event);
        horizontalScrollBar.mouseMove(loc);
        verticalScrollBar.mouseMove(loc);
        $scope.hoverloc = '{' + loc.x + ', ' + loc.y + '}';
    }

    $scope.canvasMouseDown = function ($event) {
        var loc = GetLoc($event);
        horizontalScrollBar.mouseDown(loc);
        verticalScrollBar.mouseDown(loc);
    }

    $scope.canvasMouseUp = function ($event) {
        var loc = GetLoc($event);
        horizontalScrollBar.mouseUp(loc);
        verticalScrollBar.mouseUp(loc);
    }

    $scope.shapeChange = function (selectedShape) {
        var selection = JSON.parse(selectedShape);
        $scope.selectedShape = selection[0];
        $scope.shapeIndex = selection[1];
        $scope.coordinates = $scope.selectedShape.coordinates
    }

    $scope.coordinateChange = function (coordinate, index) {
        $scope.coordinates[index] = { x: parseFloat(coordinate.x), y: parseFloat(coordinate.y) };
        if (index === 0)
            $scope.coordinates[$scope.coordinates.length - 1] = jQuery.extend({}, $scope.coordinates[0]);
        else if (index + 1 === $scope.coordinates.length)
            $scope.coordinates[0] = jQuery.extend({}, $scope.coordinates[index]);
        $scope.shapes[$scope.shapeIndex].coordinates = $scope.coordinates;
        designerSurface.redraw();
    }
});