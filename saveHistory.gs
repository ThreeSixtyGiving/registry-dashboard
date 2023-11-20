function saveHistory(spreadsheet) {
    var dashboard = spreadsheet.getSheetByName("Dashboard");
    var history = spreadsheet.getSheetByName("history");

    // settings for the new row we're going to create
    var new_row = history.getLastRow() + 1;
    var header_row = history.getRange(1, 1, 1, history.getLastColumn()).getValues()[0];

    // add the current date to the new row
    history.getRange(new_row, 1).setValue(new Date);

    // look for values in the dashboard and add them to the history sheet
    var dashboard_values = dashboard.getSheetValues(1, 1, dashboard.getLastRow(), dashboard.getLastColumn());
    for (var i = 0; i < dashboard_values.length; i++) {
        for (var j = 0; j < dashboard_values[i].length; j++) {

            // we're only going to log values if they contain a number
            if (typeof dashboard_values[i][j] != 'number') { continue; }

            // if there's no label row then don't save
            if (dashboard_values[i + 1] == undefined) { continue; }

            // get the label (next cell down) and the cell itself
            var label = dashboard_values[i + 1][j];
            var cell = dashboard.getRange(i + 1, j + 1);

            // add to the header row if we don't know about this item already
            var col_number = header_row.indexOf(label);
            if (col_number == -1) {
                history.getRange(1, header_row.length + 1).setValue(label);
                header_row.push(label);
                col_number = header_row.length;
            }

            // add the value to the history list
            history.getRange(new_row, col_number + 1)
                .setValue(cell.getValue())
                .setNumberFormat(cell.getNumberFormat());
        }
    }
}
