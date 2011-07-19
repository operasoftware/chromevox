cvoxgoog.provide('cvox.ChromeVoxBookmarksManager');

cvoxgoog.require('cvox.ChromeVoxEarcons');

/**
 * @constructor
 */
cvox.ChromeVoxBookmarksManager = function() {};

/**
 * Handle to the TTS.
 * @type {Object}
 */
cvox.ChromeVoxBookmarksManager.tts;

/**
 * Handle to the Earcons.
 * @type {Object}
 */
cvox.ChromeVoxBookmarksManager.earcons;

/**
 * Bookmarknode to delete.
 * @type {Node}
 */
cvox.ChromeVoxBookmarksManager.bookmarkNodeToDelete = '';
cvox.ChromeVoxBookmarksManager.idCounter = 0;
cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_ = '{display: none;}';
cvox.ChromeVoxBookmarksManager.mode = 0; // 0 for edit, 1 for search
cvox.ChromeVoxBookmarksManager.currentSearchString = '';
cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = -1;
cvox.ChromeVoxBookmarksManager.EXPANDED_UNICODE_GRAPHIC = '&#9660; ';
cvox.ChromeVoxBookmarksManager.COLLAPSED_UNICODE_GRAPHIC = '&#9654; ';

cvox.ChromeVoxBookmarksManager.treeBrowser = function(bmTreeNodeArray) {
  var htmlStr = '';
  for (var i = 0, node; node = bmTreeNodeArray[i]; i++) {
    htmlStr = htmlStr +
              cvox.ChromeVoxBookmarksManager.treeNodeToHtml(node, 0, '') +
              '<br>';
  }
  document.getElementById('bookmarks').innerHTML = htmlStr;
};

cvox.ChromeVoxBookmarksManager.treeNodeToHtml = function(
    bmTreeNode, level, classString) {
  if (bmTreeNode.url) {
    return "<li class='" + classString + "'> <a id='bmNodeID_" +
           bmTreeNode.id + "' href='" + bmTreeNode.url +
           "' onKeyDown='cvox.ChromeVoxBookmarksManager." +
           "itemKeyDownHandler(evt)' " +
           "class='bookmark link'>" + bmTreeNode.title + '</a></li>';
  } else {
    if (level > 6) {
      level = 6;
    }
    var branchId = cvox.ChromeVoxBookmarksManager.idCounter;
    cvox.ChromeVoxBookmarksManager.idCounter++;
    var htmlStr = '';
    if (level > 0) {
      var ruleStr = 'li.class_' + branchId +
          cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_;
      document.styleSheets[0].insertRule(ruleStr, 0);
      ruleStr = 'h2.class_' + branchId +
          cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_;
      document.styleSheets[0].insertRule(ruleStr, 0);
      ruleStr = 'h3.class_' + branchId +
          cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_;
      document.styleSheets[0].insertRule(ruleStr, 0);
      ruleStr = 'h4.class_' + branchId +
          cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_;
      document.styleSheets[0].insertRule(ruleStr, 0);
      ruleStr = 'h5.class_' + branchId +
          cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_;
      document.styleSheets[0].insertRule(ruleStr, 0);
      ruleStr = 'h6.class_' + branchId +
          cvox.ChromeVoxBookmarksManager.HIDDENSTYLE_;
      document.styleSheets[0].insertRule(ruleStr, 0);
      htmlStr =
          "<ul id='" + branchId + "'><h" + level + " id='bmNodeID_" +
          bmTreeNode.id + "' tabIndex='0' " +
          "onClick='cvox.ChromeVoxBookmarksManager." +
          "bmItemExpandCollapseToggle(" + branchId +
          ")' onKeyDown='cvox.ChromeVoxBookmarksManager." +
          "itemKeyDownHandler(evt)' " +
          "class='bookmark folder " + classString +
          "'><span id='indicatorSpan_" + branchId + "'>" +
          cvox.ChromeVoxBookmarksManager.COLLAPSED_UNICODE_GRAPHIC +
            '</span>' + bmTreeNode.title + '</h' + level + '>';
    }
    var childNodes = bmTreeNode.children;
    for (var i = 0, childNode; childNode = childNodes[i]; i++) {
      htmlStr = htmlStr + cvox.ChromeVoxBookmarksManager.treeNodeToHtml(
          childNode, level + 1, ' class_' + branchId + ' ' + classString);
    }
    if (level > 0) {
      htmlStr = htmlStr + '</ul>';
    }
    return htmlStr;
  }
};

