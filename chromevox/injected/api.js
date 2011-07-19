// Copyright 2011 Google Inc.
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
 * @fileoverview Public APIs to enable web applications to communicate
 * with ChromeVox.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

cvoxgoog.provide('cvox.Api');

cvoxgoog.require('cvox.ChromeVox');

/**
 * @constructor
 */
cvox.Api = function() {
};

/**
 * Speaks the given string using the specified queueMode and properties.
 *
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode Valid modes are 0 for flush; 1 for queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.Api.speak = function(textString, queueMode, properties) {
  cvox.ChromeVox.tts.speak(textString, queueMode, properties);
};

/**
 * Stops speech.
 */
cvox.Api.stop = function() {
  cvox.ChromeVox.tts.stop();
};

/**
 * Plays the specified earcon sound.
 *
 * @param {string} earcon An earcon name.
 * Valid names are:
 *   ALERT_MODAL
 *   ALERT_NONMODAL
 *   BULLET
 *   BUSY_PROGRESS_LOOP
 *   BUSY_WORKING_LOOP
 *   BUTTON
 *   CHECK_OFF
 *   CHECK_ON
 *   COLLAPSED
 *   EDITABLE_TEXT
 *   ELLIPSIS
 *   EXPANDED
 *   FONT_CHANGE
 *   INVALID_KEYPRESS
 *   LINK
 *   LISTBOX
 *   LIST_ITEM
 *   NEW_MAIL
 *   OBJECT_CLOSE
 *   OBJECT_DELETE
 *   OBJECT_DESELECT
 *   OBJECT_OPEN
 *   OBJECT_SELECT
 *   PARAGRAPH_BREAK
 *   SEARCH_HIT
 *   SEARCH_MISS
 *   SECTION
 *   TASK_SUCCESS
 *   WRAP
 *   WRAP_EDGE
 * This list may expand over time.
 */
cvox.Api.playEarcon = function(earcon) {
  cvox.ChromeVox.earcons.playEarconByName(earcon);
};

/**
 * Synchronizes ChromeVox's internal cursor to the targetNode.
 * Note that this will NOT trigger reading unless given the optional argument;
 * it is for setting the internal ChromeVox cursor so that when the user resumes
 * reading, they will be starting from a reasonable position.
 *
 * @param {Node} targetNode The node that ChromeVox should be synced to.
 * @param {boolean=} speakNode If true, speaks out the node.
 */
cvox.Api.syncToNode = function(targetNode, speakNode) {
  cvox.ChromeVox.navigationManager.syncToNode(targetNode);

  if (speakNode == undefined) {
    speakNode = false;
  }

  if (speakNode) {
    var currentDesc = cvox.ChromeVox.navigationManager.getCurrentDescription();
    var length = currentDesc.length;
    var queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;

    for (var i = 0; i < length; i++) {
      currentDesc[i].speak(queueMode);
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
  }
};
