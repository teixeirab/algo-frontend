(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("InvoiceService", InvoiceService);

    function InvoiceService($http, settings) {
        var apiHost = settings.apiHost
        var api = {
            calcMaintenanceFees: calcMaintenanceFees,
            sendMaintenanceFeesInBatch: sendMaintenanceFeesInBatch,
            sendInterestInvoice: sendInterestInvoice,
            sendLegalInvoice: sendLegalInvoice
        };

        return api;

        function calcMaintenanceFees(from, to) {
            return $http.post(apiHost + "/api/jenkins/maintenance-fees", {from: from, to: to});
        }
        function sendMaintenanceFeesInBatch() {
          return $http.post(apiHost + "/api/jenkins/send-maintenance-fees");
        }
        function sendInterestInvoice(params) {
          return $http.post(apiHost + "/api/panel/qb/interest-invoice/" + params['Series Number'], params);
        }
        function sendLegalInvoice(input) {
            return $http.post(apiHost + "/api/panel/qb/legal-invoice", input);
        }
    }

})();
