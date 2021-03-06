var Docs = {};

Docs.DOC = 'Doc';
Docs.SHEET = 'Sheet';
Docs.PRESENTATION = 'Presentation';
Docs.FORM = 'Form';
Docs.GENERIC = 'Drive File';

Docs.getType = function(url) {
  if (url.startsWith('https://docs.')) {
    if (url.includes('/document')) {
      return Docs.DOC;
    } else if (url.includes('/spreadsheet')) {
      return Docs.SHEET;
    } else if (url.includes('/presentation')) {
      return Docs.PRESENTATION;
    } else if (url.includes('/forms')) {
      return Docs.FORM;
    } else {
      return Docs.GENERIC;
    }
  }
  return null;
}

Docs.getId = function(url) {
  return url.match(/[-\w]{25,}/);
}

Docs.getName = function(url) {
  var type = Docs.getType(url);
  Log.info(type);
  if (type === Docs.DOC) {
    try {
      return DocumentApp.openByUrl(url).getName();
    } catch (e) {
      return 'Unknown Doc';
    }
  }
  if (type === Docs.SHEET) {
    try {
      return SpreadsheetApp.openByUrl(url).getName();
    } catch (e) {
      return 'Unknown Sheet';
    }
  }
  if (type === Docs.PRESENTATION) {
    try {
      return SlidesApp.openByUrl(url).getName();
    } catch (e) {
      return 'Unknown Presentation';
    }
  }
  Log.info(url);
  if (type === Docs.FORM) {
    try {
      return FormApp.openByUrl(url).getTitle();
    } catch (e) {
      return 'Unknown Form';
    }
  }
  if (type === Docs.GENERIC) {
    var id = Docs.getId(url);
    if (id) {
      try {
        return DriveApp.getFileById(id).getName();
      } catch(e) {
        return 'Unknown Drive file';
      }
    }
  }
  return null;
}
