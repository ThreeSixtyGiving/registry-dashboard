function createAllFieldsSheet(data, spreadsheet, sheet_name) {
    var sheet = spreadsheet.getSheetByName(sheet_name);
    if (sheet == null) {
        var sheet = spreadsheet.insertSheet(sheet_name);
    }

    var required = [].concat.apply([], Object.keys(required_fields).map(function (row) {
        return required_fields[row]
    }));

    var fields = {};
    var fields_non_standard = {};
    for (var i = 0; i < data.length; i++) {
        if (data[i]["datagetter_coverage"]) {
            for (var field in data[i]["datagetter_coverage"]) {

                // it's a required field
                if (required.indexOf(field) > -1 || field == '/grants') {
                    continue
                    // it's a standard field
                } else if (data[i]["datagetter_coverage"][field]["standard"]) {
                    if (fields[field]) {
                        fields[field] += 1;
                    } else {
                        fields[field] = 1;
                    }
                } else {
                    // it's a non-standard field
                    if (fields_non_standard[field]) {
                        fields_non_standard[field] += 1;
                    } else {
                        fields_non_standard[field] = 1;
                    }
                }
            }
        }
    }


    var fields_sorted = [];
    for (var field in fields) {
        fields_sorted.push([field, fields[field]]);
    }

    fields_sorted.sort(function (a, b) {
        return b[1] - a[1];
    });

    var header_row = [
        'Identifier',
        'Publisher',
        'Title',
    ];

    if (sheet_name == "all_fields") {
        for (var i = 0; i < fields_sorted.length; i++) {
            header_row.push(fields_sorted[i][0].replace("\/grants\/", ""));
        }
    } else if (sheet_name == "nonstandard_fields") {
        for (var f in fields_non_standard) {
            header_row.push(f.replace("\/grants\/", ""));
        }
    }

    sheet.clear();
    var filter = sheet.getFilter();
    if (filter) {
        filter.remove();
    }

    sheet.appendRow(header_row);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(3);

    var all_data = []

    for (var i = 0; i < data.length; i++) {
        var row_data = [
            data[i]["identifier"],
            data[i]["publisher"]["name"],
            data[i]["title"],
        ]

        if (sheet_name == "all_fields") {
            for (var j = 0; j < fields_sorted.length; j++) {
                var field_value = 0;
                var f = fields_sorted[j][0];
                if (data[i]["datagetter_coverage"]) {
                    if (data[i]["datagetter_coverage"][f]) {
                        field_value = data[i]["datagetter_coverage"][f]["grants_with_field"] / data[i]["datagetter_aggregates"]["count"];
                    }
                }
                row_data.push(field_value);
            }
        } else if (sheet_name == "nonstandard_fields") {
            for (var f in fields_non_standard) {
                var field_value = 0;
                if (data[i]["datagetter_coverage"]) {
                    if (data[i]["datagetter_coverage"][f]) {
                        field_value = data[i]["datagetter_coverage"][f]["grants_with_field"] / data[i]["datagetter_aggregates"]["count"];
                    }
                }
                row_data.push(field_value);
            }
        }
        all_data.push(row_data);
    }
    writeMultipleRows(sheet, all_data)


    var range = sheet.getRange(1, 1, sheet.getMaxRows(), header_row.length);
    range.createFilter();

    range.setNumberFormat("0%");

    var rule = SpreadsheetApp.newConditionalFormatRule()
        .setGradientMaxpoint("#f48320")
        .setGradientMinpoint("#FFFFFF")
        .setRanges([range])
        .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);

}