cvox.ChromeVoxBookmarksManager.deleteBookmarkNode = function(bmNodeId) {
  var bookmarkName = document.getElementById(bmNodeId).textContent;
  var targetHtmlNode = document.getElementById(bmNodeId).parentNode;
  targetHtmlNode.parentNode.removeChild(targetHtmlNode);
  var internalId = bmNodeId.substring(9);
  chrome.bookmarks.remove(internalId, null);
  chrome.bookmarks.removeTree(internalId, null);
  cvox.ChromeVoxBookmarksManager.tts.speak('Deleted ' + bookmarkName, 0,
      null);
};


cvox.ChromeVoxBookmarksManager.itemKeyDownHandler = function(evt) {
  if (evt.keyCode == 13) { // Enter
    if (evt.target.tagName == 'A') {
      // Do nothing, this is a link, default behavior is fine.
    } else {
      if (cvox.ChromeVoxBookmarksManager.isCollapsed(
          evt.target.parentNode.id)) {
        cvox.ChromeVoxBookmarksManager.itemExpand(
            evt.target.parentNode.id);
      } else {
        cvox.ChromeVoxBookmarksManager.itemCollapse(
            evt.target.parentNode.id);
      }
      evt.target.blur();
      evt.target.focus();
    }
    return false;
  }
  // Ignore all keys on the individual items when searching
  // except for navigation keys
  if (cvox.ChromeVoxBookmarksManager.mode == 1) {
    if ((evt.keyCode == 38) || (evt.keyCode == 40)) {
      return true;
    }
    return false;
  }
  return true;
};

cvox.ChromeVoxBookmarksManager.globalKeyDownHandler = function(evt) {
  if (cvox.ChromeVoxBookmarksManager.bookmarkNodeToDelete !== '') {
    if (evt.keyCode == 46) { // DEL
      cvox.ChromeVoxBookmarksManager.deleteBookmarkNode(
          cvox.ChromeVoxBookmarksManager.bookmarkNodeToDelete);
      cvox.ChromeVoxBookmarksManager.bookmarkNodeToDelete = '';
      return false;
    }
    cvox.ChromeVoxBookmarksManager.bookmarkNodeToDelete = '';
  }
  /* Things to do in all modes */
  if (evt.keyCode == 27) { // ESC
    cvox.ChromeVoxBookmarksManager.toggleModes();
    return false;
  }
  if (evt.keyCode == 38) { // UP Arrow
    cvox.ChromeVoxBookmarksManager.prevBookmark();
    return false;
  }
  if (evt.keyCode == 40) { // DOWN Arrow
    cvox.ChromeVoxBookmarksManager.nextBookmark();
    return false;
  }
  if (evt.keyCode == 39) { // RIGHT Arrow
    if (evt.target.tagName == 'A') {
      document.location = evt.target.href;
    } else {
      cvox.ChromeVoxBookmarksManager.itemExpand(evt.target.parentNode.id);
      evt.target.blur();
      evt.target.focus();
    }
    return false;
  }
  if (cvox.ChromeVoxBookmarksManager.mode == 1) {
    return true;
  }
  /* Things to do in Browse mode but NOT in Search mode */
  if (evt.keyCode == 37) { // LEFT Arrow
    if (evt.target.tagName == 'A') {
      cvox.ChromeVoxBookmarksManager.itemCollapse(
          evt.target.parentNode.parentNode.id);
      evt.target.parentNode.parentNode.firstElementChild.blur();
      evt.target.parentNode.parentNode.firstElementChild.focus();
    } else {
      cvox.ChromeVoxBookmarksManager.itemCollapse(
          evt.target.parentNode.id);
      evt.target.blur();
      evt.target.focus();
    }
    return false;
  }
  if (evt.keyCode == 187) { // =
    cvox.ChromeVoxBookmarksManager.expandAll();
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.EXPANDED);
    return false;
  }
  if (evt.keyCode == 189) { // -
    cvox.ChromeVoxBookmarksManager.collapseAll();
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.COLLAPSED);
    return false;
  }
  if (evt.keyCode == 46) { // DEL
    if (evt.target.id && (evt.target.id.indexOf('bmNodeID_') === 0)) {
      cvox.ChromeVoxBookmarksManager.bookmarkNodeToDelete = evt.target.id;
      cvox.ChromeVoxBookmarksManager.tts.speak(
          'You are about to delete ' + evt.target.textContent +
          '\n \n Press delete again to confirm.', 0, null);
      return false;
    }
  }
  return true;
};

