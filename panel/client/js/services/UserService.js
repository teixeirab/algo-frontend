(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("UserService", UserService);

    function UserService($http, $rootScope, $window, settings, UserSession) {
        var apiHost = settings.apiHost;
        var api = {
            setCurrentUser: setCurrentUser,
            login: login,
            auth: auth,
            resetPassword: resetPassword,
            changePassword: changePassword,
            saveProfile: saveProfile
        };

        return api;

        function setCurrentUser(user) {
            $rootScope.currentUser = user;
            if(!user) {
                UserSession.remove('x-apikey')
            }
        }

        function login(username, password) {
            return $http.post(apiHost + "/api/panel/login", {
              username: username,
              password: password
            });
        }

        function resetPassword(email) {
            return $http.post(apiHost + "/api/panel/reset-password", {
              email: email
            });
        }

        function auth() {
            if(!UserSession.get('x-apikey')) {
                return;
            }
            $http.get(apiHost + "/api/panel/user").then(function(response) {
                setCurrentUser(response.data)
            });
        }

        function saveProfile(user) {
            $http.put(apiHost + "/api/panel/user", user);
        }

        function changePassword(current, password) {
            return $http.put(apiHost + '/api/panel/reset-password', {
                current: current,
                password: password
            })
        }
    }
})();
