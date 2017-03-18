angular.module('FlexPanelApp')
    .controller('GraphController', function($rootScope, $scope, $http, $timeout, $stateParams, $location, SqlService, $state) {
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

        // initializes date picker
        $('.input-daterange input').each(function() {
            $(this).datepicker('clearDates');
        });

        // initializes program
        function init() {
            if ($stateParams.selectType == 'na'){
                findAll($scope.date.value)
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
                            $scope.item = $scope.options[0];
                            findAll($scope.item.value);
                        }
                    });
            }
        }
        init();

        function findAll(param){
            SqlService
                .viewData($scope.query_name, param)
                .then(function (response){
                    if(response.data) {
                        $rootScope.data = response.data;
                        $rootScope.dataBackup = response.data;
                        createLineGraph($rootScope.data, 'Nominal Issued in millions', 'Nominal Active Notes in millions')
                    }
                });
        }

        function findOptions(){
            if ($stateParams.selectType != 'date'){
                SqlService
                    .findOptions($stateParams.selectType, $scope.table)
                    .then(function (response){
                        if(response.data) {
                            $scope.options = response.data;
                        }
                    });
            }
        }

        function createLineGraph(chartData, valueField1, valueField2) {
            return AmCharts.makeChart('chart_1',
                {
                    "type": "serial",
                    "categoryField": "settlement_date",
                    "dataProvider": chartData,
                    "backgroundAlpha": 1,
                    "borderAlpha": 1,
                    "dataDateFormat": "YYYY-MM-DD",
                    "borderColor": "#FFFFFF",
                    "startAlpha": 1,
                    "fontSize": 10,
                    "theme": "none",
                    "chartCursor": {"enabled": true},
                    "graphs": [
                        {
                            "id": "graph1",
                            "balloonText": "[[title]]: <b>[[value]]</b>",
                            "lineThickness": 3,
                            "bulletBorderAlpha": 1,
                            "lineColor": "#36c6d3",
                            "bulletColor": "#36c6d3",
                            "useLineColorForBulletBorder": true,
                            "bulletBorderThickness": 3,
                            "fillAlphas": 0,
                            "lineAlpha": 1,
                            "title": valueField1,
                            "valueField": valueField1,
                            "dashLengthField": "dashLengthLine"
                        },
                        {
                            "id": "graph2",
                            "balloonText": "[[title]]: <b>[[value]]</b>",
                            "lineThickness": 3,
                            "bulletBorderAlpha": 1,
                            "lineColor": "#3d4957",
                            "bulletColor": "#3d4957",
                            "useLineColorForBulletBorder": true,
                            "bulletBorderThickness": 3,
                            "fillAlphas": 0,
                            "lineAlpha": 1,
                            "title": valueField2,
                            "valueField": valueField2,
                            "dashLengthField": "dashLengthLine"
                        }
                    ],
                    "categoryAxis": {
                        "axisAlpha": 0,
                        "gridAlpha": 0,
                        "inside": true,
                        "tickLength": 0,
                        "parseDates": true
                    },
                    "valueAxes": [
                        {
                            "id": "ValueAxis-1",
                            "title": "",
                            "axisAlpha": 0,
                            "dashLength": 4,
                            "position": "left"
                        }
                    ]
                }
            );
        }


    });