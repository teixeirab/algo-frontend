/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var FlexPanelApp = angular.module("FlexPanelApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "moment-picker",
    "ui-notification"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
FlexPanelApp.config([
  '$ocLazyLoadProvider',
  '$controllerProvider',
  'NotificationProvider',
  '$httpProvider',
  function($ocLazyLoadProvider, $controllerProvider, NotificationProvider, $httpProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
    $controllerProvider.allowGlobals();
    NotificationProvider.setOptions({
        delay: 10000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'top'
    });
    $httpProvider.interceptors.push('httpInterceptor');
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
FlexPanelApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        apiHost: window.apiHost,
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '../assets',
        globalPath: '../assets/global',
        layoutPath: '../assets/layouts/layout',
    };

    $rootScope.settings = settings;

    return settings;
}]);

FlexPanelApp.factory('UserSession', ['$window', function($window) {
    this.set = function(key, value) {
        if(value){
            $window.localStorage[key] = value;
        }
    };
    this.get = function(key) {
        return $window.localStorage[key];
    };

    this.remove = function(key){
        $window.localStorage.removeItem(key);
    };
    return this;
}]);

FlexPanelApp.factory('httpInterceptor', function($rootScope, $location, UserSession) {
    this.request = function(config) {
        config.headers['x-apikey'] = UserSession.get('x-apikey');
        return config;
    };
    this.response = function(response) {
        var url = response.config.url;
        if (url.indexOf('login') !== -1 && url.indexOf('html') === -1) {
            UserSession.set('x-apikey', response.data.apikey);
            $rootScope.$broadcast('success.login');
        }
        return response;
    };
    this.requestError = function(error) {
        return error;
    };
    this.responseError = function(error, res) {
        if(error.status === 401 || error.status === 410){
            $rootScope.$broadcast('invalid.apikey', error);
        }
        return error;
    };
    return this;
});

/* Setup App Main Controller */
FlexPanelApp.controller('AppController', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
    $scope.$on('$viewContentLoaded', function() {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });
    $scope.hideHeader = function() {
        if(!$state.current.data) {
            return true
        }
        return ['Login', 'Forgot'].indexOf($state.current.data.pageTitle) > -1
    }
    $scope.showTab = function(roles) {
        if(!$rootScope.currentUser) {
            return
        }
        return roles.indexOf($rootScope.currentUser.user_type) > -1
    }
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
FlexPanelApp.controller('HeaderController', ['$scope', 'UserService', function($scope, UserService) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });

    $scope.logout = logout;

    function logout() {
        UserService.setCurrentUser(null);
        window.location.replace("/panel/client/#/login");
    }
}]);

/* Setup Layout Part - Sidebar */
FlexPanelApp.controller('SidebarController', ['$state', '$scope', function($state, $scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar($state); // init sidebar
    });
}]);

/* Setup Layout Part - Footer */
FlexPanelApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
FlexPanelApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard.html");

    $stateProvider
        // Dashboard
        .state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "views/dashboard.html",
            data: {pageTitle: 'Admin Dashboard'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/global/plugins/morris/morris.css',
                            '../assets/global/plugins/morris/morris.min.js',
                            '../assets/global/plugins/morris/raphael-min.js',
                            '../assets/global/plugins/jquery.sparkline.min.js',

                            '../assets/pages/scripts/dashboard.js',
                            'js/controllers/DashboardController.js',
                        ]
                    });
                }]
            }
        })

        // manage
        .state('manage', {
            url: "/manage/:table",
            templateUrl: "views/manage.html",
            data: {pageTitle: 'Admin Manage'},
            controller: 'ManageController',
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/global/plugins/datatables/datatables.min.css',
                            '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

                            '../assets/global/plugins/datatables/datatables.all.min.js',
                            '../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            '../assets/global/scripts/datatable.js',


                            'js/controllers/WireController.js',
                            'js/controllers/EditController.js',
                            'js/controllers/ManageController.js'
                        ]
                    });
                }]
            }
        })

        // add
        .state('add', {
            url: "/add/:table",
            templateUrl: "views/add.html",
            data: {pageTitle: 'Admin Add'},
            controller: 'AddController',
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/global/plugins/datatables/datatables.min.css',
                            '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

                            '../assets/global/plugins/datatables/datatables.all.min.js',
                            '../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
                            '../assets/global/scripts/datatable.js',

                            'js/controllers/AddController.js'
                        ]
                    });
                }]
            }
        })

        // View
        .state('view', {
            url: "/view/:query/:selectType/:table",
            templateUrl: "views/view.html",
            data: {pageTitle: 'Admin View'},
            controller: 'ViewController',
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/global/plugins/datatables/datatables.min.css',
                            '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
                            '../assets/global/plugins/datatables/datatables.all.min.js',
                            '../assets/global/scripts/datatable.js',

                            'js/controllers/ViewController.js'
                        ]
                    });
                }]
            }
        })

        // Graph
        .state('graph', {
            url: "/graph/:query/:selectType/:table",
            templateUrl: "views/graph.html",
            data: {pageTitle: 'Graph View'},
            controller: 'GraphController',
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            'js/controllers/GraphController.js'
                        ]
                    });
                }]
            }
        })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "views/profile.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/pages/css/profile.css',
                            'js/controllers/UserController.js'
                        ]
                    });
                }]
            }
        })

        // Login
        .state("login", {
            url: "/login",
            templateUrl: "views/login.html",
            data: {pageTitle: 'Login', noAuth: true},
            controller: "LoginController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/pages/css/login.css',
                            'js/controllers/LoginController.js'
                        ]
                    });
                }]
            }
        })

        // Forgot password
        .state("forgot", {
            url: "/forgot",
            templateUrl: "views/forgot.html",
            data: {pageTitle: 'Forgot', noAuth: true},
            controller: "ForgotController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'FlexPanelApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/pages/css/forgot.css',
                            'js/controllers/ForgotController.js'
                        ]
                    });
                }]
            }
        })
}]);

/* Init global settings and run the app */
FlexPanelApp.run(["$rootScope", "settings", "$state", "$location", "UserSession", "UserService", function($rootScope, settings, $state, $location, UserSession, UserService) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
    if ($location.search().k) {
        UserSession.set('x-apikey', $location.search().k)
    }
    UserService.auth()
    $rootScope.$on('success.login', function() {
        UserService.auth()
    })
    $rootScope.$on('invalid.apikey', function() {
        $state.go('login')
    })
    $rootScope.$on('$stateChangeStart', function(evt, toState) {
        const data = toState.data || {}
        if (data.noAuth) {
            return
        }
        if (!UserSession.get('x-apikey')) {
            evt.preventDefault()
            $state.go('login')
        }
    });
}]);
