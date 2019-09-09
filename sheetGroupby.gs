function createFieldSummarySheet(data, spreadsheet, field, sheet_name) {
    var sheet = spreadsheet.getSheetByName(sheet_name);
    if (sheet == null) {
        var sheet = spreadsheet.insertSheet(sheet_name);
    }

    var orgids = {};
    for (var i = 0; i < data.length; i++) {
        if (data[i]["datagetter_aggregates"]) {
            for (var orgid in data[i]["datagetter_aggregates"][field]) {
                var value = data[i]["datagetter_aggregates"][field][orgid];
                if (value.hasOwnProperty("count")) {
                    value = value.count;
                }
                if (orgids[orgid]) {
                    orgids[orgid] += value;
                } else {
                    orgids[orgid] = value;
                }
            }
        }
    }


    var orgids_sorted = [];
    for (var orgid in orgids) {
        if (field == 'recipient_org_identifier_prefixes') {
            if (orgid != "360G") {
                orgids_sorted.push([orgid, orgids[orgid]]);
            }
        } else {
            orgids_sorted.push([orgid, orgids[orgid]]);
        }
    }

    orgids_sorted.sort(function (a, b) {
        return b[1] - a[1];
    });

    var header_row = [
        'Publisher',
        'Title',
    ];

    if (field == 'recipient_org_identifier_prefixes') {
        orgids_sorted = [['360G', orgids['360G']]].concat(orgids_sorted);
        header_row.push('Recipients');
        header_row.push('% external ids');
        header_row.push('Unrecognised+360G');
        header_row.push('Unrecognised');
    }

    for (var i = 0; i < orgids_sorted.length; i++) {
        header_row.push(orgids_sorted[i][0]);
    }

    sheet.clear();
    var filter = sheet.getFilter();
    if (filter) {
        filter.remove();
    }

    sheet.appendRow(header_row);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);

    for (var i = 0; i < data.length; i++) {
        var row_data = [
            data[i]["publisher"]["name"],
            data[i]["title"],
        ]

        if (field == 'recipient_org_identifier_prefixes') {
            var unrecognised = 0;
            var grants = 0;
            if (data[i]["datagetter_aggregates"]) {
                for (var prefix in data[i]["datagetter_aggregates"]["recipient_org_identifiers_unrecognised_prefixes"]) {
                    unrecognised += data[i]["datagetter_aggregates"]["recipient_org_identifiers_unrecognised_prefixes"][prefix]
                }
                grants = data[i]["datagetter_aggregates"]["distinct_recipient_org_identifier_count"];
            }
            row_data.push(grants);
            row_data.push("=(C" + (i + 2) + "-E" + (i + 2) + ")/C" + (i + 2));
            row_data.push("=F" + (i + 2) + "+G" + (i + 2));
            row_data.push(unrecognised);
        }

        for (var j = 0; j < orgids_sorted.length; j++) {
            var field_value = 0;
            if (data[i]["datagetter_aggregates"]) {
                if (data[i]["datagetter_aggregates"][field][orgids_sorted[j][0]]) {
                    field_value = data[i]["datagetter_aggregates"][field][orgids_sorted[j][0]];
                    if (field_value.hasOwnProperty("count")) {
                        field_value = field_value.count;
                    }
                }
            }
            row_data.push(field_value);
        }
        sheet.appendRow(row_data);
    }

    var range = sheet.getRange(1, 1, sheet.getMaxRows(), header_row.length);
    range.createFilter();

    var rule = SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThan(0)
        .setBackground("#c6efce")
        .setRanges([range])
        .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);

    range.setNumberFormat('#,##0');
    if (field == 'recipient_org_identifier_prefixes') {
        sheet.getRange(2, 4, sheet.getLastRow() - 1).setNumberFormat('0%');
    }

}