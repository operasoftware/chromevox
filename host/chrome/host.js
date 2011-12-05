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
 * @fileoverview Chrome-specific implementation of methods that differ
 * depending on the host platform.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.Host');

goog.require('chromevis.ChromeVisLens');
goog.require('cvox.AbstractHost');
goog.require('cvox.ExtensionBridge');

/**
 * @constructor
 * @extends {cvox.AbstractHost}
 */
cvox.Host = function() {
  cvox.AbstractHost.call(this);
};
goog.inherits(cvox.Host, cvox.AbstractHost);

cvox.Host.prototype.init = function() {
  cvox.ExtensionBridge.setupBackgroundPort();

  cvox.ExtensionBridge.addMessageListener(function(message) {
      if (message['keyBindings']) {
        cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable(message['keyBindings']);
      }
      if (message['prefs']) {
        var prefs = message['prefs'];
        cvox.ChromeVoxEditableTextBase.cursorIsBlock =
            (prefs['cursorIsBlock'] == 'true');
        cvox.ChromeVoxEventWatcher.focusFollowsMouse =
            (prefs['focusFollowsMouse'] == 'true');
        if (prefs['lensVisible'] == 'true' &&
            cvox.ChromeVox.lens &&
            !cvox.ChromeVox.lens.isLensDisplayed()) {
          cvox.ChromeVox.lens.showLens(true);
        }
        if (prefs['lensVisible'] == 'false' &&
            cvox.ChromeVox.lens &&
            cvox.ChromeVox.lens.isLensDisplayed()) {
          cvox.ChromeVox.lens.showLens(false);
        }
        if (cvox.ChromeVox.lens) {
          cvox.ChromeVox.lens.setAnchoredLens(prefs['lensAnchored'] == 'true');
        }
        if (prefs['useBriefMode'] == 'true') {
          cvox.ChromeVox.verbosity = cvox.VERBOSITY_BRIEF;
        } else {
          cvox.ChromeVox.verbosity = cvox.VERBOSITY_VERBOSE;
        }
      }
    });


  cvox.ExtensionBridge.send({
      'target': 'Prefs',
      'action': 'getPrefs'
    });

  // On Windows and Mac, cause any existing system screen readers to not try to
  // speak the web content in the browser.
  if ((navigator.platform.indexOf('Win') == 0) ||
      (navigator.platform.indexOf('Mac') == 0)) {
    document.body.setAttribute('aria-hidden', true);
    var originalRole = document.body.getAttribute('role');
    document.body.setAttribute('role', 'application');
    document.body.setAttribute('chromevoxignoreariahidden', true);
    document.body.setAttribute('chromevoxoriginalrole', originalRole);
  }
};

cvox.Host.prototype.reinit = function() {
  cvox.ExtensionBridge.init();
};

cvox.Host.prototype.onPageLoad = function() {
  if (window.top == window) {
    cvox.ChromeVox.lens = new chromevis.ChromeVisLens();
    cvox.ChromeVox.lens.multiplier = 2.25;
    cvox.ChromeVox.tts.setLens(cvox.ChromeVox.lens);
  }

  cvox.ChromeVox.processEmbeddedPdfs();

  cvox.ExtensionBridge.addDisconnectListener(function() {
    cvox.ChromeVox.isActive = false;
    cvox.ChromeVoxEventWatcher.cleanup(document);

    // Clean up after ourselves on Windows to re-enable native screen readers.
    if (navigator.platform.indexOf('Win') == 0) {
      document.body.removeAttribute('aria-hidden');
      if (document.body.getAttribute('chromevoxoriginalrole') != '') {
        document.body.setAttribute(
            'role', document.body.getAttribute('chromevoxoriginalrole'));
      } else {
        document.body.removeAttribute('role');
      }
      document.body.removeAttribute('chromevoxignoreariahidden');
      document.body.removeAttribute('chromevoxoriginalrole');
    }
  });
};

cvox.Host.prototype.sendToBackgroundPage = function(message) {
  cvox.ExtensionBridge.send(message);
};
