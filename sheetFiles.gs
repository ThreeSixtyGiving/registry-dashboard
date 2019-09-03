function createMainSheet(data, spreadsheet) {
    var sheet_name = "files";
    var sheet = spreadsheet.getSheetByName(sheet_name);
    if (sheet == null) {
        var sheet = spreadsheet.insertSheet(sheet_name);
    }

    var header_row = [
        "Identifier",
        "Publisher",
        "Title",
        "Valid", // "valid",
        "Acceptable license", // "acceptable_license",
        "License",
        "Issued",
        "Days since issued",
        "Last modified",
        "File size", // "file_size",
        "File type", // "file_type",
        "Grants", // "count",
        "Grant amount (GBP)",
        "Unique recipients",
        "Funders",
        "Earliest grant",
        "Latest grant",
        "Access URL",
        "Download URL",
    ];

    sheet.clear();
    var filter = sheet.getFilter();
    if (filter) {
        filter.remove();
    }

    sheet.appendRow(header_row);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(3);


    for (var i = 0; i < data.length; i++) {

        var metadata = data[i]["datagetter_metadata"] || {};
        var aggregates = data[i]["datagetter_aggregates"] || {};
        if (!aggregates["currencies"]) { aggregates["currencies"] = {}; }
        if (!aggregates["currencies"]["GBP"]) { aggregates["currencies"]["GBP"] = { "count": 0, "total_amount": 0 }; }

        var min_date = Date.parse(aggregates["min_award_date"]) || null;
        if (min_date) { min_date = new Date(min_date); }
        var max_date = Date.parse(aggregates["max_award_date"]) || null;
        if (max_date) { max_date = new Date(max_date); }
        var datetime_downloaded = Date.parse(metadata["datetime_downloaded"]) || null;
        if (datetime_downloaded) { datetime_downloaded = new Date(datetime_downloaded); }
        var last_modified = Date.parse(data[i]["modified"]) || null;
        if (last_modified) { last_modified = new Date(last_modified); }
        var issued = Date.parse(data[i]["issued"]) || null;
        if (issued) { issued = new Date(issued); }

        var row_data = [
            data[i]["identifier"],
            hyperlink(data[i]["publisher"]["website"], data[i]["publisher"]["name"]),
            data[i]["title"],
            metadata["valid"] || null,
            metadata["acceptable_license"] || null,
            hyperlink(data[i]["license"], data[i]["license_name"]),
            issued,
            "=NOW()-G" + (i + 2),
            last_modified,
            metadata["file_size"] || null,
            metadata["file_type"] || null,
            aggregates["count"] || null,
            aggregates["currencies"]["GBP"]["total_amount"] || null,
            aggregates["distinct_recipient_org_identifier_count"] || null,
            aggregates["distinct_funding_org_identifier_count"] || null,
            min_date,
            max_date,
            data[i]["distribution"][0]["accessURL"],
            data[i]["distribution"][0]["downloadURL"],
        ]
        sheet.appendRow(row_data);
    }

    // format date columns
    var date_columns = [7, 9, 16, 17];
    for (var i = 0; i < date_columns.length; i++) {
        sheet.getRange(2, date_columns[i], sheet.getLastRow() - 1).setNumberFormat('yyyy"-"mm"-"dd');
    }

    // format number columns
    var num_columns = [8, 10, 12, 13, 14, 15];
    for (var i = 0; i < num_columns.length; i++) {
        sheet.getRange(2, num_columns[i], sheet.getLastRow() - 1).setNumberFormat('#,##0');
    }

    // set up filter
    var range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    range.createFilter();
}
