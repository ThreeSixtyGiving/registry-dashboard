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
  // fetch the registry file
  var response = UrlFetchApp.fetch(threesixty_registry, {'muteHttpExceptions': true});
  var json = response.getContentText();
  var data = JSON.parse(json);
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

