angular.module('FlexPanelApp')
    .controller('ViewController', function($rootScope, $scope, $http, $timeout, $stateParams, $location, SqlService, TableService, $state) {
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
        $scope.query_name = $stateParams.query;
        $scope.selectType = $stateParams.selectType;
        $scope.page = 1;
        $scope.rowsShowing = "10";
        $scope.t = {};
        $scope.ctrl = {};
        $scope.options = {};
        $scope.item ={};
        $scope.date = {};
        // default values

        if ($scope.selectType == 'date'){
            $scope.date.value = '2016-12-30'; // new Date().toISOString().slice(0,10);
        }

        // initializes controller variables
        var bad_keys = ['$$hashKey', '_id', 'password', 'id', 'user_id', "added_by", "dt_added" , 'trade_date'];
        var currencyFields = ['Nominal_Balance', 'Total_Payable', 'Adjustment', 'Interest_Repayment',
            'Interest_Receivable', 'Interest_Accrued', 'Principal_Repayment', 'Adjusted_Total_Payable'];

        // initializes root scope variables
        $rootScope.rowsShowing = Number($scope.rowsShowing);
        $rootScope.data = [];
        $rootScope.dataBackup = [];
        $rootScope.fieldsArray = [];
        $rootScope.direction = true;

        // initializes scope functions
        $scope.reset = reset;
        $scope.onChange = onChange;
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

        $scope.$watch("date", function(newValue, oldValue) {
            findAll($scope.date.value)
        }, true);

        // initializes program
        function init() {
            if ($stateParams.selectType == 'na'){
                findAll($scope.item.value)
            }
            else if($stateParams.selectType == 'date'){
                findAll($scope.date.value)
            }
            else if ($stateParams.selectType != 'date') {
                SqlService
                    .findOptions($stateParams.selectType, $scope.table)
                    .then(function (response){
                        if(response.data) {
                            $scope.options = response.data;
                            console.log($scope.options)
                            $scope.item = $scope.options[0];
                            findAll($scope.item.value);
                        }
                    });
            }
        }
        init();

        // general manage functions
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

        function onChange(item){
            $scope.item = item;
            if (item){
                if ($stateParams.selectType == 'series_number'){
                    $rootScope.data = [];
                    findAll(item.value)
                }
                else findAll($scope.item)
            }
        }

        function findAll(param){
            SqlService
                .viewData($scope.query_name, param)
                .then(function (response){
                    if(response.data) {
                        $rootScope.data = response.data;
                        $rootScope.dataBackup = response.data;
                        if ($rootScope.data.length > 0){
                            setTableHeader()
                        }
                    }
                });
        }

        function setTableHeader(){
            var x = 0;
            var y = 0;
            var result =[];
            $rootScope.fieldsArray = Object.keys($rootScope.data[0]);


            while (x < $rootScope.fieldsArray.length){
                var field = $rootScope.fieldsArray[x];
                if (y < 7){
                    if (bad_keys.indexOf(field) == -1){
                        var field_label = TableService.replaceAll(field, "_", " ");
                        var field_type = "";

                        if (field.includes('Date')) {
                            field_type = "date";
                        }

                        else if (currencyFields.indexOf(field)  >= 0) {
                            field_type = "currency";
                        }

                        else field_type = "varchar";

                        result.push({
                            type: field_type, label: field_label,
                            name: field
                        });
                        y = y + 1;
                    }
                }
                x = x + 1;
            }
            $scope.fields = result;
            filterData();
        }
});