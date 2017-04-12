angular.module('FlexPanelApp')
    .controller('ReportingController', function($rootScope, $scope, $http, $timeout, $stateParams, $location, SqlService, TableService, $state, FormService) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;

        // initializes scope variables
        $scope.tab = $stateParams.tab;
        $scope.page = 1;
        $scope.input = {};
        $scope.rowsShowing = "10";
        $scope.t = {};
        $scope.item ={};
        $scope.date = {};
        $scope.searchWord = "";

        // default values
        if ($scope.selectType == 'date'){
            $scope.date.value = new Date().toISOString().slice(0,10); // = '2016-12-30';
        };

        // initializes controller variables
        var bad_keys = ['$$hashKey', '_id', 'password', 'id', 'user_id', "added_by", "dt_added" , 'trade_date'];
        var currencyFields = ['Nominal_Balance', 'Total_Payable', 'Adjustment', 'Interest_Repayment',
            'Interest_Receivable', 'Interest_Accrued', 'Principal_Repayment', 'Adjusted_Total_Payable', 'Accrued Interest',
            'Increase', 'Decrease', 'Opening', 'Closing', 'Opening Position', 'Transactions - Purchases', 'Transactions - Sales',
            'End of Q FV', 'Market price at quarter-end', 'Closing Position', 'Fair Value'];
        var percentageFields = ['interest_rate'];

        // initializes root scope variables
        $rootScope.rowsShowing = Number($scope.rowsShowing);
        $rootScope.data = [];
        $rootScope.dataBackup = [];
        $rootScope.fieldsArray = [];
        $rootScope.direction = true;

        // initializes scope functions
        $scope.exportExcel = TableService.exportExcel;
        $scope.submit = submit;

        // initializes date picker
        $('.input-daterange input').each(function() {
            $(this).datepicker('clearDates');
        });

        // initializes broadcast listeners
        $scope.$on('fields', function(event, result){
            $scope.fields = result;
        });


        // initializes program
        function init() {
            if ($scope.tab == 'setup'){
                SqlService
                    .findFields("quarterly_reporting_setup")
                    .then(function (response) {
                        if (response.data) {
                            $rootScope.fields = response.data;
                            FormService.setFields()
                        }
                        SqlService
                            .viewData("reporting_setup_view", 0)
                            .then(function (response) {
                                if (response.data) {
                                    $rootScope.data = response.data[0];
                                    setInput();
                                }
                            });
                    });
            }
            else{
                if ($scope.tab == 'series'){
                    $scope.query_name = 'reporting_series_view'
                }
                else if ($scope.tab == 'isin'){
                    $scope.query_name = 'reporting_isin_view'
                }
                else if ($scope.tab == 'non_isin'){
                    $scope.query_name = 'reporting_non_isin_view'
                }
                else if ($scope.tab == 'equity'){
                    $scope.query_name = 'reporting_equity_view'
                }
                else if ($scope.tab == 'variation'){
                    $scope.query_name = 'reporting_variation_view'
                }
                SqlService
                    .viewData($scope.query_name, '0')
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
        }
        init();


        // general manage functions
        function setInput(){
            var x = 0;
            while (x < $scope.fields.length){
                $scope.input[$scope.fields[x].name] = $rootScope.data[$scope.fields[x].name];
                x++;
            }
        }

        function submit(input) {
            input.id = 0;
            console.log(input)
            return FormService.edit(input, 'quarterly_reporting_setup', 'id', 0)
        }

        function setTableHeader(){
            var x = 0;
            var y = 0;
            var result =[];
            $rootScope.fieldsArray = Object.keys($rootScope.data[0]);

            while (x < $rootScope.fieldsArray.length){
                var field = $rootScope.fieldsArray[x];
                if (y < 20){
                    if (bad_keys.indexOf(field) == -1){
                        var field_label = TableService.replaceAll(field, "_", " ");
                        var field_type = "";

                        if (field.includes('Date')) {
                            field_type = "date";
                        }

                        else if (currencyFields.indexOf(field)  >= 0) {
                            field_type = "currency";
                        }

                        else if (percentageFields.indexOf(field)  >= 0) {
                            field_type = "percentage";
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
        }

    });