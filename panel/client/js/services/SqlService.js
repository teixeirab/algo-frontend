(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("SqlService", SqlService);

    function SqlService($http, $rootScope, settings) {
        var apiHost = settings.apiHost
        var api = {
            findAll: findAll,
            findOne: findOne,
            deleteOne: deleteOne,
            editOne: editOne,
            findFields: findFields,
            findInfo: findInfo,
            addOne: addOne,
            viewData: viewData,
            findOptions: findOptions,
            getPrice: getPrice

        };

        return api;

        function addOne(table, row) {
            return $http.post(apiHost + "/api/panel/sql/" + table, row);
        }

        function findInfo(table) {
            return $http.get(apiHost + "/api/panel/sql/info/" + table);
        }

        function findAll(table) {
            return $http.get(apiHost + "/api/panel/sql/" + table);
        }

        function findFields(table) {
            return $http.get(apiHost + "/api/panel/sql/fields/" + table)
        }

        function findOne(table, id, pk) {
            return $http.get(apiHost + "/api/panel/sql/" + table + "/" + id + "/" + pk);
        }

        function deleteOne(table, id, pk) {
            return $http.get(apiHost + "/api/panel/sql/delete/" + table + "/" + id + "/" + pk);
        }

        function editOne(table, pk, id, row) {
            return $http.put(apiHost + "/api/panel/sql/" + table + "/" + pk + "/" + id, row)
        }

        function viewData(query, param) {
            return $http.get(apiHost + "/api/panel/view/" + query + "/" + param)
        }

        function findOptions(selectType, table, query_name) {
            return $http.get(apiHost + "/api/panel/options/" + selectType + "/" + table+ "/" + query_name);
        }

        function getPrice(series_number, settlement_date) {
            return $http.get(apiHost + "/api/prices/" + series_number + "/" + settlement_date);
        }


    }

})();
