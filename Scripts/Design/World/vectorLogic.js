var vectorLogic = {

    getIntersectionWithBounds(vector, bounds) {
        var intersectionIndex = [];
        var p = [];
        var boundsMinMaxes = this.getMinMaxes(bounds);
        for (var j = 1; j < bounds.length; j++) {
            var intersection = vectorLogic.getPointOfIntersection(vector, [bounds[j], bounds[j - 1]]);
            if (intersection.result &&
                intersection.point.x >= boundsMinMaxes.minX &&
                intersection.point.x <= boundsMinMaxes.maxX &&
                intersection.point.y >= boundsMinMaxes.minY &&
                intersection.point.y <= boundsMinMaxes.maxY) {
                intersectionIndex.push(j);
                p.push(intersection.point);
            }
        }
        if (intersectionIndex.length === 0) {
            var vectorMinMaxes = this.getMinMaxes(vector);
            if (vectorMinMaxes.minX < boundsMinMaxes.minX && vectorMinMaxes.minY < boundsMinMaxes.minY) p.push(bounds[0]);
            else if (vectorMinMaxes.maxX > boundsMinMaxes.maxX && vectorMinMaxes.minY < boundsMinMaxes.minY) p.push(bounds[1]);
            else if (vectorMinMaxes.maxX > boundsMinMaxes.maxX && vectorMinMaxes.maxY > boundsMinMaxes.maxY) p.push(bounds[2]);
            else if (vectorMinMaxes.minX < boundsMinMaxes.minX && vectorMinMaxes.maxY > boundsMinMaxes.maxY) p.push(bounds[3]);
            else if (vectorMinMaxes.minX < boundsMinMaxes.minX) p.push([boundsMinMaxes.minX, vector[1].y]);
            else if (vectorMinMaxes.maxX > boundsMinMaxes.maxX) p.push([boundsMinMaxes.maxX, vector[1].y]);
            else if (vectorMinMaxes.minY < boundsMinMaxes.minY) p.push([vector[1].x, boundsMinMaxes.minY]);
            else if (vectorMinMaxes.maxY > boundsMinMaxes.maxY) p.push([vector[1].x, boundsMinMaxes.maxY]);
            else {
                debugger;
                alert('error point: ' + vector[0]);
            }
        }
        return { indexs: intersectionIndex, points: p };
    },

	getLengthOfLine: function (vector) {
		var a2 = Math.pow(vector[0].x - vector[1].x, 2);
		var b2 = Math.pow(vector[0].y - vector[1].y, 2);
		return Math.sqrt(a2 + b2);
	},

	getParallelPointOfIntersection(vector, point) {
	    var m = vectorLogic.getSlopeOfVector(vector);
	    var x;
	    if (m === 0)
	        x = point.x;
        else
		    x = (point.y + m * vector[0].x - vector[0].y + m * point.x) / (2 * m);
		var y = m * (x - vector[0].x) + vector[0].y;
		return { result: true, point: { x: x, y: y } };
	},

	getPointOfIntersection: function (vector1, vector2) {
		var m1 = vectorLogic.getSlopeOfVector(vector1);
		var m2 = vectorLogic.getSlopeOfVector(vector2);
		//parallel
		if (m1 === m2) {
			return { result: false };
		}

		var x;
		var y;
		if (m1 === Infinity || m1 === -Infinity) {
		    x = vector1[0].x;
		    y = m2 * (x - vector2[0].x) + vector2[0].y;
		}
		else if (m2 === Infinity || m2 === -Infinity) {
		    x = vector2[0].x;
		    y = m1 * (x - vector1[0].x) + vector1[0].y;
		}
		else {
		    x = (vector2[0].y + m1 * vector1[0].x - vector1[0].y - m2 * vector2[0].x) / (m1 - m2)
		    y = m1 * (x - vector1[0].x) + vector1[0].y;
		}

		if ((x < vector1[0].x && x < vector1[1].x) ||
            (x > vector1[0].x && x > vector1[1].x) ||
            (y < vector1[0].y && y < vector1[1].y) ||
            (y > vector1[0].y && y > vector1[1].y))
			return { result: false };
		else
			return { result: true, point: { x: Math.round((x * 10000000000) / 10000000000), y: Math.round((y * 10000000000) / 10000000000) } };
	},
	
	getSlopeOfVector(vector) {
        return (vector[1].y - vector[0].y) / (vector[1].x - vector[0].x);
	},

	//optional paramater: returnNearestPoint, isBorderPoint, and previousLocation. These are used by designerSurface.js
	isPointInsideShape: function (point, coordinates, returnNearestPoint, isBorderPoint, previousLocation) {
		returnNearestPoint = returnNearestPoint === undefined ? false : returnNearestPoint;

		var previousPoint = null;
		var yAxisIntersectionAbove = 0;
		var yAxisIntersectionBelow = 0;
		var minDifference = null;
		var closestPoint = null;
		var closestPointEdgeIndex = -1;

		for (var i = 0; i < coordinates.length; i++) {
			if (previousPoint !== null) {

				if (returnNearestPoint) {
					var r;
					if (isBorderPoint) {
						r = this.getParallelPointOfIntersection([previousPoint, coordinates[i]], point);
						if (this.isPointOutsideOfVectorBounds(r.point, [previousPoint, coordinates[i]])) {
							var l1 = this.getLengthOfLine([previousPoint, point]);
							var l2 = this.getLengthOfLine([coordinates[i], point]);
							if (l1 < l2)
								r.point = { x: previousPoint.x, y: previousPoint.y };
							else
								r.point = { x: coordinates[i].x, y: coordinates[i].y };
						}
					}
					else {
						r = this.getPointOfIntersection([previousPoint, coordinates[i]], [previousLocation, point]);
					}
					if (r.result) {
						var difference = Math.sqrt(Math.pow(r.point.x - point.x, 2) + Math.pow(r.point.y - point.y, 2));
						if (minDifference === null || difference < minDifference) {
							minDifference = difference;
							closestPoint = r.point;
							closestPointEdgeIndex = i;
						}
					}
				}

				if (!this.isPointOutsideOfVectorBounds(point, [previousPoint, coordinates[i]])) {
					var m = this.getSlopeOfVector([previousPoint, coordinates[i]]);
					var y = m * (point.x - previousPoint.x) + previousPoint.y;

					if (y === point.y)
						return returnNearestPoint ? { result: true, point: point } : true;
					else if (y > point.y)
						yAxisIntersectionBelow++;
					else if (y < point.y)
						yAxisIntersectionAbove++;
				}
			}
			previousPoint = coordinates[i];
		}

		if (closestPoint === null) closestPoint = point;

		if (returnNearestPoint && yAxisIntersectionAbove % 2 === 1 && yAxisIntersectionBelow % 2 === 1)
			return { result: true, point: point, index: -1 };
		else if (returnNearestPoint)
			return { result: false, point: closestPoint, index: closestPointEdgeIndex };
		else
			return yAxisIntersectionAbove % 2 === 1 && yAxisIntersectionBelow % 2 === 1;
	},

	isPointOutsideOfVectorBounds(point, vector) {
		return (vector[1].x > point.x && vector[0].x > point.x) || (vector[1].x < point.x && vector[0].x < point.x);
	},

	isPointOutsideBounds(point, bounds) {
	    var m = this.getMinMaxes(bounds);
	    return point.x < m.minX || point.x > m.maxX || point.y < m.minY || point.y > m.maxY;
	},

	getMinMaxes(coordinates) {
		var minX = 99999;
		var minY = 99999;
		var maxX = 0;
		var maxY = 0;
		for (var i = 0; i < coordinates.length; i++) {
			if (coordinates[i].x < minX) minX = coordinates[i].x;
			if (coordinates[i].y < minY) minY = coordinates[i].y;
			if (coordinates[i].x > maxX) maxX = coordinates[i].x;
			if (coordinates[i].y > maxY) maxY = coordinates[i].y;
		}
		return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
	},

}