cvox.ChromeVoxBookmarksManager.globalKeyPressHandler = function(evt) {
  if (cvox.ChromeVoxBookmarksManager.mode == 1) {
    cvox.ChromeVoxBookmarksManager.updateSearch(evt.charCode);
    return false;
  }
  return true;
};

cvox.ChromeVoxBookmarksManager.globalKeyUpHandler = function(evt) {
  if (cvox.ChromeVoxBookmarksManager.mode == 1) {
    if (evt.keyCode == 8) { // Backspace
      if (cvox.ChromeVoxBookmarksManager.currentSearchString.length > 1) {
        cvox.ChromeVoxBookmarksManager.currentSearchString =
          cvox.ChromeVoxBookmarksManager.currentSearchString.substring(0,
            cvox.ChromeVoxBookmarksManager.currentSearchString.length - 1);
      } else {
        cvox.ChromeVoxBookmarksManager.currentSearchString = '';
      }
      cvox.ChromeVoxBookmarksManager.updateSearch(null);
    }
    return false;
  }
  return true;
};

cvox.ChromeVoxBookmarksManager.itemExpand = function(id) {
  var cssRules = document.styleSheets[0].cssRules;
  for (var i = 0, rule; rule = cssRules[i]; i++) {
    if (rule.cssText.indexOf('class_' + id) != -1) {
      rule.style.setProperty('display', '');
    }
  }
  document.getElementById('indicatorSpan_' + id).innerHTML =
      cvox.ChromeVoxBookmarksManager.EXPANDED_UNICODE_GRAPHIC;
};

cvox.ChromeVoxBookmarksManager.itemCollapse = function(id) {
  var cssRules = document.styleSheets[0].cssRules;
  for (var i = 0, rule; rule = cssRules[i]; i++) {
    if (rule.cssText.indexOf('class_' + id) != -1) {
      rule.style.setProperty('display', 'none');
    }
  }
  document.getElementById('indicatorSpan_' + id).innerHTML =
      cvox.ChromeVoxBookmarksManager.COLLAPSED_UNICODE_GRAPHIC;
};

cvox.ChromeVoxBookmarksManager.expandAll = function() {
  var cssRules = document.styleSheets[0].cssRules;
  for (var i = 0, rule; rule = cssRules[i]; i++) {
    if (rule.style.getPropertyValue('display') == 'none') {
      rule.style.setProperty('display', '');
    }
  }
  var spans = document.getElementsByTagName('span');
  for (var i = 0, span; span = spans[i]; i++) {
    span.innerHTML =
        cvox.ChromeVoxBookmarksManager.EXPANDED_UNICODE_GRAPHIC;
  }
};

cvox.ChromeVoxBookmarksManager.collapseAll = function() {
  var cssRules = document.styleSheets[0].cssRules;
  for (var i = 0, rule; rule = cssRules[i]; i++) {
    rule.style.setProperty('display', 'none');
  }
  var spans = document.getElementsByTagName('span');
  for (var i = 0, span; span = spans[i]; i++) {
    span.innerHTML =
        cvox.ChromeVoxBookmarksManager.COLLAPSED_UNICODE_GRAPHIC;
  }
};

