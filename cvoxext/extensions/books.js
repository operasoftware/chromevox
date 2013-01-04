// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Chromevox extension for Google Books.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

/**
  * booksvox object
  */
var booksvox = {};

/** @const constants for loading status */
booksvox.loadStatus = {
  REDIRECTED: 0,
  TEXT_UNAVAILABLE: 1,
  READING: 2
};

/** speakables */
booksvox.speakables = {
  paragraph: ['$self'],
  page: ['$paragraph<all>']
};

/** selectors */
booksvox.selectors = {
  paragraph: { query: '.gtxt_body'},
  page: {id: 'flow-top-div'},
  arrow: '.arrow'
};

/** options */
booksvox.options = {
  page: ['enableTraverse']
};

/** just read the page and do not do any extra work
 * @return {Object} done flag telling not to do any further processing.
 */
booksvox.preprocess = {

  /**
   * @param {Object} values tree.
   * @param {string} speakable name focused from.
   * @return {Object} done flag.
   */
  page: function(values, focusedFrom) {

    for (par in values.paragraph) {
      cvox.Api.speak(values.paragraph[par].self, 1);
    }
    var obj = {
      done: true
    };
    return obj;
  }
};

/** extenison options */
booksvox.extensionOptions = ['enableElementFineScroll'];


/** inject the request plain text parameter to the url
  * @return {boolean} return if the plain text page exists.
  */
booksvox.redirPlainText = function() {
  var loc = document.location;
  if (loc.pathname.indexOf('/books') == 0 &&
      loc.search.indexOf('&output=text') == -1) {
    window.location = loc.href.slice(0, loc.href.indexOf('#')) +
      '&output=text' + loc.hash;
    return booksvox.loadStatus.REDIRECTED;
  } else if (!document.querySelector(booksvox.selectors.paragraph.query) &&
        !booksvox.readSorry) {
      cvox.Api.speak('Sorry, there is no plain text version of this page.');
      booksvox.readSorry = true;
      return booksvox.loadStatus.TEXT_UNAVAILABLE;
  }

  return booksvox.loadStatus.READING;
};


/** add 'j' 'k' page traversal and reading
  * @this {booksvox}
  * @param {Event} evt keypress event.
  */
booksvox.keyboardControl = function(evt) {

  if (!document.activeElement.form) {
    //if char is j go next
    if (evt.charCode === 106) {
      window.location =
          document.querySelectorAll(
              booksvox.selectors.arrow)[1].querySelector('a').href;
    }
    //if char is k go back
    else if (evt.charCode === 107) {
      window.location =
          document.querySelectorAll(
              booksvox.selectors.arrow)[0].querySelector('a').href;
    }

  }
};

/** onLoad function for booksvox */
booksvox.load = function() {
  var loaded = booksvox.redirPlainText();

  if (loaded == booksvox.loadStatus.READING && !booksvox.loadedOnce) {
    cvoxExt.SpeakableManager.updateSpeak(document.getElementById(
        booksvox.selectors.page.id));

    TraverseManager.fineScrollNextKey = 'n';
    TraverseManager.fineScrollPrevKey = 'p';
    booksvox.loadedOnce = true;
  }
  if (loaded == booksvox.loadStatus.READING ||
      loaded == booksvox.loadStatus.TEXT_UNAVAILABLE &&
      !booksvox.addedKeyListener) {

    document.addEventListener('keypress', booksvox.keyboardControl, true);
    booksvox.addedKeyListener = true;
  }
};

/** init function to register onLoad */
booksvox.init = function() {
  document.addEventListener('load', booksvox.load, true);
};

cvoxExt.loadExtension(booksvox, booksvox.init);

