(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("TableService", TableService);

    function TableService($rootScope) {
        var api = {
            replaceAll: replaceAll,
            exportExcel: exportExcel,
            nextPage: nextPage,
            previousPage: previousPage,
            filterChange : filterChange,
            sort: sort,
            search: search,
        };

        return api;

        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(find, 'g'), replace);
        }

        function exportExcel(report) {
            var rightNow = new Date();
            var res = rightNow.toISOString().slice(0,10).replace(/-/g,"");

            alasql('SELECT * INTO XLSX("' + report + '_' + res + '.xlsx",{headers:true}) FROM ?', [$rootScope.data]);
        }

        function nextPage(page, numberPages){
            var temp = page;
            if ((temp + 1) <= numberPages){
                $rootScope.$broadcast('pageIncrease');
                $rootScope.$broadcast('filterData');
            }
        }

        function previousPage(page){
            var temp = page;
            if (temp - 1 > 0){
                $rootScope.$broadcast('pageDecrease');
                $rootScope.$broadcast('filterData');
            }
        }

        function filterChange(newSize){
            $rootScope.rowsShowing = newSize;
            $rootScope.$broadcast('pageReset');
            $rootScope.$broadcast('filterData');
        }

        function sort(fieldName){
            var result = '';
            for (var i = 0; i < $rootScope.fieldsArray.length; i++) {
                if ($rootScope.fieldsArray[i] && $rootScope.fieldsArray[i].column_name == fieldName) {
                    result = $rootScope.fieldsArray[i].column_type;
                }
            }
            if ($rootScope.direction == true){
                $rootScope.data.sort(function(a, b) {
                    if (result.includes('int') ||
                        result.includes('double') ||
                        result.includes('decimal')  ||
                        result.includes('float') ||
                        fieldName == ('Series Number')
                    ){
                        return a[fieldName] - b[fieldName]
                    }else return String(a[fieldName]).localeCompare(String(b[fieldName]));
                });
                $rootScope.direction = false;
            }
            else if ($rootScope.direction == false) {
                $rootScope.data.sort(function (a, b) {
                    if (result.includes('int') ||
                        result.includes('double') ||
                        result.includes('decimal') ||
                        result.includes('float') ||
                        fieldName == ('Series Number')
                    ) {
                        return b[fieldName] - a[fieldName]
                    } else return String(b[fieldName]).localeCompare(String(a[fieldName]));
                });
                $rootScope.direction = true;
            }
            $rootScope.$broadcast('filterData');
        }

        function dateC(date){
            if (typeof date === 'string'){
                return new Date(date.replace(/-/g,"/").substring(0,9));
            }

        }

        function search(searchText, searchDate, fields){
            var result = [];
            var idata= 0;

            if (searchText != {} || searchDate != {}){
                while (idata < $rootScope.data.length){
                    var row = $rootScope.data[idata];
                    var ifields = 0;
                    for (var field in searchText){
                        var icolumn = String(field).replace("search", "");

                        if (searchText[field] != undefined && searchText[field] != "" && (String(row[fields[icolumn].name]).includes(searchText[field]))){
                            result.push(row)
                        }
                        else if (fields[ifields] != undefined
                            && dateC(row[fields[icolumn].name]) >= dateC(searchDate["date" + ifields + "1"])
                            && dateC(row[fields[0].name]) <= dateC(searchDate["date" + ifields + "1"])){
                            result.push(row)
                        }
                        ifields++;
                    }
                    idata++;

                }
                $rootScope.data = result;
                $rootScope.$broadcast('pageReset');
                $rootScope.$broadcast('filterData');
            }
        }
    }
})();