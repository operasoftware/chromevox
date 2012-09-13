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
 * @fileoverview Chromevox extension for Google News.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

/**
 * newsvox object
 */
var newsvox = {};

/** newsvox extension */
newsvox.speakers = {

  focusedTopStory: {
    formatter: ['$title<0> by $source $snippet .' +
    'Related news: $title<1> $title<2>'],
    selector: {query: '.blended-wrapper-first.esc-wrapper.focused-story'}
  },
  focusedStories: {
    selector: {query: '.focused-story'},
    formatter: ['$title by $source $snippet']
  },
  title: {
    selector: {query: '.esc-lead-article-title-wrapper'}
  },
  source: {
    selector: {query: '.esc-lead-article-source-wrapper'}
  },
  snippet: {
    selector: {query: '.esc-lead-snippet-wrapper'}
  },
  topStories: {
    selector: {query: '.persistentblue'}
  }
};

/** @const scroll Handler
 *  @param {Array<Mutation>} mutations the DOM mutations to check for.
 */
newsvox.scrollHandler = function(mutations) {

  //if any of div elements have the focused-story class name then focus on that
  //element
  var focusedStory = cvoxExt.Util.getVisibleDomObjectsFromSelector(
      {query: '.focused-story'})[0];

  if (focusedStory && (focusedStory != newsvox.focusedStory)) {

    SpeakableManager.updateSpeak(focusedStory);

    focusedStory.setAttribute('tabindex', 0);
    focusedStory.focus();

    newsvox.focusedStory = focusedStory;
  }

};

/** read focused message */
newsvox.readArticle = function() {
  var message = speakableManager.focusedElement;
  cvox.Api.click(message);
};

/** register the DOM mutation observer to news table div after checking if it
is loaded */
newsvox.registerObserver = function() {
  var newsDiv = document.getElementsByClassName('lt-col')[0];

  if (!newsDiv) {
    setTimeout(newsvox.registerObserver, 50);
    return;
  }
  var observer = new WebKitMutationObserver(newsvox.scrollHandler);
  observer.observe(newsDiv, {childList: true, subtree: true,
      attributes: true });

};

cvoxExt.loadExtension(newsvox.speakers, newsvox.registerObserver);

