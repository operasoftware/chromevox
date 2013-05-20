// Copyright 2013 Google Inc.
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
 * @fileoverview Defines the initial speech call.
 */

goog.provide('cvox.InitialSpeech');

goog.require('cvox.AbstractTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.CursorSelection');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.LiveRegions');

// INJECTED_AFTER_LOAD is set true by ChromeVox itself or ChromeOS when this
// script is injected after page load (i.e. when manually enabling ChromeVox).
if (!window['INJECTED_AFTER_LOAD'])
  window['INJECTED_AFTER_LOAD'] = false;


/**
 * Initial speech when the page loads. This may happen only after we get
 * prefs back, so we can make sure ChromeVox is active.
 */
cvox.InitialSpeech.speak = function() {
  // Don't speak page title and other information if this script is not injected
  // at the time of page load. This global is set by Chrome OS.
  var disableSpeak = window['INJECTED_AFTER_LOAD'];

  if (!cvox.ChromeVox.isActive || document.webkitHidden) {
    disableSpeak = true;
  }

  // If we're the top-level frame, speak the title of the page +
  // the active element if it is a user control.
  if (window.top == window) {
    if (document.title && !disableSpeak) {
      cvox.ChromeVox.tts.speak(
          document.title, cvox.AbstractTts.QUEUE_MODE_FLUSH);
    }
  }

  // Initialize live regions and speak alerts.
  cvox.LiveRegions.init(
      new Date(), cvox.AbstractTts.QUEUE_MODE_QUEUE, disableSpeak);

  // If our activeElement is on body, try to sync to the first element. This
  // actually happens inside of NavigationManager.reset, which doesn't get
  // called until AbstractHost.onPageLoad, but we need to speak and braille the
  // initial node here.
  if (document.hasFocus() && document.activeElement == document.body) {
    cvox.ChromeVox.navigationManager.syncToBeginning();
  }

  // If we had a previous position recorded, update to it.
  if (cvox.ChromeVox.position[document.location.href]) {
    var pos = cvox.ChromeVox.position[document.location.href];
    cvox.ChromeVox.navigationManager.updateSelToArbitraryNode(
        document.elementFromPoint(pos.x, pos.y));
  }

  // If this iframe has focus, speak and braille the current focused element.
  if (document.hasFocus()) {
    if (!disableSpeak) {
      cvox.ChromeVoxEventSuspender.withSuspendedEvents(function() {
        cvox.ChromeVox.navigationManager.finishNavCommand(
            '', true, cvox.AbstractTts.QUEUE_MODE_QUEUE);
      })();
    }
  }
};
