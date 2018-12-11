function onOpen() {
  SpreadsheetApp.getUi().createMenu('Project Tracker').
      addItem('Open controls...', 'showPreferencesSidebar').
      addToUi();
}