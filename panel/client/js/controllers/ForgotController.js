angular.module('FlexPanelApp')
    .controller('ForgotController',
        function ($rootScope, $scope, $state, UserService) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.reset = function() {
                UserService.resetPassword($scope.email).then(function(response) {
                    if(response.status === 204) {
                        $state.go('login')
                    }
                })
            }
        });
