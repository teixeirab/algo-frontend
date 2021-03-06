angular.module('FlexPanelApp')
    .controller('EditController',
        function ($rootScope, $scope, $http, $timeout, $stateParams, SqlService, FormService, InvoiceService, $state, table, id, primary_key, type, TableService) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });

            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;

            // initializes scope variables
            $scope.table = table;
            $scope.input = {};
            $scope.userType = $rootScope.currentUser.user_type;
            $rootScope.data = {};
            $rootScope.fields = [];
            $rootScope.pk = '';
            $scope.type = type;
            $scope.info = {};
            $scope.userType = $rootScope.currentUser.user_type;

            // initializes controller variables
            var bad_keys = ['$$hashKey', '_id', 'password', 'id', 'user_id', "added_by", "dt_added" , 'trade_date'];
            var currencyFields = ['Nominal_Balance', 'Total_Payable', 'Adjustment', 'Interest_Repayment',
                'Interest_Receivable', 'Interest_Accrued', 'Principal_Repayment', 'Adjusted_Total_Payable',
                'Nominal Issued', 'Nominal Outstanding', 'Inventory', 'Cash Received', 'Net Subscribed', 'Amount', 'Advance Balance',
                'Interest Repayment', 'Simple Interest Income', 'Compounded Interest Income'

            ];

            var percentageFields = ['interest_rate', '% Funded', 'Interest Rate'];

            // initializes scope functions
            $scope.submit = FormService.edit;
            $scope.submit = function(input, table) {
                if(type === 'interest_invoice') {
                    InvoiceService.sendInterestInvoice(id).then(function(res) {
                        $rootScope.$broadcast('resetTable');
                        $rootScope.modalInstance.dismiss('cancel');
                    })
                    return
                }
                return FormService.edit(input, table, primary_key, id)
            };
            $scope.cancel = cancel;

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
                var param = '';
                if ($scope.table == 'series_product_information' || $scope.table == 'borrowers') {
                    param = 'IA Capital Structures (Ireland) PLC.';
                }
                else if ($scope.table  == 'qb_extraordinary_fees'){
                    param = 'FlexFunds LTD.';
                }

                if (type == 'edit' || type == 'view'){
                    if (param != ''){
                        SqlService
                            .viewData('unique_customers', param)
                            .then(function (response){
                                if(response.data) {
                                    $scope.customers = response.data;
                                }
                            });
                    }

                    if ($scope.table) {
                        SqlService
                            .findInfo($scope.table)
                            .then(function (response){
                                if(response.data) {
                                    $scope.info = response.data[0];
                                }
                                SqlService
                                    .findFields($scope.table)
                                    .then(function (response) {
                                        if (response.data) {
                                            $rootScope.fields = response.data;
                                            FormService.setFields()
                                        }
                                        SqlService
                                            .findOne($scope.table, id, primary_key)
                                            .then(function (response) {
                                                if (response.data) {
                                                    $rootScope.data = response.data[0];
                                                    setInput();
                                                }
                                            });
                                    });
                            });
                    }
                }
                else if (type == 'interest_invoice'){
                    $scope.info.table_comment = 'Interest Invoice';

                    $rootScope.fields = [
                        {column_name : 'Series Number', column_comment: 'Series Number', column_type: 'varchar'},
                        {column_name : 'Previous Payment Date', column_comment: 'Previous Payment Date', column_type: 'date'},
                        {column_name : 'Loan Payment Date', column_comment: 'Loan Payment Date', column_type: 'date'},
                        {column_name : 'Nominal Basis', column_comment: 'Nominal Basis', column_type: 'double'},
                        {column_name : 'Interest Rate', column_comment: 'Interest Rate', column_type: 'double'},
                        {column_name : 'Interest Repayment', column_comment: 'Interest Repayment', column_type: 'double'},
                        {column_name : 'Interest Income', column_comment: 'Interest Income', column_type: 'double'},
                        {column_name : 'Principal Repayment', column_comment: 'Principal Repayment', column_type: 'double'},
                        {column_name : 'Cash Round Up', column_comment: 'Cash Round Up', column_type: 'double'}
                    ];

                    SqlService
                        .viewData('selected_borrowers', id['Series Number'])
                        .then(function (response){
                            if(response.data) {
                                $scope.borrowers = response.data;
                            }
                        });

                    FormService.setFields();

                    $rootScope.data = id;
                    setInput();
                }


                else if (type == 'table'){
                    $scope.info.table_comment = 'View Calculation Details';
                    findAll(id);
                }
            }
            init();

            function setInput(){
                var x = 0;
                while (x < $scope.fields.length){
                    $scope.input[$scope.fields[x].name] = $rootScope.data[$scope.fields[x].name];
                    x++;
                }
            }

            function cancel(){
                $rootScope.modalInstance.dismiss('cancel');
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
                $scope.data = $rootScope.data
            }

            function findAll(param){
                SqlService
                    .viewData(primary_key, param)
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
        });
