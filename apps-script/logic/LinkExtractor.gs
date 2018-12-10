var LinkExtractor = {};

function PrefixMatcher(prefixes) {
  this.prefixes = prefixes;
}

PrefixMatcher.prototype.matches = function(s) {
  for (var i = 0; i < this.prefixes.length; i++) {
    if (s.startsWith(this.prefixes[i])) {
      return true;
    }
  }
}

LinkExtractor.PREFIX_MATCHER = new PrefixMatcher([
    'http://track.spe.schoolmessenger.com/',
    'https://www.fablevisionlearning.com/',
    'https://photos.app.goo.gl/RmuB7fzChAj1kDn86'
]);

LinkExtractor.extractBugId = function(subject) {
  var issueIndex = subject.indexOf('Issue ');
  if (issueIndex < 0) {
    return null;
  }
  var nextWordIndex = issueIndex + 'Issue '.length;
  var endOfNextWordIndex = subject.indexOf(':', nextWordIndex);
  if (endOfNextWordIndex < 0) {
    return null;
  }
  return subject.substring(nextWordIndex, endOfNextWordIndex);
}

LinkExtractor.extractUrls = function(content) {
  var urls = content.match(/https?:\/\/[^ )"><]+/g);
  if (!urls) {
    return [];
  }
  for (var i = 0; i < urls.length; i++) {
    if (urls[i].startsWith('https://www.google.com/url?hl=en&q=')) {
      urls[i] = urls[i].replace('https://www.google.com/url?hl=en&q=');
      var sourceIndex = urls[i].indexOf('&source=');
      if (sourceIndex >= 0) {
        urls[i] = urls[i].substring(0, sourceIndex);
      }
    }
  }
  return urls;
}

LinkExtractor.extractGoLinks = function(content) {
  var goLinks = content.match(/\Wgo\/[^ )"><]+/g);
  if (!goLinks) {
    return [];
  }
  for (var i = 0; i < goLinks.length; i++) {
    goLinks[i] = goLinks[i].replace(/[ <>"]/g, '');
  }
  return goLinks;
}

LinkExtractor.extractLinkFormula = function(thread) {
  var bugId = LinkExtractor.extractBugId(thread.getFirstMessageSubject());
  if (bugId) {
    return Spreadsheet.hyperlinkFormula('http://b/' + bugId, 'b/' + bugId);
  }
  var messages = thread.getMessages();
  if (messages.length === 0) {
    return null;
  }
  var urls = LinkExtractor.extractUrls(messages[0].getBody());
  if (!urls || urls.length === 0) {
    return null;
  }
  log(Log.Level.FINE, urls);
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    if (url.startsWith('https://docs.')) {
      if (url.includes('/document')) {
        return Spreadsheet.hyperlinkFormula(url, 'Doc')
      } else if (url.includes('/spreadsheet')) {
        return Spreadsheet.hyperlinkFormula(url, 'Sheet')
      } else {
        return Spreadsheet.hyperlinkFormula(url, 'Link')
      }
    } else if (url.startsWith('https://app.smartsheet.com/b/home')) {
      return Spreadsheet.hyperlinkFormula(url, 'Smartsheet');
    } else if (url.startsWith('http://go/')) {
      return Spreadsheet.hyperlinkFormula(url, url.replace('http://', ''));
    } else if (url.startsWith('https://goto.google.com/')) {
      return Spreadsheet.hyperlinkFormula(url, url.replace('https://goto.google.com/', 'go/'));
    } else if (LinkExtractor.PREFIX_MATCHER.matches(url)) {
      return Spreadsheet.hyperlinkFormula(url, 'Link');
    }
  }
  var goLinks = LinkExtractor.extractGoLinks(messages[0].getBody());
  if (goLinks.length > 0) {
    return Spreadsheet.hyperlinkFormula('http://' + goLinks[0], goLinks[0]);
  }
  return null;
}
