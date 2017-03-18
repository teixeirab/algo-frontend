angular.module('FlexPanelApp')
    .controller('UserController',
        function ($rootScope, $scope, UserService, Notification) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
            $scope.saveProfile = function() {
                UserService.saveProfile($rootScope.currentUser).then(function(response) {
                    if (response.status === 200) {
                        Notification.success({message: 'Updated profile'})
                    }else {

                    }
                })
            }
            $scope.changePassword = function() {
                if ($scope.newPassword !== $scope.confirm) {
                    Notification.error({message: 'Please make sure the new password are matched.'})
                    return
                }
                UserService.changePassword($scope.currentPassword, $scope.newPassword).then(function(response) {
                    if (response.status === 200) {
                        Notification.success({message: 'Updated password'})
                    }else {
                        Notification.error({message: 'Password update failed. Please check the inputs.'})
                    }
                })
            }
        });
