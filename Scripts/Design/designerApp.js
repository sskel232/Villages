var designerApp = angular.module('designerApp', ['ngAnimate']);
designerApp.directive("slider", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var sliderType = $(elem).attr('data-sliderType');
            if (sliderType === 'zoom') {
                $(elem).slider({
                    formatter: function (value) {
                        if (!scope.$$phase) {
                            scope.$apply(function () {
                                scope.setZoom(value);
                            });
                        }
                    }
                });
            }
        }
    }
});