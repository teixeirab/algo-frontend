angular.module('FlexPanelApp')
    .controller('EditController',
        function ($rootScope, $scope, $http, $timeout, $stateParams, SqlService, FormService, $state, table, id, pk) {
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
            $rootScope.data = {};
            $rootScope.fields = [];
            $rootScope.pk = '';

            //initializes controller variables
            var bad_keys = ['_id', 'password', 'id', 'user_id', "added_by", "dt_added", 'trade_date', 'info_id',
                'legal_confirm', 'wire_confirm', 'counterparty_id', 'iso_country_name', 'branch_name', 'account_name',
                'apikey', 'last_access'
                ];

            // initializes scope functions
            $scope.submit = FormService.edit;
            $scope.submit = function(input, table) {
                return FormService.edit(input, table, pk, id)
            };

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
                              .findOne($scope.table, id, pk)
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
            init();

            function setInput(){
                var x = 0;
                while (x < $scope.fields.length){
                    $scope.input[$scope.fields[x].name] = $rootScope.data[$scope.fields[x].name];
                    x++;
                }
            }
        });
