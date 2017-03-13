angular.module('FlexPanelApp')
    .controller('LoginController',
        function ($rootScope, $scope, $state, $window, UserService, UserSession) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.login = function() {
                UserService.login($scope.username, $scope.password).then(function(response) {
                    if(response.status === 200) {
                        $state.go('dashboard')
                    }
                })
            }
        });
