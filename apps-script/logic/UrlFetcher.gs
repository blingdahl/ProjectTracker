var UrlFetcher = {};
UrlFetcher.initialized = false;

UrlFetcher.init = function() {
  if (UrlFetcher.initialized) {
    return;
  }
  
  UrlFetcher.initialized = true;
  
  Log.info('UrlFetcher.init()');
  
  UrlFetcher.removePrefix = function(url, prefixes) {
    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      if (url.startsWith(prefix)) {
        return url.substring(prefix.length);
      }
    }
    return null;
  }
  
  UrlFetcher.replacePrefix = function(url, replacementPrefix, prefixes) {
    var withoutPrefix = UrlFetcher.removePrefix(url, prefixes);
    if (withoutPrefix) {
      return replacementPrefix + withoutPrefix;
    }
    return null;
  }
  
  UrlFetcher.extractGoLinkName = function(url) {
    return UrlFetcher.replacePrefix(url, 'go/', ['go/', 'http://go/', 'https://goto.google.com/']);
  }
  
  UrlFetcher.extractBugLinkName = function(url) {
    var bugId = UrlFetcher.removePrefix(url, ['b/', 'http://b/', 'https://b.corp.google.com/issues/']);
    if (!bugId) {
      return null;
    }
    var bugShortLink = 'b/' + bugId;
    if (BuganizerApp) {
      var bug = BuganizerApp.getBug(bugId);
      if (bug) {
        return bugShortLink + ': ' + bug.getSummary();
      }
    }
    return bugShortLink;
  }
  
  UrlFetcher.getTitleForUrl = function(url) {
    var linkName = UrlFetcher.extractGoLinkName(url) || UrlFetcher.extractBugLinkName(url) || Docs.getName(url);
    if (linkName) {
      return linkName;
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
