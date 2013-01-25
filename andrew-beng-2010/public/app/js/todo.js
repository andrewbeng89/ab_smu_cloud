var module = angular.module('myApp', []);

function TodoCtrl($scope, $http) {
	
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
	
	$http.jsonp('/todos?callback=JSON_CALLBACK')
		.success(function(data) {
			$scope.todos = angular.fromJson(data);
	});
	
	/*$scope.todos = [{
		text : 'Learn AngularJS',
		done : false
	}, {
		text : 'Build an app',
		done : false
	}];*/

	$scope.getTotalTodos = function() {
		if ($scope.todos != undefined && $scope.todos != null) {
			return $scope.todos.length;
		}
	};

	$scope.clearCompleted = function() {
		for (var i = 0; i < $scope.todos.length; i++) {
			if ($scope.todos[i].done == true) {
				$http.post('/remove/todo', angular.toJson({id:$scope.todos[i]._id}));
			}
		}
		$scope.todos = _.filter($scope.todos, function(todo) {
			return !todo.done;
		});
	};

	$scope.addTodo = function() {
		$scope.newTodo = {
			text : $scope.formTodoText,
			done : false
		};
		$scope.todos.push($scope.newTodo);
		$http.post('/create/todo', angular.toJson($scope.newTodo));
		$scope.formTodoText = '';
	};
}