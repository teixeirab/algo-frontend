angular.module('FlexPanelApp').controller('DashboardController', function($rootScope, $scope, $http, $timeout, SqlService) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    $scope.type = 'All';
    $scope.period = 'YTD';

    // initializes root scope variables
    $rootScope.data = [];
    $rootScope.dataBackup = [];

    // initializes scope functions
    $scope.filterByType = filterByType;
    $scope.filterByPeriod = filterPeriod;


    // initializes program
    function init() {
        SqlService
            .viewData('current_issuance_view')
            .then(function (response){
            if(response.data) {
                $scope.info = response.data[0];
            }
        });
        SqlService
            .viewData('regional_issuance_view')
            .then(function (response){
                if(response.data) {
                    $scope.regional = response.data;
                    filterPeriod($scope.period);
                }
            });
    }
    init();

    function filterByType(type){
        $scope.type = type
    }

    function filterPeriod(period){
        var param;
        if (period == 'YTD'){
            param = new Date(new Date().getFullYear(), 0, 1)
        }
        else if (period == 'TTW'){
            param = new Date().setFullYear((new Date().getFullYear() -  1));
        }
        else param = new Date(new Date().getFullYear() -  5);

        SqlService
            .viewData('issuance_amount_view', formatDate(param))
            .then(function (response){
                if(response.data) {
                    $rootScope.graph = response.data;
                    createLineGraph($rootScope.graph, 'period', 'nominal_issued', 'securitized_assets')
                }
            });
    }

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    function createLineGraph(chartData, category, valueField1, valueField2) {
        return AmCharts.makeChart('chart_1',
            {
                "type": "serial",
                "categoryField": category,
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
                        "title": 'Nominal Issued (in millions)',
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
                        "title": 'Securitized Assets (in millions)',
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