cvox.ChromeVoxBookmarksManager.isCollapsed = function(id) {
  var cssRules = document.styleSheets[0].cssRules;
  for (var i = 0, rule; rule = cssRules[i]; i++) {
    if (rule.cssText.indexOf('class_' + id) != -1) {
      if (rule.style.getPropertyValue('display') == 'none') {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
};

cvox.ChromeVoxBookmarksManager.toggleModes = function() {
  if (cvox.ChromeVoxBookmarksManager.mode == 1) {
    document.getElementById('bookmarks').style.setProperty('display', '');
    document.getElementById('search').style.setProperty('display', 'none');
    cvox.ChromeVoxBookmarksManager.mode = 0;
    cvox.ChromeVoxBookmarksManager.currentSearchString = '';
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = -1;
    cvox.ChromeVoxBookmarksManager.tts.speak('Browse mode', 0, null);
  } else {
    document.getElementById('bookmarks').style.setProperty('display', 'none');
    document.getElementById('search').style.setProperty('display', '');
    cvox.ChromeVoxBookmarksManager.mode = 1;
    cvox.ChromeVoxBookmarksManager.currentSearchString = '';
    cvox.ChromeVoxBookmarksManager.tts.speak('Search mode', 0, null);
  }
};



cvox.ChromeVoxBookmarksManager.displaySearchResults = function(
    bmTreeNodeArray) {
  var htmlStr = '';
  for (var i = 0, node; node = bmTreeNodeArray[i]; i++) {
    htmlStr = htmlStr +
      cvox.ChromeVoxBookmarksManager.treeNodeToHtml(node, 0, '') + '<br>';
  }
  document.getElementById('search_results').innerHTML = htmlStr;
  var linksArray =
      document.getElementById('search_results').getElementsByTagName('a');
  if (linksArray.length > 0) {
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = 0;
    linksArray[0].focus();
  } else {
    cvox.ChromeVoxBookmarksManager.tts.speak('No matches found', 0, null);
  }
};


cvox.ChromeVoxBookmarksManager.updateSearch = function(charCode) {
  if (charCode !== null) {
    cvox.ChromeVoxBookmarksManager.currentSearchString =
        cvox.ChromeVoxBookmarksManager.currentSearchString +
            String.fromCharCode(charCode);
  }
  chrome.bookmarks.search(
    cvox.ChromeVoxBookmarksManager.currentSearchString,
    cvox.ChromeVoxBookmarksManager.displaySearchResults);
  document.getElementById('search_message').innerHTML = 'Search results for: ' +
      cvox.ChromeVoxBookmarksManager.currentSearchString;
};

cvox.ChromeVoxBookmarksManager.nextBookmark = function() {
  cvox.ChromeVoxBookmarksManager.currentBookmarkIndex++;
  var bookmarks = document.getElementsByClassName('bookmark');
  if (cvox.ChromeVoxBookmarksManager.currentBookmarkIndex >
      bookmarks.length - 1) {
    // Reached the end of the bookmarks list, time to loop around
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = -1;
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.WRAP);
    return;
  }
  var node =
      bookmarks[cvox.ChromeVoxBookmarksManager.currentBookmarkIndex];
  while ((cvox.ChromeVoxBookmarksManager.currentBookmarkIndex <
         bookmarks.length) &&
         cvox.ChromeVoxBookmarksManager.isInvisible(node)) {
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex++;
    var node =
        bookmarks[cvox.ChromeVoxBookmarksManager.currentBookmarkIndex];
    if (!node) {
      break;
    }
  }
  if (cvox.ChromeVoxBookmarksManager.currentBookmarkIndex >
      bookmarks.length - 1) {
    // There were still bookmarks, but they were hidden; time to loop around.
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = -1;
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.WRAP);
    return;
  }

  bookmarks[cvox.ChromeVoxBookmarksManager.currentBookmarkIndex].focus();
};



cvox.ChromeVoxBookmarksManager.prevBookmark = function() {
  cvox.ChromeVoxBookmarksManager.currentBookmarkIndex--;
  var bookmarks = document.getElementsByClassName('bookmark');
  if (cvox.ChromeVoxBookmarksManager.currentBookmarkIndex < 0) {
    // Reached the end of the bookmarks list, time to loop around
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = bookmarks.length;
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.WRAP);
    return;
  }
  var node =
      bookmarks[cvox.ChromeVoxBookmarksManager.currentBookmarkIndex];
  while ((cvox.ChromeVoxBookmarksManager.currentBookmarkIndex > -1) &&
         cvox.ChromeVoxBookmarksManager.isInvisible(node)) {
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex--;
    node = bookmarks[cvox.ChromeVoxBookmarksManager.currentBookmarkIndex];
    if (!node) {
      break;
    }
  }
  if (cvox.ChromeVoxBookmarksManager.currentBookmarkIndex < 0) {
    // There were still bookmarks, but they were hidden; time to loop around.
    cvox.ChromeVoxBookmarksManager.currentBookmarkIndex = bookmarks.length;
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.WRAP);
    return;
  }

  bookmarks[cvox.ChromeVoxBookmarksManager.currentBookmarkIndex].focus();
};

