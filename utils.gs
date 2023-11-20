function range(start, stop, step) {
    var a = [start], b = start;
    while (b < stop) {
        a.push(b += step || 1);
    }
    return a;
}

function hyperlink(link, text) {
    if (text) {
        return '=HYPERLINK("' + link.replace('"', '""') + '","' + text.replace('"', '""') + '")';
    }
    return '=HYPERLINK("' + link.replace('"', '""') + '")';
}

function get_funder_type(funder) {
    if (lottery_funders.indexOf(funder) > -1) {
        return "lottery";
    }
    if (funder.slice(0, 7) == "GB-GOR-") {
        return "government";
    }
    if (local_government_prefixes.indexOf(funder.slice(0, 7)) > -1) {
        return "local_government";
    }
    return "other";
}

function by_publisher(data) {
    var publishers = {};
    var funders = {};
    var funder_types = {
        "government": 0,
        "lottery": 0,
        "local_government": 0,
        "other": 0,
    };

    for (var i = 0; i < data.length; i++) {
        var pub_name = data[i]["publisher"]["name"].toLowerCase().trim();
        if (pub_name.slice(0, 4) == "the ") {
            pub_name = pub_name.slice(4).trim();
        }

        if (publishers[pub_name] == null) {
            publishers[pub_name] = {
                "publisher": data[i]["publisher"],
                "files": [],
                "datagetter_metadata": {
                    "acceptable_licence": 0,
                    "unacceptable_licence": 0,
                    "valid": 0,
                    "invalid": 0,
                    "downloads": 0,
                    "download_fails": 0,
                    "file_type": {},
                    "file_size": 0,
                    "file_count": 0,
                },
                "datagetter_coverage": {},
                "datagetter_aggregates": {
                    "count": 0,
                    "currencies": {},
                    "distinct_funding_org_identifier": [],
                    "distinct_funding_org_identifier_count": 0,
                    "funding_org_identifier_prefixes": {},
                    "id_count": 0,
                    "max_award_date": null,
                    "min_award_date": null,
                    "recipient_org_identifier_prefixes": {},
                    "recipient_org_identifiers_unrecognised_prefixes": {},
                },
            };
        }

        // Funders and funder types
        if (data[i]["datagetter_aggregates"]) {
            var file_funders = data[i]["datagetter_aggregates"]["distinct_funding_org_identifier"];
            data[i]["datagetter_aggregates"]["funding_org_types"] = {};
            for (var j = 0; j < file_funders.length; j++) {
                if (funders[file_funders[j]] == null) {
                    funders[file_funders[j]] = 0;
                }
                funders[file_funders[j]] += 1;

                if (data[i]["datagetter_aggregates"]["funding_org_types"][file_funders[j]] == null) {
                    data[i]["datagetter_aggregates"]["funding_org_types"][file_funders[j]] = 0;
                }
                data[i]["datagetter_aggregates"]["funding_org_types"][file_funders[j]] += 1;

                funder_types[get_funder_type(file_funders[j])] += 1;
            }
        }

        publishers[pub_name]["files"].push(data[i]);

        // Metadata
        if (data[i]["datagetter_metadata"]["acceptable_licence"]) {
            publishers[pub_name]["datagetter_metadata"]["acceptable_licence"] += 1;
        } else {
            publishers[pub_name]["datagetter_metadata"]["unacceptable_licence"] += 1;
        }
        if (data[i]["datagetter_metadata"]["valid"]) {
            publishers[pub_name]["datagetter_metadata"]["valid"] += 1;
        } else {
            publishers[pub_name]["datagetter_metadata"]["invalid"] += 1;
        }
        if (data[i]["datagetter_metadata"]["downloads"]) {
            publishers[pub_name]["datagetter_metadata"]["downloads"] += 1;
        } else {
            publishers[pub_name]["datagetter_metadata"]["download_fails"] += 1;
        }

        var file_type = data[i]["datagetter_metadata"]["file_type"];
        if (publishers[pub_name]["datagetter_metadata"]["file_type"][file_type] == null) {
            publishers[pub_name]["datagetter_metadata"]["file_type"][file_type] = 0;
        }
        publishers[pub_name]["datagetter_metadata"]["file_count"] += 1;
        publishers[pub_name]["datagetter_metadata"]["file_type"][file_type] += 1;
        publishers[pub_name]["datagetter_metadata"]["file_size"] += data[i]["datagetter_metadata"]["file_size"];

        // Field coverage
        for (var f in data[i]["datagetter_coverage"]) {
            if (publishers[pub_name]["datagetter_coverage"][f] == null) {
                publishers[pub_name]["datagetter_coverage"][f] = {
                    "grants_with_field": 0,
                    "standard": data[i]["datagetter_coverage"][f]["standard"],
                    "files_with_field": 0,
                }
            }

            publishers[pub_name]["datagetter_coverage"][f]["grants_with_field"] += data[i]["datagetter_coverage"][f]["grants_with_field"];
            publishers[pub_name]["datagetter_coverage"][f]["files_with_field"] += 1;
        }

        // Aggregates
        if (data[i]["datagetter_aggregates"]) {
            publishers[pub_name]["datagetter_aggregates"]["count"] += data[i]["datagetter_aggregates"]["count"];
            publishers[pub_name]["datagetter_aggregates"]["id_count"] += data[i]["datagetter_aggregates"]["id_count"];

            // Currency
            for (var currency in data[i]["datagetter_aggregates"]["currencies"]) {
                if (publishers[pub_name]["datagetter_aggregates"]["currencies"][currency] == null) {
                    publishers[pub_name]["datagetter_aggregates"]["currencies"][currency] = {
                        "count": 0,
                        "currency_symbol": data[i]["datagetter_aggregates"]["currencies"][currency]["currency_symbol"],
                        "max_amount": data[i]["datagetter_aggregates"]["currencies"][currency]["max_amount"],
                        "min_amount": data[i]["datagetter_aggregates"]["currencies"][currency]["min_amount"],
                        "total_amount": 0,
                    }
                }

                publishers[pub_name]["datagetter_aggregates"]["currencies"][currency]["count"] += data[i]["datagetter_aggregates"]["currencies"][currency]["count"];
                publishers[pub_name]["datagetter_aggregates"]["currencies"][currency]["total_amount"] += data[i]["datagetter_aggregates"]["currencies"][currency]["total_amount"];
                publishers[pub_name]["datagetter_aggregates"]["currencies"][currency]["max_amount"] = Math.max(
                    publishers[pub_name]["datagetter_aggregates"]["currencies"][currency]["max_amount"],
                    data[i]["datagetter_aggregates"]["currencies"][currency]["max_amount"]
                );
                publishers[pub_name]["datagetter_aggregates"]["currencies"][currency]["min_amount"] = Math.min(
                    publishers[pub_name]["datagetter_aggregates"]["currencies"][currency]["min_amount"],
                    data[i]["datagetter_aggregates"]["currencies"][currency]["min_amount"]
                );
            }

            // max award date
            if (publishers[pub_name]["datagetter_aggregates"]["max_award_date"]) {
                publishers[pub_name]["datagetter_aggregates"]["max_award_date"] = Utilities.formatDate(new Date(Math.max(
                    Date.parse(publishers[pub_name]["datagetter_aggregates"]["max_award_date"]),
                    Date.parse(data[i]["datagetter_aggregates"]["max_award_date"])
                )), "GMT", "yyyy-MM-dd");
            } else {
                publishers[pub_name]["datagetter_aggregates"]["max_award_date"] = data[i]["datagetter_aggregates"]["max_award_date"];
            }

            // min award date
            if (publishers[pub_name]["datagetter_aggregates"]["min_award_date"]) {
                publishers[pub_name]["datagetter_aggregates"]["min_award_date"] = Utilities.formatDate(new Date(Math.min(
                    Date.parse(publishers[pub_name]["datagetter_aggregates"]["min_award_date"]),
                    Date.parse(data[i]["datagetter_aggregates"]["min_award_date"])
                )), "GMT", "yyyy-MM-dd");
            } else {
                publishers[pub_name]["datagetter_aggregates"]["min_award_date"] = data[i]["datagetter_aggregates"]["min_award_date"];
            }

            // distinct_funding_org_identifier
            publishers[pub_name]["datagetter_aggregates"]["distinct_funding_org_identifier"] = publishers[pub_name]["datagetter_aggregates"]["distinct_funding_org_identifier"].concat(
                data[i]["datagetter_aggregates"]["distinct_funding_org_identifier"]
            );
            publishers[pub_name]["datagetter_aggregates"]["distinct_funding_org_identifier"] = publishers[pub_name]["datagetter_aggregates"]["distinct_funding_org_identifier"].filter(function (item, i, ar) { return ar.indexOf(item) === i; });
            publishers[pub_name]["datagetter_aggregates"]["distinct_funding_org_identifier_count"] = publishers[pub_name]["datagetter_aggregates"]["distinct_funding_org_identifier"].length;

            var fields = [
                "funding_org_identifier_prefixes",
                "recipient_org_identifier_prefixes",
                "recipient_org_identifiers_unrecognised_prefixes"
            ];
            for (var f in fields) {
                var field = fields[f];
                for (var v in data[i]["datagetter_aggregates"][field]) {
                    if (publishers[pub_name]["datagetter_aggregates"][field][v] == null) {
                        publishers[pub_name]["datagetter_aggregates"][field][v] = 0;
                    }
                    publishers[pub_name]["datagetter_aggregates"][field][v] += data[i]["datagetter_aggregates"][field][v];
                }
            }
        }
    }

    return {
        "publishers": publishers,
        "funders": funders,
        "funder_types": funder_types,
        "files": data,
    };
}


function writeMultipleRows(sheet, data) {
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, data.length, data[0].length).setValues(data);
}