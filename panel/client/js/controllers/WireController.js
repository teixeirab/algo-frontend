angular.module('FlexPanelApp')
    .controller('WireController',
    function ($rootScope, $scope, $http, $timeout, $stateParams, SqlService, $state, table, id, input, Notification) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        $scope.table = table;
        $scope.input = input;
        $scope.submit = submit;
        $scope.cancel = cancel;


        function submit(input) {
            delete input["series_number"];
            delete input["trade_date"];
            delete input["settlement_date"];
            delete input["dt_added"];
            input.wire_confirm = 1;

            SqlService
                .editOne($scope.table, 'client_reference', id, input)
                .then(function (response){
                    if(response.data) {
                        $rootScope.modalInstance.dismiss('cancel');
                        Notification.success({message: 'Wire submitted.'})
                    }
                    else Notification.error({message: 'Something went wrong. Please check connection'})
                });

        }

        function cancel(){
            $rootScope.modalInstance.dismiss('cancel');
        }


    });