// Function to determine if a node is being made invisible by having
// display set to none.
// Note that using getComputedStyle by itself does not work as it
// is unreliable in Webkit. It may return that a child is being
// displayed when its parent is display:none.
cvox.ChromeVoxBookmarksManager.isInvisible = function(node) {
  var computedStyle = window.getComputedStyle(node, null);
  if (computedStyle === null) {
    return false;
  }
  while (computedStyle.getPropertyValue('display') != 'none') {
    node = node.parentNode;
    if (!node) {
      return false;
    }
    computedStyle = window.getComputedStyle(node, null);
    if (computedStyle === null) {
      return false;
    }
  }
  return true;
};


cvox.ChromeVoxBookmarksManager.speakerFocusHandler = function(evt) {
  var target = evt.target;
  if (target.tagName != 'A') {
    if (target.parentNode &&
        cvox.ChromeVoxBookmarksManager.isCollapsed(target.parentNode.id)) {
      cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
          ChromeVoxEarcons.COLLAPSED);
    } else {
      cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
          ChromeVoxEarcons.EXPANDED);
    }
  } else {
    cvox.ChromeVoxBookmarksManager.earcons.playEarcon(
        ChromeVoxEarcons.LINK);
  }
  cvox.ChromeVoxBookmarksManager.tts.speak(target.textContent, 0, null);
};

cvox.ChromeVoxBookmarksManager.speakerKeyDownHandler = function(evt) {
  if (evt.ctrlKey) {
    cvox.ChromeVoxBookmarksManager.tts.stop();
    return true;
  }
};


cvox.ChromeVoxBookmarksManager.speakerInit = function() {
  cvox.ChromeVoxBookmarksManager.tts = new cvox.ChromeVoxTtsBridge();
  cvox.ChromeVoxBookmarksManager.earcons =
      new cvox.ChromeVoxEarcons();
  document.addEventListener(
      'focus', cvox.ChromeVoxBookmarksManager.speakerFocusHandler, true);
  document.addEventListener('keydown',
      cvox.ChromeVoxBookmarksManager.speakerKeyDownHandler, true);
};


chrome.bookmarks.getTree(cvox.ChromeVoxBookmarksManager.treeBrowser);

document.body.addEventListener(
    'keydown', cvox.ChromeVoxBookmarksManager.globalKeyDownHandler, false);
document.body.addEventListener('keypress',
     cvox.ChromeVoxBookmarksManager.globalKeyPressHandler, false);
document.body.addEventListener(
    'keyup', cvox.ChromeVoxBookmarksManager.globalKeyUpHandler, false);

window.setTimeout(cvox.ChromeVoxBookmarksManager.speakerInit, 1000);
