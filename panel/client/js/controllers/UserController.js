angular.module('FlexPanelApp')
    .controller('UserController',
        function ($rootScope, $scope, UserService) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.saveProfile = function() {
                UserService.saveProfile($rootScope.currentUser)
            }
            $scope.changePassword = function() {
                UserService.changePassword($scope.currentPassword, $scope.newPassword)
            }
        });
