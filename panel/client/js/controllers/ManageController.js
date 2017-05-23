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
        $scope.valueFilter = "All";
        $scope.t = {};
        $scope.userType = $rootScope.currentUser.user_type;

        // initializes controller variables
        var primary_key = [];
        var bad_keys = ['_id', 'password', 'id', 'user_id', "added_by", "dt_added" ,
            'trade_date', 'info_id', 'client_reference', 'custodian_reference', 'sec_id_type',
            'sec_id' , 'settled_quantity', 'settlement_amount', 'iso_country_name',
            'branch_name', 'account_name', 'confirmed_delivers', 'confirmed_receives', 'unconfirmed_delivers',
            'unconfirmed_receives', 'apikey', 'last_access', "dt_joined"
        ];
        var type_list = ['citi_unsettled_transactions', 'citi_all_transactions', 'citi_available_position'];
        var percentageFields = ['interest_rate', '% Funded', 'percent_outstanding'];

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
        $scope.filter = filter;

        $scope.nextPage = TableService.nextPage;
        $scope.previousPage = TableService.previousPage;
        $scope.filterChange = TableService.filterChange;
        $scope.search = TableService.search;
        $scope.sort = TableService.sort;
        $scope.exportExcel = TableService.exportExcel;
        $scope.calcMaintenanceFees = calcMaintenanceFees
        $scope.sendMaintenanceFeesInvoices = sendMaintenanceFeesInvoices

        // initializes date picker
        $('.input-daterange input').each(function() {
            $(this).datepicker('clearDates');
        });

        $scope.$on('set.user', function(){
            $scope.userType = $rootScope.currentUser.user_type;
        })

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
                            if ($scope.table == 'citi_all_transactions'){
                                $rootScope.data = response.data.filter(function (el){
                                    return el.account_id == '6017709722' && el.series_number > 0;
                                });
                                $rootScope.direction = false;
                                TableService.sort('settlement_date')
                            }
                            else $rootScope.data = response.data;
                            $rootScope.dataBackup = $rootScope.data;
                            filterData();
                        }
                    });
            }
            if ($scope.type == 'trading'){
                SqlService
                    .viewData('unique_counterparties')
                    .then(function (response){
                        if(response.data) {
                            $scope.counterparties = response.data;
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
                    primary_key = field.column_name
                }
                if (y < 7){
                    if (bad_keys.indexOf(field.column_name) == -1){
                        var field_label = field.column_comment;
                        var field_options = [];
                        var field_type = field.column_type;

                        if (field.column_type == 'varchar(1)') {
                            field_type = "button";
                        }

                        else if (percentageFields.indexOf(field)  >= 0) {
                            field_type = "percentage";
                        }

                        else if (field.column_type.indexOf("varchar") !== -1 || field.column_type == 'text') {
                            field_type = "varchar"
                        }
                        else if (field.column_type.includes('enum')) {
                            field_type = 'enum';
                            var array = field.column_type.replace('enum(', '').replace(')', '').split(',');
                            var i = 0;
                            while (i < array.length) {
                                field_options.push(array[i].replace("'", '').replace("'", ''));
                                i = i + 1;
                            }
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

            $rootScope.modalInstance = $uibModal.open({
                templateUrl: 'views/confirmation.html',
                controller: 'ConfirmationController',
                size: 'md',
                resolve: {
                    type : function () {
                        return  'Delete'
                    },
                    table : function () {
                        return  $scope.table
                    },
                    id : function () {
                        return  id
                    },
                    primary_key : function () {
                        return  primary_key
                    },
                    field : function(){
                        return null
                    },
                    row : function(){
                        return null
                    }
                }
            });
        }

        // specific functions for different types of pages
        function uploadCounterparties(data){
            var x = 0;
            while(x < data.length){
                var id = data[x][primary_key];
                if(data[x].counterparty_id.counterparty_key){
                    data[x].counterparty_id = data[x].counterparty_id.counterparty_key;
                }

                var input = {};

                for (var key in data[x]) {
                    if (data[x].hasOwnProperty(key)) {
                        if (key.toString() == 'series_number' || key.toString() == '$$hashKey'){
                        }
                        else {input[key] = data[x][key]}
                    }
                }

                FormService.edit(input, $scope.table, primary_key, id);

                x++;
            }
            Notification.success({message: 'Counterparties submitted'});
        }

        function filter(valueFilter){
            if (valueFilter == 'All'){
                init()
            }
            else if (valueFilter == 'pending_legal'){
                $rootScope.data = $rootScope.data.filter(function (el){
                    return el.legal_confirm == 0;
                });
                filterData();
            }
            else if (valueFilter == 'pending_wires'){
                $rootScope.data = $rootScope.data.filter(function (el){
                    return el.wire_confirm == 0;
                });
                filterData();
            }
            else if (valueFilter == 'completed'){
                $rootScope.data = $rootScope.data.filter(function (el){
                    return el.legal_confirm == 1 && el.wire_confirm == 1;
                });
                filterData();
            }

        }

        function confirm(row, field){
            var input = row;
            var id = row[primary_key];

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
                $rootScope.modalInstance = $uibModal.open({
                    templateUrl: 'views/confirmation.html',
                    controller: 'ConfirmationController',
                    size: 'md',
                    resolve: {
                        type : function () {
                            return  'Confirm'
                        },
                        table : function () {
                            return  $scope.table
                        },
                        id : function () {
                            return  id
                        },
                        primary_key : function () {
                            return  primary_key
                        },
                        row : function(){
                            return row
                        },
                        field : function(){
                            return field
                        }
                    }
                });

            }

        }

        function calcMaintenanceFees(){
            $rootScope.modalInstance = $uibModal.open({
              templateUrl: 'views/confirmation.html',
              controller: 'ConfirmationController',
              size: 'md',
              resolve: {
                type : function () {
                  return  'CalcMaintenanceFees'
                },
                table : function () {
                    return  $scope.table
                },
                id : function () {
                    return  null
                },
                primary_key : function () {
                    return  null
                },
                row : function(){
                    return null
                },
                field : function(){
                    return null
                }
              }
            });
        }

        function sendMaintenanceFeesInvoices(){
            $rootScope.modalInstance = $uibModal.open({
              templateUrl: 'views/confirmation.html',
              controller: 'ConfirmationController',
              size: 'md',
              resolve: {
                type : function () {
                  return  'SendMaintenanceFeesInvoices'
                },
                table : function () {
                    return  $scope.table
                },
                id : function () {
                    return  null
                },
                primary_key : function () {
                    return  null
                },
                row : function(){
                    return null
                },
                field : function(){
                    return null
                }
              }
            });
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
                    primary_key : function () {
                        return  primary_key
                    },
                    table : function () {
                        return  $scope.table
                    },
                    type : function(){
                        return type
                    }
                }
            });
        }
});
