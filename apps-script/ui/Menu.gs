function onOpen() {
  SpreadsheetApp.getUi().createMenu('Project Tracker').
  addItem('Gmail: Open preferences...', 'showPreferencesSidebar').
  addItem('Gmail: Sync Sheet', 'syncCurrentSheetWithGmail').
  addItem('Gmail: Sync All Sheets', 'syncAllSheetsWithGmail').
  addItem('Tracking: Organize sheet', 'organizeTrackingOnCurrentSheet').
  addItem('Tracking: Organize all sheets', 'organizeAllTracking').
  addItem('Tracking: Update overview', 'updateOverview').
  addItem('Tracking: Do all the things!', 'doAllTheThings').
  addToUi();
}