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
 * @fileoverview Android-specific implementation of methods that differ
 * depending on the host platform.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.AndroidHost');

goog.require('cvox.AbstractHost');
goog.require('cvox.AndroidKeyMap');
goog.require('cvox.AndroidMathMap');
goog.require('cvox.AndroidVox');
goog.require('cvox.Api');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.HostFactory');
goog.require('cvox.InitialSpeech');



/**
 * @constructor
 * @extends {cvox.AbstractHost}
 */
cvox.AndroidHost = function() {
  goog.base(this);
};
goog.inherits(cvox.AndroidHost, cvox.AbstractHost);

cvox.AndroidHost.prototype.init = function() {
  cvox.ChromeVox.version = 'AndroidVox';
  var keyBindings = cvox.AndroidKeyMap.getStringifiedKeyMap();
  cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable(keyBindings);

  // There are no site specific scripts on Android.
  cvox.ApiImplementation.siteSpecificScriptLoader = '';
  cvox.ApiImplementation.siteSpecificScriptBase = '';
  cvox.ApiImplementation.init();

  // Default to brief mode on mobile if earcons are available.
  // TODO (clchen): Make this configurable once there is infrastructure in place
  // to support prefs.
  if (cvox.ChromeVox.earcons.earconsAvailable()) {
    cvox.ChromeVox.verbosity = cvox.VERBOSITY_BRIEF;
  }

  /**
   * A math mapping for Android devices.
   * @type {cvox.AndroidMathMap}
   */
  this.mathMap = new cvox.AndroidMathMap();

  cvox.InitialSpeech.speak();
};

cvox.AndroidHost.prototype.reinit = function() {
};

cvox.AndroidHost.prototype.onPageLoad = function() {
  // Enable touch exploration
  cvox.ChromeVoxEventWatcher.focusFollowsMouse = true;
  // Remove the mouseover delay. The gesture detector will enable
  // focusFollowsMouse when a drag gesture is detected.
  cvox.ChromeVoxEventWatcher.mouseoverDelayMs = 0;
};

cvox.AndroidHost.prototype.ttsLoaded = function() {
  return (typeof(accessibility) != 'undefined');
};

// TODO (clchen): Implement this.
cvox.AndroidHost.prototype.getApiSrc = function() {
  return '';
};

/**
 * @return {boolean} True if the TTS has been loaded.
 */
cvox.AndroidHost.prototype.hasTtsCallback = function() {
  return false;
};

/**
 * @return {boolean} True if the ChromeVox is supposed to intercept and handle
 * mouse clicks for the platform, instead of just letting the clicks fall
 * through.
 *
 * Note: This behavior is only needed for Android because of the way touch
 * exploration and double-tap to click is implemented by the platform.
 */
cvox.AndroidHost.prototype.mustRedispatchClickEvent = function() {
  return true;
};

/**
 * Activates or deactivates ChromeVox.
 * This is needed on Android by the Chrome app since it needs to manually
 * enable/disable ChromeVox depending on which tab is active and it cannot
 * use cvox.ChromeVoxUserCommands.commands['toggleChromeVox'] since that relies
 * on going through the background page and there isn't one in the Android case.
 *
 * @param {boolean} active Whether ChromeVox should be active.
 * @export
 */
cvox.AndroidHost.prototype.activateOrDeactivateChromeVox = function(active) {
  if (active == cvox.ChromeVox.isActive) {
    return;
  }
  cvox.ChromeVox.tts.stop();
  cvox.ChromeVox.isActive = active;
  cvox.ChromeVox.navigationManager.showOrHideIndicator(active);

  // If ChromeVox is inactive, the event watcher will only listen
  // for key events.
  cvox.ChromeVoxEventWatcher.cleanup(window);
  cvox.ChromeVoxEventWatcher.init(window);
  this.onPageLoad();

  if (document.activeElement) {
    var speakNodeAlso = document.hasFocus();
    cvox.ApiImplementation.syncToNode(document.activeElement, speakNodeAlso);
  } else {
    cvox.ChromeVox.navigationManager.updateIndicator();
  }
};

cvox.HostFactory.hostConstructor = cvox.AndroidHost;
