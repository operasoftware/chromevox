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
 * @fileoverview Chromevox extension for Google+.
 *
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

var plusvox = new cvoxExt.extension();

/**
 * CSS selectors for each speakable object.
 * Read in the order of declaration
 * @const
 */
plusvox.GPLUS_POST_DOM_SELECTORS = {
  author: {selector: '.cK'},
  time: {selector: '.Ri.lu'},
  sharingDetails: {selector: '.a-n.ej.Ku.pl'},
  content: {selector: '.wm.VC'},
  shareLinkTitle: {selector: '.a-n.ot-anchor.YF'},
  shareLinkDetails: {selector: '.pg.XF'},
  sharerComment: {selector: '.sE.nv'},
  taggedBy: {selector: '.Sg.Ob'},
  hungout: {selector: '.Vo'},
  hungoutwith: {selector: '.Hs'},
  pictureCaption: {selector: '.pc'},
  commentCount: {selector: '.gh.Ni'},
  comments: {selector: '.Oi'},
  plusCount: {selector: '.G8.ol.a-f-e.le'}
};

/**
  * @const comment selectors
  */
plusvox.GPLUS_COMMENT_DOM_SELECTORS = {
  author: {selector: '.Sg.Ob.qm'},
  time: {selector: '.Bf'},
  content: {selector: '.Mi'},
  plusCount: {selector: '.L7.ol.a-f-e.Uh'}
};

/**
  * @const thread class name
  */
plusvox.GPLUS_THREAD_SELECTOR = '.Tg.Sb';

/**
  * @const comment class name
  */
plusvox.GPLUS_COMMENT_SELECTOR = '.Ho.gx';

/** init function, adds speakables*/
plusvox.init = function() {

  var gPlusThread = new cvoxExt.speakable(
    plusvox.GPLUS_THREAD_SELECTOR,
    plusvox.GPLUS_POST_DOM_SELECTORS,
    'thread',
    false);
  cvoxExt.speakableManager.addNoTraverseSpeakable(gPlusThread);

  var gPlusComment = new cvoxExt.speakable(
    plusvox.GPLUS_COMMENT_SELECTOR,
    plusvox.GPLUS_COMMENT_DOM_SELECTORS,
    'comment',
    false);
  cvoxExt.speakableManager.addNoTraverseSpeakable(gPlusComment);
};

cvoxExt.loadExtension(plusvox);
