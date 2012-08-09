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
 * @fileoverview Initializes the injected content script.
 *
 * @author clchen@google.com (Charles Chen)
 */

goog.provide('cvox.ChromeVoxInit');

goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxFiltering');
goog.require('cvox.ChromeVoxJSON');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.CompositeTts');
goog.require('cvox.ConsoleTts');
goog.require('cvox.DescriptionUtil');
goog.require('cvox.DomUtil');
goog.require('cvox.HostFactory');
goog.require('cvox.Lens');
goog.require('cvox.LiveRegions');
goog.require('cvox.SpokenMessages');
goog.require('cvox.TtsHistory');


// INJECTED_AFTER_LOAD is set true by ChromeVox itself or ChromeOS when this
// script is injected after page load (i.e. when manually enabling ChromeVox).
if (!window['INJECTED_AFTER_LOAD'])
  window['INJECTED_AFTER_LOAD'] = false;

/**
 * Initial speech when the page loads. This may happen only after we get
 * prefs back, so we can make sure ChromeVox is active.
 */
cvox.ChromeVox.speakInitialPageLoad = function() {
  // Don't speak page title and other information if this script is not injected
  // at the time of page load. This global is set by Chrome OS.
  var disableSpeak = window['INJECTED_AFTER_LOAD'];

  if (!cvox.ChromeVox.isActive) {
    disableSpeak = true;
  }

  var queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;

  // If we're the top-level frame, speak the title of the page +
  // the active element if it is a user control.
  if (window.top == window) {
    if (document.title && !disableSpeak) {
      cvox.ChromeVox.tts.speak(document.title, 0);
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
  } else {
    // If we're not the top-level frame, we should queue all initial
    // speech so it comes after the main frame's title announcement.
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  // Initialize live regions and speak alerts.
  if (cvox.LiveRegions.init(new Date(), queueMode, disableSpeak)) {
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  // If this iframe has focus, speak the current focused element.
  if (document.hasFocus()) {
    var activeElem = document.activeElement;
    if (cvox.DomUtil.isControl(activeElem)) {
      cvox.ChromeVox.navigationManager.updateSel(
          cvox.CursorSelection.fromNode(activeElem));
      cvox.ChromeVox.navigationManager.setFocus();
      if (!disableSpeak) {
        var desc = cvox.DescriptionUtil.getControlDescription(activeElem);
        desc.speak(queueMode);
        queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
      }
    }
  }
};

/**
 * Initializes cvox.ChromeVox.
 */
cvox.ChromeVox.init = function() {
  // Setup globals
  cvox.ChromeVox.host = cvox.HostFactory.getHost();

  if (!cvox.ChromeVox.host.ttsLoaded()) {
    window.setTimeout(cvox.ChromeVox.init, 300);
    return;
  }

  cvox.ChromeVox.tts = new cvox.CompositeTts()
      .add(cvox.HostFactory.getTts())
      .add(new cvox.TtsHistory())
      .add(cvox.ConsoleTts.getInstance());
  if (cvox.ChromeVox.host.canShowLens()) {
    var lens = new cvox.Lens();
    lens.setMultiplier(2.25);
    cvox.ChromeVox.tts.add(lens);
    cvox.ChromeVox.lens = lens;
  }
  cvox.ChromeVox.earcons = cvox.HostFactory.getEarcons();
  cvox.ChromeVox.msgs = cvox.HostFactory.getMsgs();
  cvox.ChromeVox.isActive = true;
  cvox.ChromeVox.navigationManager =
      new cvox.ChromeVoxNavigationManager();
  cvox.ChromeVox.syncToNode =
      cvox.ApiImplementation.syncToNode;

  cvox.ChromeVox.speakInitialMessages = cvox.ChromeVox.speakInitialPageLoad;

  // Do platform specific initialization here.
  cvox.ChromeVox.host.init();

  // Start the event watchers
  cvox.ChromeVoxEventWatcher.init(document);

  // Provide a way for modules that can't depend on cvox.ChromeVoxUserCommands
  // to execute commands.
  cvox.ChromeVox.executeUserCommand = function(commandName) {
    cvox.ChromeVoxUserCommands.commands[commandName]();
  };

  cvox.ChromeVox.host.onPageLoad();
};

/**
 * Reinitialize ChromeVox, if the extension is disabled and then enabled
 * again, but our injected page script has remained.
 */
cvox.ChromeVox.reinit = function() {
  cvox.ChromeVox.host.reinit();
  cvox.ChromeVox.init();
};

window.setTimeout(cvox.ChromeVox.init, 0);
