var UrlFetcher = {};
UrlFetcher.initialized = false;

UrlFetcher.init = function() {
  if (UrlFetcher.initialized) {
    return;
  }
  
  UrlFetcher.initialized = true;
  
  Log.info('UrlFetcher.init()');
  
  UrlFetcher.extractGoLinkName = function(url) {
    if (url.startsWith('go/')) {
      return url;
    }
    if (url.startsWith('http://go/')) {
      return url.substring('http://'.length);
    }
    // TODO(lindahl) Generalize
    if (url.startsWith('https://goto.google.com/')) {
      return 'go/' + url.substring('https://goto.google.com/'.length);
    }
    return null;
  }
  
  UrlFetcher.getTitleForUrl = function(url) {
    var goLinkName = UrlFetcher.extractGoLinkName(url);
    if (goLinkName) {
      return goLinkName;
    }
    var docName = Docs.getName(url);
    if (docName) {
      return docName;
    }
    try {
      var content = UrlFetchApp.fetch(url).getContentText();
      var xmldoc = Xml.parse(content, true);
      return xmldoc.html.head.getElements("title")[0].getText().replace(/\s+/g, ' ');
    } catch (e) {
      Log.warning(e);
      return 'Link';
    }
  }
}
