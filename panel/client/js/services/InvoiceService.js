(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("InvoiceService", InvoiceService);

    function InvoiceService($http, settings) {
        var apiHost = settings.apiHost
        var api = {
            calcMaintenanceFees: calcMaintenanceFees
        };

        return api;

        function calcMaintenanceFees(from, to, callback) {
            return $http.post(apiHost + "/api/jenkins/maintenance-fees", {from: from, to: to});
        }
    }

})();
