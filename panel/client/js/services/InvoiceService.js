(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("InvoiceService", InvoiceService);

    function InvoiceService($http, settings) {
        var apiHost = settings.apiHost
        var api = {
            calcMaintenanceFees: calcMaintenanceFees,
            sendMaintenanceFeesInBatch: sendMaintenanceFeesInBatch
        };

        return api;

        function calcMaintenanceFees(from, to) {
            return $http.post(apiHost + "/api/jenkins/maintenance-fees", {from: from, to: to});
        }
        function sendMaintenanceFeesInBatch() {
          return $http.post(apiHost + "/api/jenkins/send-maintenance-fees");
        }
    }

})();
