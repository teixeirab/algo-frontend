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
                return new Date(date.replace(/-/g,"/").substring(0,10));
            }

        }

        function toDate(dateStr) {
            const [year,month, day] = dateStr.split("-")
            return new Date(year, month - 1, day)
        }

        function contains(row, searchText, fields){
            var result = true;
            for (var text in searchText){
                for (var x in fields){
                    var field = fields[x];
                    if (field.name == text){
                        if(field.type == 'date'){
                            var date = dateC(row[text]);
                            result = result && (date >= toDate(searchText[text].from) && date <= toDate(searchText[text].to))
                        }
                        else {
                            result = result && (String(row[text]).includes(searchText[text]))
                        }
                    }
                }
            }
            return result;
        }

        function search(searchText, fields){
            var result = [];
            if (searchText != {}){
                $rootScope.data.forEach(function(row) {
                    if (contains(row, searchText, fields)){
                        result.push(row);
                    }
                });

                $rootScope.data = result;
                $rootScope.$broadcast('pageReset');
                $rootScope.$broadcast('filterData');
            }
        }
    }
})();