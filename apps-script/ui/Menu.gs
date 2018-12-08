function onOpen() {
  SpreadsheetApp.getUi().createMenu('Project Tracker').
      addItem('Open preferences...', 'showPreferencesSidebar').
      addItem('Sync Sheet with Gmail', 'syncCurrentSheetWithGmail').
      addItem('Sync All Sheet with Gmail', 'syncAllSheetsWithGmail').
      addItem('Organize tracking', 'organizeTrackingOnCurrentSheet').
      addItem('Organize all tracking', 'organizeAllTracking').
      addItem('Update overview', 'updateOverview').
      addItem('Do all the things!', 'doAllTheThings').
      addToUi();
}