function createPublisherSheet(data, spreadsheet) {
    var sheet_name = "publishers";
    var sheet = spreadsheet.getSheetByName(sheet_name);
    if (sheet == null) {
        var sheet = spreadsheet.insertSheet(sheet_name);
    }

    var header_row = [
        "Prefix",
        "Publisher",
        "Website",
        "Files",
        //    "First issued",
        //    "Last issued",
        //    "Days since issued",
        //    "Last modified",
        "Grants", // "count",
        "Grant amount (GBP)",
        //    "Unique recipients",
        "Funders",
        "Earliest grant",
        "Latest grant",
        "Recipient location",
        "Beneficiary location code",
        "Beneficiary location name",
        "Charity or Company number",
        "Classification",
        "Grant programme",
        "Planned dates",
        "Metadata",
        "% with external identifiers",
        "Non-standard fields",
        "Unrecognised org ID",
        "Non-GB org IDs",
    ];

    sheet.clear();
    var filter = sheet.getFilter();
    if (filter) {
        filter.remove();
    }

    sheet.appendRow(header_row);
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(1);

    var count = 2;

    var pubs = Object.keys(data).sort();

    for (var p in pubs) {

        var pub = data[pubs[p]];

        var metadata = pub["datagetter_metadata"] || {};
        var aggregates = pub["datagetter_aggregates"] || {};
        var coverage = pub["datagetter_coverage"] || {};
        if (!aggregates["currencies"]) { aggregates["currencies"] = {}; }
        if (!aggregates["currencies"]["GBP"]) { aggregates["currencies"]["GBP"] = { "count": 0, "total_amount": 0 }; }

        var min_date = Date.parse(aggregates["min_award_date"]) || null;
        if (min_date) { min_date = new Date(min_date); }
        var max_date = Date.parse(aggregates["max_award_date"]) || null;
        if (max_date) { max_date = new Date(max_date); }
        var datetime_downloaded = Date.parse(metadata["datetime_downloaded"]) || null;
        if (datetime_downloaded) { datetime_downloaded = new Date(datetime_downloaded); }
        var last_modified = Date.parse(pub["modified"]) || null;
        if (last_modified) { last_modified = new Date(last_modified); }
        var issued = Date.parse(pub["issued"]) || null;
        if (issued) { issued = new Date(issued); }

        var nongbids = Object.keys(aggregates["recipient_org_identifier_prefixes"]).filter(function (row) {
            return row.slice(0, 4) != "360G" && row.slice(0, 3) != "GB-"
        });
        var fields = Object.keys(coverage).filter(function (row) {
            return coverage[row]["standard"] == false
        });

        var row_data = [
            pub["publisher"]["prefix"],
            pub["publisher"]["name"],
            hyperlink(pub["publisher"]["website"], "website"),
            pub["files"].length,
            //      issued,
            //      issued,
            //      "=NOW()-G" + (i+2),
            //      last_modified,
            aggregates["count"] || null,
            aggregates["currencies"]["GBP"]["total_amount"] || null,
            //      aggregates["distinct_recipient_org_identifier_count"] || null,
            aggregates["distinct_funding_org_identifier_count"] || null,
            min_date,
            max_date,
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!C:C)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!D:D)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!E:E)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!F:F)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!G:G)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!I:I)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!J:J)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!K:K)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!L:L)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!M:M)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!N:N)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!O:O)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!P:P)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!Q:Q)" +
            ")>0",
            "=(" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!R:R)+" +
            "sumif(recommended_fields!A:A,B" + count + ",recommended_fields!S:S)" +
            ")>0",
            "=1-(sumif(org_id!A:A,B" + count + ",org_id!E:E)/sumif(org_id!A:A,B" + count + ",org_id!C:C))",
            fields.length > 0,
            Object.keys(aggregates["recipient_org_identifiers_unrecognised_prefixes"]).length > 0,
            nongbids.length > 0,
        ]
        sheet.appendRow(row_data);
        count += 1;
    }

    // format date columns
    var date_columns = [8, 9];
    for (var i = 0; i < date_columns.length; i++) {
        sheet.getRange(2, date_columns[i], sheet.getLastRow() - 1).setNumberFormat('yyyy"-"mm"-"dd');
    }

    // format number columns
    var num_columns = [3, 4, 5, 6, 7];
    for (var i = 0; i < num_columns.length; i++) {
        sheet.getRange(2, num_columns[i], sheet.getLastRow() - 1).setNumberFormat('#,##0');
    }

    // format percentage columns
    var pc_columns = [18];
    for (var i = 0; i < pc_columns.length; i++) {
        sheet.getRange(2, pc_columns[i], sheet.getLastRow() - 1).setNumberFormat('0%');
    }

    // set up filter
    var range = sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
    range.createFilter();
}
