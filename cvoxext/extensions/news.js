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
var newsvox = new cvoxExt.extension();

/** @const unread messages selector */
newsvox.ARTICLE_SELECTOR = '.focused-story';

/** @const focused story selector */
newsvox.FOCUSED_STORY_SELECTOR = '.focused-story';

/** @const messages subselector */
newsvox.ARTICLE_SUBSELECTOR = {
  title: {
    selector: '.titletext',
    type: 'content'
  },
  source: {
    selector: '.esc-lead-article-source',
    type: 'content'
  },
  time: {
    selector: '.esc-lead-article-timestamp',
    type: 'userValue'
  },
  snippet: {
    selector: 'esc-lead-snippet-wrapper',
    type: 'content'
  }
};

/** @const top stories selector */
newsvox.TOP_STORIES_SELECTOR = '.topic';

/** @const top stories subselector */
newsvox.TOP_STORIES_SUBSELECTOR = {
  selector: '.persistentblue',
  type: 'content'
};

/** news row speakable object */
newsvox.newsRowSpeakable = new cvoxExt.speakable(
  newsvox.ARTICLE_SELECTOR,
  newsvox.ARTICLE_SUBSELECTOR,
  'articleRow',
  '');

/** top stories speakable object */
newsvox.topStoriesSpeakable = new cvoxExt.speakable(
  newsvox.TOP_STORIES_SELECTOR,
  newsvox.TOP_STORIES_SUBSELECTOR,
  'topStories',
  '');

/** @const side menu selector */
newsvox.SIDE_MENU_SELECTOR = '.nav-items';

/** @const side menu subselector */
newsvox.SIDE_MENU_SUBSELECTOR = {
  topStories: {
    pretext: 'Top Stories',
    speakables: [newsvox.topStoriesSpeakable]
  }
};

/** @const scroll Handler */
newsvox.scrollHandler = function() {
  console.log('mod');
  var focusedStory = cvoxExt.util.getFirstDomObjectFromSelector(
      newsvox.FOCUSED_STORY_SELECTOR);
  if (focusedStory && focusedStory != newsvox.focusedStory) {
    cvox.Api.stop();
    newsvox.focusedStory = focusedStory;
    cvox.Api.setSpeechForNode(focusedStory,
        newsvox.newsRowSpeakable.generateSpeechNode(focusedStory));
    focusedStory.setAttribute('tabindex', -1);
    focusedStory.focus();
  }
  setTimeout(newsvox.scrollHandler, 500);
  //TODO Find a better way of detecting change
};

/** read focused message */
newsvox.readArticle = function() {
  var message = speakableManager.focusedElement;
  cvox.Api.click(message);
};

/** init function
 *  @this{newsvox}
 */
newsvox.init = function() {
  cvoxExt.speakableManager.elementNextKey = null;
  cvoxExt.speakableManager.elementPrevKey = null;

  cvoxExt.speakableManager.speakableNextKey = null;
  cvoxExt.speakableManager.speakablePrevKey = null;

  cvoxExt.readFocus = true;

  var sidemenuSpeakable = new cvoxExt.speakable(newsvox.SIDE_MENU_SELECTOR,
                                                newsvox.SIDE_MENU_SUBSELECTOR,
                                               'sideMenu',
                                               '');
  cvoxExt.speakableManager.addNoTraverseSpeakable(newsvox.newsRowSpeakable);
  cvoxExt.addSpeakable(sidemenuSpeakable);
  cvoxExt.addSpeakableKeyListener(
      newsvox.newsRowSpeakable, 'r', this.readArticle);


  cvoxExt.speakableManager.updateSpeakables();
  cvoxExt.speakableManager.nextSpeakable(0);
  cvoxExt.speakableManager.nextElementOfCurrSpeakable(0);
};

cvoxExt.loadExtension(newsvox);
newsvox.scrollHandler();
