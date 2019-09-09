/**
 * Add menu item to spreadsheet UI
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('360Giving')
      .addItem('Import registry', 'importRegistry')
      .addToUi();
}
/**
 * Import the registry file and create sheets based on the data
 */
function importRegistry() {
  // fetch the coverage file for the registry
  var coverage_response = UrlFetchApp.fetch(threesixty_registry, {'muteHttpExceptions': true});
  var coverage_json = coverage_response.getContentText();
  var coverage_data = JSON.parse(coverage_json);
  
  var coverage = {}
  for (var i = 0; i < coverage_data.length; i++) {
    coverage[coverage_data[i]["identifier"]] = coverage_data[i]["datagetter_coverage"];
  }
  
  // fetch the status file (used to fill in Big Lottery Fund details)
  var status_response = UrlFetchApp.fetch(threesixty_status, {'muteHttpExceptions': true});
  var status_json = status_response.getContentText();
  var data = JSON.parse(status_json);
  
  // fetch the status file used to fill in Big Lottery Fund details
  for (var i = 0; i < data.length; i++) {
    if(coverage[data[i]["identifier"]]){
      data[i]["datagetter_coverage"] = coverage[data[i]["identifier"]];
    } else {
      data[i]["datagetter_coverage"] = {};
    }
  }
  
  data = by_publisher(data);
  
  // add sheets based on the data
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  createPublisherSheet(data["publishers"], spreadsheet);
  createAllFieldsSheet(data["files"], spreadsheet);
  createMainSheet(data["files"], spreadsheet);
  createDateSheet(data["publishers"], spreadsheet);
  createRFSheet(data["files"], spreadsheet, required_fields, "required_fields");
  createRFSheet(data["files"], spreadsheet, recommended_fields, "recommended_fields");
  createFieldSummarySheet(data["files"], spreadsheet, "currencies", "currencies");
  createFieldSummarySheet(data["files"], spreadsheet, "recipient_org_identifier_prefixes", "org_id");
  
  // save the dashboard history to the history sheet
  saveHistory(spreadsheet);
}
