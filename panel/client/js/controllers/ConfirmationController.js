angular.module('FlexPanelApp')
    .controller('ConfirmationController',
        function ($rootScope, $scope, SqlService, FormService, table, id, primary_key, type, Notification, row, field) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            $scope.type = type
            $scope.submit = submit;
            $scope.cancel = cancel;


            function submit() {
                if (type == 'Delete'){
                    SqlService
                        .deleteOne(table, id, primary_key)
                        .then(function (response){
                            if(response.status == 200) {
                                Notification.success({message: 'Delete complete'});
                                SqlService
                                    .findAll(table)
                                    .then(function (response){
                                        if(response.data) {
                                            $rootScope.data = response.data;
                                            $rootScope.dataBackup = response.data;
                                            $rootScope.$broadcast('filterData');
                                        }
                                        else Notification.error({message: 'Something went wrong. Please check connection'})
                                    });
                            }
                            else Notification.error({message: 'Something went wrong. Please check connection'})
                        });
                }
                if (type == 'Confirm'){
                    var input = {};

                    for (var key in row) {
                        if (row.hasOwnProperty(key)) {
                            if (key.toString() == 'series_number' || key.toString() == '$$hashKey'){
                            }
                            else {input[key] = row[key]}
                        }
                    }

                    if (input[field] == 0){
                        input[field] = 1;
                        row[field] = 1;
                    }
                    else if (row[field] == 1){
                        input[field] = 0;
                        row[field] = 0;
                    }

                    FormService.edit(input, table, primary_key, id);
                    Notification.success({message: 'Edited successfully'});
                }
                $rootScope.modalInstance.dismiss('cancel');
            }

            function cancel(){
                $rootScope.modalInstance.dismiss('cancel');
            }


        });
