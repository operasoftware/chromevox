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
 * @fileoverview Listeners for ChromeVox Extensions Framework
 * These are some listeners for focus and keypress detection.
 * @author: cagriy@google.com (Cagri Yildirim)
 */

/** subnamespace */
cvoxExt.Listeners = {};

var Listeners = cvoxExt.Listeners;

/** loads cvoxExt listeners and alisases */
cvoxExt.Listeners.registerListeners = function() {
  cvoxExt.Listeners.loadAliases();
  if (!cvoxExt.Listeners.dontCheckFocused) {
    document.addEventListener('focus',
        Listeners.checkIfSpeakableFocused, true);
  }
  document.addEventListener('keypress',
      cvoxExt.TraverseManager.keyHandler, true);
  document.addEventListener('ready',
      Listeners.focusFirstElementOnLoad, true);
  document.addEventListener('load',
      Listeners.updateOrderedSpeakablesOnLoad, true);

};

/** loads cvoxExt aliases for convenience */
cvoxExt.Listeners.loadAliases = function() {

  cvoxExt.updateOrderedSpeakables =
      cvoxExt.TraverseManager.updateOrderedSpeakables;
};

/** updates speak node description when an object is focused
 * no need to update current element of speakable because website
 * already has a mechanism to traverse between each element
 * @param {event} evt DOM event.
 */
Listeners.checkIfSpeakableFocused = function(evt) {
  if (!cvoxExt.TraverseManager.skipFocusCheckThisTime) {
    var target = evt.target;
    SpeakableManager.updateSpeak(target);

  }
  cvoxExt.TraverseManager.skipFocusCheckThisTime = false;
};

/** focus on the first page on load
*/
Listeners.focusFirstElementOnLoad = function() {
  TraverseManager.nextElement(0);
  TraverseManager.nextElementOfCurrSpeakable(0);
};

/** update speakables on load
*/
Listeners.updateOrderedSpeakablesOnLoad = function() {
  if (TraverseManager) {
    TraverseManager.updateOrderedSpeakables();
  }
};

/** disable auto-update speakable if focused on a DOM element*/
Listeners.disableCheckFocused = function() {
  cvoxExt.Listeners.dontCheckFocused = true;
};
