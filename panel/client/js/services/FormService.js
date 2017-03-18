(function(){
    "use strict";
    angular
        .module("FlexPanelApp")
        .factory("FormService", FormService);

    function FormService($rootScope, SqlService, $state) {
        //initializes controller variables
        var bad_keys = ['_id', 'password', 'id', 'user_id', "added_by", "dt_added", 'trade_date', 'trade_id',
            'legal_sent', 'legal_received', 'wire_confirm', 'interest_confirm', 'info_id', 'counterparty_id',
            'apikey', 'last_access', 'dt_joined'
          ];

        var api = {
            add : add,
            edit : edit,
            setFields : setFields
        };
        return api;

        function add(input, table) {
            SqlService
                .addOne(table, input)
                .then(function (response){
                    if(response.data) {
                        $state.go('manage', {table: table});
                    }
                });
        }

        function edit(input, table, pk, id) {
            id = $rootScope.data[$rootScope.pk||pk] || id;
            SqlService
                .editOne(table, $rootScope.pk||pk, id, input)
                .then(function (response){
                    if(response.data) {
                        $rootScope.modalInstance.dismiss('cancel');
                        $rootScope.$broadcast('resetTable');
                    }
                });
        }

        function setFields() {
            var x = 0;
            var result =[];
            while (x < $rootScope.fields.length) {
                var field = $rootScope.fields[x];
                if (bad_keys.indexOf(field.column_name) == -1) {
                    var field_label = field.column_comment;
                    var field_options = [];
                    var field_type = field.column_type;

                    if (field.column_key == 'PRI'){
                        $rootScope.pk = field.column_name
                    }

                    if (field.column_type == 'varchar(1)') {
                        field_type = "button";
                    }
                    if (field.column_name == 'email') {
                        field_type = "email"
                    }
                    if (field.column_name == 'cellphone') {
                        field_type = "tel"
                    }
                    if (field.column_name == 'password') {
                        field_type = "password"
                    }
                    if (field.column_type.includes("varchar")) {
                        field_type = "varchar"
                    }
                    if (field.column_type.includes("double") || field.column_type == 'float' || field.column_type.includes('decimal')) {
                        field_type = "double"
                    }
                    else if (field.column_type.includes('enum')) {
                        field_type = 'enum';
                        var array = field.column_type.replace('enum(', '').replace(')', '').split(',');
                        var y = 0;
                        while (y < array.length) {
                            field_options.push(array[y].replace("'", '').replace("'", ''));
                            y = y + 1;
                        }
                    }
                    else if (field.column_type.includes('int')) {
                        field_type = "number"
                    }

                    result.push({
                        type: field_type, label: field_label,
                        options: field_options, name: field.column_name,
                        required: field.is_nullable
                    });
                }
                x = x + 1;
            }
            $rootScope.$broadcast('fields', result);
        }

    }
})();