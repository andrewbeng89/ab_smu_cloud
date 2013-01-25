var module = angular.module('placeShareApp', []);

function TodoCtrl($scope, $http) {
	
	$scope.placesFound = function() {
		if ($scope.places != undefined && $scope.places.length > 0) {
			return true;
		} else {
			return false;
		}
	};
	
	$scope.get_location = function() {
		navigator.geolocation.getCurrentPosition($scope.show_map);
	};
		
	$scope.show_map = function(position) {
  		$scope.latitude = position.coords.latitude;
  		$scope.longitude = position.coords.longitude;
  		$http.jsonp('/places?callback=JSON_CALLBACK&lat=' + $scope.latitude + "&lon=" + $scope.longitude + "&type=" + $scope.placesType)
			.success(function(data) {
				$scope.places = angular.fromJson(data);
				$scope.placesResultMessage = $scope.places.length + " " + $scope.placesType + " places found!";
				$scope.placesType = "";
		});
	}

};