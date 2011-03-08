// Copyright 2010 Google Inc.
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
 * @fileoverview Earcons library that uses the HTML5 Audio element to play back
 * auditory cues.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ChromeVoxEarcons');

goog.require('cvox.AbstractEarcons');

/**
 * @constructor
 * @extends {cvox.AbstractEarcons}
 */
cvox.ChromeVoxEarcons = function() {
  //Inherit AbstractEarcons
  cvox.AbstractEarcons.call(this);

  this.audioMap = new Object();
};
goog.inherits(cvox.ChromeVoxEarcons, cvox.AbstractEarcons);

/**
 * @return {string} The human-readable name of the earcon set.
 */
cvox.ChromeVoxEarcons.prototype.getName = function() {
  return 'ChromeVox earcons';
};

/**
 * @return {string} The base URL for loading earcons.
 */
cvox.ChromeVoxEarcons.prototype.getBaseUrl = function() {
  return cvox.ChromeVoxEarcons.BASE_URL;
};

/**
 * Plays the specified earcon sound.
 * @param {number} earcon The earcon index.
 */
cvox.ChromeVoxEarcons.prototype.playEarcon = function(earcon) {
  cvox.ChromeVoxEarcons.superClass_.playEarcon.call(this, earcon);
  this.currentAudio = this.audioMap[earcon];
  if (!this.currentAudio) {
    var earconMap = this.getEarconMap();
    if (!earconMap || !earconMap[earcon]) {
      return;
    }
    this.currentAudio = new Audio(this.getBaseUrl() + earconMap[earcon]);
    this.audioMap[earcon] = this.currentAudio;
  }
  try {
    this.currentAudio.currentTime = 0;
  } catch (e) {
  }
  if (this.currentAudio.paused) {
    this.currentAudio.play();
  }
};

/**
 * @return {Object} The earcon map which is lazy initialized.
 */
cvox.ChromeVoxEarcons.prototype.getEarconMap = function() {
  if (this.earconMap) {
    return this.earconMap;
  }
  this.earconMap = new Object();
  this.earconMap[cvox.AbstractEarcons.ALERT_MODAL] = 'alert_modal.ogg';
  this.earconMap[cvox.AbstractEarcons.ALERT_NONMODAL] =
      'alert_nonmodal.ogg';
  this.earconMap[cvox.AbstractEarcons.BULLET] = 'bullet.ogg';
  this.earconMap[cvox.AbstractEarcons.BUSY_PROGRESS_LOOP] =
      'busy_progress_loop.ogg';
  this.earconMap[cvox.AbstractEarcons.BUSY_WORKING_LOOP] =
      'busy_working_loop.ogg';
  this.earconMap[cvox.AbstractEarcons.BUTTON] = 'button.ogg';
  this.earconMap[cvox.AbstractEarcons.CHECK_OFF] = 'check_off.ogg';
  this.earconMap[cvox.AbstractEarcons.CHECK_ON] = 'check_on.ogg';
  this.earconMap[cvox.AbstractEarcons.COLLAPSED] = 'collapsed.ogg';
  this.earconMap[cvox.AbstractEarcons.EDITABLE_TEXT] = 'editable_text.ogg';
  this.earconMap[cvox.AbstractEarcons.ELLIPSIS] = 'ellipsis.ogg';
  this.earconMap[cvox.AbstractEarcons.EXPANDED] = 'expanded.ogg';
  this.earconMap[cvox.AbstractEarcons.FONT_CHANGE] = 'font_change.ogg';
  this.earconMap[cvox.AbstractEarcons.INVALID_KEYPRESS] =
      'invalid_keypress.ogg';
  this.earconMap[cvox.AbstractEarcons.LINK] = 'link.ogg';
  this.earconMap[cvox.AbstractEarcons.LISTBOX] = 'listbox.ogg';
  this.earconMap[cvox.AbstractEarcons.NEW_MAIL] = 'new_mail.ogg';
  this.earconMap[cvox.AbstractEarcons.OBJECT_CLOSE] = 'object_close.ogg';
  this.earconMap[cvox.AbstractEarcons.OBJECT_DELETE] = 'object_delete.ogg';
  this.earconMap[cvox.AbstractEarcons.OBJECT_DESELECT] =
      'object_deselect.ogg';
  this.earconMap[cvox.AbstractEarcons.OBJECT_OPEN] = 'object_open.ogg';
  this.earconMap[cvox.AbstractEarcons.OBJECT_SELECT] = 'object_select.ogg';
  this.earconMap[cvox.AbstractEarcons.PARAGRAPH_BREAK] =
      'paragraph_break.ogg';
  this.earconMap[cvox.AbstractEarcons.SEARCH_HIT] = 'search_hit.ogg';
  this.earconMap[cvox.AbstractEarcons.SEARCH_MISS] = 'search_miss.ogg';
  this.earconMap[cvox.AbstractEarcons.SECTION] = 'section.ogg';
  this.earconMap[cvox.AbstractEarcons.TASK_SUCCESS] = 'task_success.ogg';
  this.earconMap[cvox.AbstractEarcons.WRAP] = 'wrap.ogg';
  this.earconMap[cvox.AbstractEarcons.WRAP_EDGE] = 'wrap_edge.ogg';

  return this.earconMap;
};

/**
 * The base URL for  loading eracons.
 * @type {string}
 */
cvox.ChromeVoxEarcons.BASE_URL = 'earcons/';
