/**
 * Create a sheet showing the date range of the publishers
 *
 * @param {array} data The registry data to display.
 */
function createDateSheet(data, spreadsheet) {

    // set up the sheet
    var sheet_name = "date_coverage";
    var sheet = spreadsheet.getSheetByName(sheet_name);
    if (sheet == null) {
        var sheet = spreadsheet.insertSheet(sheet_name);
    }

    var min_dates = [];
    var max_dates = [];

    // extract data on the publishers
    for (var i in data) {
        if (data[i]["datagetter_aggregates"]) {
            if (data[i]["datagetter_aggregates"]["min_award_date"] != null) {
                var min_date = Date.parse(data[i]["datagetter_aggregates"]["min_award_date"]);
                min_dates.push(min_date);
            }
            if (data[i]["datagetter_aggregates"]["max_award_date"] != null) {
                var max_date = Date.parse(data[i]["datagetter_aggregates"]["max_award_date"]);
                max_dates.push(max_date);
            }
        } else {
            Logger.log(i);
        }
    }

    // get the first and last years
    var min_date = new Date(Math.min.apply(null, min_dates));
    var max_date = new Date(Math.max.apply(null, max_dates));
    min_date = min_date.getFullYear();
    max_date = max_date.getFullYear();

    // create the headers rows for the sheet
    var header_row = [
        'Publisher',
        'Min award date',
        'Max award date',
    ];

    for (var i = min_date; i <= max_date; i++) {
        header_row.push(i);
    }
    header_row.push('Total');

    // clear existing values from the sheet
    sheet.clear();
    var filter = sheet.getFilter();
    if (filter) {
        filter.remove();
    }

    // append the header row and set up column & row styling
    sheet.appendRow(header_row);
    sheet.setColumnWidths(1, 1, 250);
    sheet.setColumnWidths(2, 3, 100);
    if (header_row.length > 4) {
        sheet.setColumnWidths(4, header_row.length - 4, 50);
    }
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);
    var range = sheet.getRange(1, 1, 1, header_row.length);
    range.setFontWeight("bold");

    // add each publisher to the sheet
    for (var pub_name in data) {
        var row_data = [
            data[pub_name]["publisher"]["name"],
            new Date(data[pub_name]["datagetter_aggregates"]['min_award_date']),
            new Date(data[pub_name]["datagetter_aggregates"]['max_award_date']),
        ]
        var years = 0;
        for (var i = min_date; i <= max_date; i++) {
            if (row_data[1].getFullYear() <= i && row_data[2].getFullYear() >= i) {
                row_data.push('Y');
                years += 1;
            } else {
                row_data.push(null);
            }
        }
        row_data.push(years);

        sheet.appendRow(row_data);
    }

    // format date columns
    var date_columns = sheet.getRange(2, 2, sheet.getLastRow() - 1, 2);
    date_columns.setNumberFormat('yyyy"-"mm"-"dd');

    // sort the sheet
    sheet.sort(header_row.length, false);

    // add filter to the sheet
    var range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    range.createFilter();

    // set conditional formatting
    var rule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo("Y")
        .setBackground("#c6efce")
        .setRanges([range])
        .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
}
