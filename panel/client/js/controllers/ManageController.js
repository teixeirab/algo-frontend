angular
    .module('FlexPanelApp')
    .controller('ManageController', function($rootScope, $scope, $http, $timeout, $stateParams, $location, SqlService,
                                             TableService, Notification, FormService, $state, $uibModal) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });
        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        // initializes scope variables
        $scope.table = $stateParams.table;
        $scope.page = 1;
        $scope.rowsShowing = "10";
        $scope.t = {};
        $scope.ctrl = {};

        // initializes controller variables
        var pk = [];
        var bad_keys = ['_id', 'password', 'id', 'user_id', "added_by", "dt_added" ,
            'trade_date', 'info_id', 'client_reference', 'custodian_reference', 'sec_id_type',
            'sec_id', 'issue_name', 'settled_quantity', 'settlement_amount', 'iso_country_name',
            'branch_name', 'account_name', 'confirmed_delivers', 'confirmed_receives', 'unconfirmed_delivers',
            'unconfirmed_receives', 'apikey', 'last_access'
        ];
        var type_list = ['citi_unsettled_transactions', 'citi_all_transactions', 'citi_available_position'];

        // initializes root scope variables
        $rootScope.rowsShowing = Number($scope.rowsShowing);
        $rootScope.data = [];
        $rootScope.dataBackup = [];
        $rootScope.fieldsArray = [];
        $rootScope.direction = true;

        // initializes scope functions
        $scope.uploadCounterparties = uploadCounterparties;
        $scope.confirm = confirm;
        $scope.reset = reset;
        $scope.deleteRow = deleteRow;
        $scope.details = details;

        $scope.nextPage = TableService.nextPage;
        $scope.previousPage = TableService.previousPage;
        $scope.filterChange = TableService.filterChange;
        $scope.search = TableService.search;
        $scope.sort = TableService.sort;
        $scope.exportExcel = TableService.exportExcel;

        // initializes date picker
        $('.input-daterange input').each(function() {
            $(this).datepicker('clearDates');
        });

        // initializes broadcast listeners
        $scope.$on('filterData', function(){
            filterData();
        });
        $scope.$on('pageReset', function(){
            $scope.page = 1;
        });
        $scope.$on('pageIncrease', function(){
            $scope.page++;
        });
        $scope.$on('pageDecrease', function(){
            $scope.page = $scope.page - 1;
        });
        $scope.$on('resetTable', function(){
            init()
        });

        // initializes program
        function init() {
            if (type_list.indexOf($scope.table) == -1){
                $scope.type = 'normal';
            }
            else $scope.type = 'trading';

            if ($scope.table){
                SqlService
                    .findInfo($scope.table)
                    .then(function (response){
                        if(response.data) {
                            $scope.info = response.data[0];
                        }
                    });
                SqlService
                    .findFields($scope.table)
                    .then(function (response){
                        if(response.data) {
                            $rootScope.fieldsArray = response.data;
                            setTableHeader()
                        }
                    });
                SqlService
                    .findAll($scope.table)
                    .then(function (response){
                        if(response.data) {
                            $rootScope.data = response.data;
                            $rootScope.dataBackup = response.data;
                            filterData();
                        }
                    });
            }
        }
        init();

        // general table functions
        function filterData(){
            $scope.size = $rootScope.data.length;
            $scope.numberPages = Math.ceil($scope.size / $rootScope.rowsShowing);
            $scope.data = $rootScope.data.slice((($scope.page - 1) * $rootScope.rowsShowing), $rootScope.rowsShowing * $scope.page)
        }

        function reset(){
            $scope.t = {};
            $scope.ctrl = {};
            $rootScope.data = $rootScope.dataBackup;
            $scope.page = 1;
            filterData();
        }

        function setTableHeader(){
            var x = 0;
            var y = 0;
            var result =[];
            while (x < $rootScope.fieldsArray.length){
                var field = $rootScope.fieldsArray[x];
                if (field.column_key == 'PRI'){
                    pk = field.column_name
                }
                if (y < 7){
                    if (bad_keys.indexOf(field.column_name) == -1){
                        var field_label = field.column_comment;
                        var field_options = [];
                        var field_type = field.column_type;

                        if (field.column_type == 'varchar(1)') {
                            field_type = "button";
                        }
                        else if (field.column_type.indexOf("varchar") !== -1 || field.column_type == 'text') {
                            field_type = "varchar"
                        }
                        else if (field.column_type.indexOf('enum') !== -1) {
                            field_type = "varchar"
                        }
                        else if (field.column_type.indexOf('int') !== -1 || field.column_type == 'float' || field.column_type == 'double') {
                            field_type = "number"
                        }
                        else if (field.column_type.indexOf('decimal') !== -1) {
                            field_type = "currency"
                        }
                        result.push({
                            type: field_type, label: field_label,
                            options: field_options, name: field.column_name, key: field.column_key
                        });
                        y = y + 1;
                    }
                }
                x = x + 1;
            }
            $scope.fields = result;
        }

        function deleteRow(row){
            var primary_key = "";
            var x = 0;

            while (x < $rootScope.fieldsArray.length){
                if ($rootScope.fieldsArray[x].column_key == "PRI"){
                    primary_key = $rootScope.fieldsArray[x].column_name;
                }
                x++;
            }
            var id = row[primary_key];

            SqlService
                .deleteOne($scope.table, id, primary_key)
                .then(function (response){
                    if(response.status == 200) {
                        Notification.success({message: 'Delete complete.'})
                        SqlService
                            .findAll($scope.table)
                            .then(function (response){
                                if(response.data) {
                                    $rootScope.data = response.data;
                                    $rootScope.dataBackup = response.data;
                                    filterData();
                                }
                                else Notification.error({message: 'Something went wrong. Please check connection'})
                            });
                    }
                    else Notification.error({message: 'Something went wrong. Please check connection'})
                });


            filterData();
        }

        // specific functions for different types of pages
        function uploadCounterparties(data){
            var x = 0;
            while(x < data.length){
                var row = data[x];
                var input = {};
                var id = row[pk];
                input.counterparty_id = row.counterparty_id;
                delete input["series_number"];
                delete input["$$hashKey"];
                FormService.edit(input, $scope.table, pk, id);
                x++;
            }
            Notification.success({message: 'Counterparties submitted'});
        }

        function confirm(row, field){
            var input = row;
            var id = row[pk];

            if(field == 'wire_confirm' && row.wire_confirm == 0){
                $rootScope.modalInstance = $uibModal.open({
                    templateUrl: 'views/wire.html',
                    controller: 'WireController',
                    size: 'md',
                    resolve: {
                        id : function () {
                            return  id
                        },
                        table : function () {
                            return  $scope.table
                        },
                        input : function (){
                            return row
                        }
                    }
                });
            }
            else {
                if (input[field] == 0){
                    row[field] = 1;
                    input[field] = 1;
                }
                else if (row[field] == 1){
                    input[field] = 0;
                    row[field] = 0;
                }
                delete input["series_number"];
                delete input["$$hashKey"];
                FormService.edit(input, $scope.table, pk, id);
                Notification.success({message: 'Edited successfully'});
            }

        }

        function details(row, type){
            var primary_key = "";
            var x = 0;
            while (x < $rootScope.fieldsArray.length){
                if ($rootScope.fieldsArray[x].column_key == "PRI"){
                    primary_key = $rootScope.fieldsArray[x].column_name;
                }
                x++;
            }
            var id = row[primary_key];

            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'views/edit.html',
                controller: 'EditController',
                size: 'md',
                resolve: {
                    id : function () {
                        return  id
                    },
                    pk : function () {
                        return  primary_key
                    },
                    table : function () {
                        return  $scope.table
                    }
                }
            });
        }
});
