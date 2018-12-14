function onOpen() {
  Log.start('onOpen', []);
  SpreadsheetApp.getUi().createMenu('Project Tracker').
      addItem('Open controls...', 'showPreferencesSidebar').
      addToUi();
  Log.stop('onOpen', []);
}