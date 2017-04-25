angular.module('FlexPanelApp')
    .controller('AddController',
    function ($rootScope, $scope, $http, $timeout, $stateParams, SqlService, FormService, $state) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        // initializes scope variables
        $scope.table = $stateParams.table;
        $scope.input = {};
        $rootScope.fields = [];
        $rootScope.pk = '';

        // initializes scope functions
        $scope.submit = FormService.add;

        // initializes broadcast listeners
        $scope.$on('fields', function(event, result){
            $scope.fields = result;
        });

        // initializes date picker
        $('.input-daterange input').each(function() {
            $(this).datepicker('clearDates');
        });

        // initializes program
        function init() {
            SqlService
                .findInfo($scope.table)
                .then(function (response){
                    if(response.data) {
                        $scope.info = response.data[0];
                    }
                });

            if ($scope.table == 'trades'){
                initTrades();
            }
            else if ($scope.table) {
                SqlService
                    .findFields($scope.table)
                    .then(function (response) {
                        if (response.data) {
                            $rootScope.fields = response.data;
                            FormService.setFields()
                        }
                    });
            }
        }
        init();
    });
