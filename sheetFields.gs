function createRFSheet(data, spreadsheet, rf, sheet_name) {
    var sheet = spreadsheet.getSheetByName(sheet_name);
    if (sheet == null) {
        var sheet = spreadsheet.insertSheet(sheet_name);
    }

    var header_row = [
        [null, null],
        [
            'Publisher',
            'Title',
        ]
    ];

    for (var group in rf) {
        for (var i = 0; i < rf[group].length; i++) {
            if (i == 0) {
                header_row[0].push(group);
            } else {
                header_row[0].push(null);
            }
            header_row[1].push(rf[group][i].split('/').slice(-1)[0]);
        }
    }

    sheet.clear();
    var filter = sheet.getFilter();
    if (filter) {
        filter.remove();
    }

    sheet.appendRow(header_row[0]);
    sheet.appendRow(header_row[1]);
    sheet.setFrozenRows(2);
    sheet.setFrozenColumns(2);

    var col_count = 3;
    for (var group in rf) {
        sheet.getRange(1, col_count, 1, rf[group].length).merge();
        col_count += rf[group].length;
    }

    for (var i = 0; i < data.length; i++) {
        var row_data = [
            data[i]["publisher"]["name"],
            data[i]["title"],
        ]

        for (var group in rf) {
            for (var j = 0; j < rf[group].length; j++) {
                var field_value = 0;
                if (data[i]["datagetter_coverage"]) {
                    if (data[i]["datagetter_coverage"][rf[group][j]]) {
                        field_value = 1;
                    }
                }
                row_data.push(field_value);
            }
        }
        sheet.appendRow(row_data);
    }

    var range = sheet.getRange(2, 1, sheet.getMaxRows() - 1, header_row[1].length);
    range.createFilter();

    var rule = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(1, 1)
        .setBackground("#c6efce")
        .setRanges([range])
        .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);

}