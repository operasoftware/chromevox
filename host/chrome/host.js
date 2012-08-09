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
 * @fileoverview Chrome-specific implementation of methods that differ
 * depending on the host platform.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ChromeHost');

goog.require('cvox.AbstractHost');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');
goog.require('cvox.PdfProcessor');

/**
 * @constructor
 * @extends {cvox.AbstractHost}
 */
cvox.ChromeHost = function() {
  cvox.AbstractHost.call(this);

  /** @type {boolean} @private */
  this.gotPrefsAtLeastOnce_ = false;
};
goog.inherits(cvox.ChromeHost, cvox.AbstractHost);

cvox.ChromeHost.prototype.init = function() {
  cvox.ExtensionBridge.setupBackgroundPort();

  // TODO(deboer): This pattern is relatively painful since it
  // must be duplicated in all host.js files. It also causes odd
  // dependencies.
  // TODO (stoarca): Not using goog.bind because for some reason it gets
  // compiled to native code and not possible to debug.
  var self = this;
  var listener = function(message) {
      if (message['keyBindings']) {
        cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable(message['keyBindings']);
      }
      if (message['prefs']) {
        var prefs = message['prefs'];
        cvox.ChromeVoxEditableTextBase.cursorIsBlock =
            (prefs['cursorIsBlock'] == 'true');
        cvox.ChromeVoxEventWatcher.focusFollowsMouse =
            (prefs['focusFollowsMouse'] == 'true');

        cvox.ChromeVox.version = prefs['version'];

        self.activateOrDeactivateChromeVox(prefs['active'] == 'true');
        if (!self.gotPrefsAtLeastOnce_) {
          cvox.ChromeVox.speakInitialMessages();
        }
        self.gotPrefsAtLeastOnce_ = true;

        if (cvox.ChromeVox.lens) {
          if (prefs['lensVisible'] == 'true' &&
              !cvox.ChromeVox.lens.isLensDisplayed()) {
            cvox.ChromeVox.lens.showLens(true);
          }
          if (prefs['lensVisible'] == 'false' &&
              cvox.ChromeVox.lens.isLensDisplayed()) {
            cvox.ChromeVox.lens.showLens(false);
          }
          cvox.ChromeVox.lens.setAnchoredLens(prefs['lensAnchored'] == 'true');
        }

        if (prefs['useBriefMode'] == 'true') {
          cvox.ChromeVox.verbosity = cvox.VERBOSITY_BRIEF;
        } else {
          cvox.ChromeVox.verbosity = cvox.VERBOSITY_VERBOSE;
        }
        if (prefs['cvoxKey']) {
          cvox.ChromeVox.modKeyStr = prefs['cvoxKey'];
        }

        var apiPrefsChanged = (
            prefs['siteSpecificScriptLoader'] !=
                cvox.ApiImplementation.siteSpecificScriptLoader ||
            prefs['siteSpecificScriptBase'] !=
                cvox.ApiImplementation.siteSpecificScriptBase);
        cvox.ApiImplementation.siteSpecificScriptLoader =
            prefs['siteSpecificScriptLoader'];
        cvox.ApiImplementation.siteSpecificScriptBase =
            prefs['siteSpecificScriptBase'];
        if (apiPrefsChanged) {
          cvox.ApiImplementation.init();
        }

        if (prefs['filterMap']) {
          cvox.ChromeVox.navigationManager.getFilteredWalker().reinitialize(
              prefs['filterMap']);
        }
      }
  };
  cvox.ExtensionBridge.addMessageListener(listener);

  cvox.ExtensionBridge.addMessageListener(function(msg, port) {
    var message = msg['message'];
    if (message == 'USER_COMMAND') {
      var cmd = msg['command'];
      // TODO(stoarca): Should whitelist commands.
      cvox.ChromeVoxUserCommands.commands[cmd]();
    }
  });

  cvox.ExtensionBridge.send({
      'target': 'Prefs',
      'action': 'getPrefs'
    });

  this.hidePageFromNativeScreenReaders();
};

cvox.ChromeHost.prototype.reinit = function() {
  cvox.ExtensionBridge.init();
};

/**
 * On Windows and Mac, cause any existing system screen readers to not try to
 * speak the web content in the browser.
 */
cvox.ChromeHost.prototype.hidePageFromNativeScreenReaders = function() {
  var originalHidden = document.body.getAttribute('aria-hidden');
  if (originalHidden == 'true') {
    cvox.ChromeVox.entireDocumentIsHidden = true;
  }

  if ((navigator.platform.indexOf('Win') == 0) ||
      (navigator.platform.indexOf('Mac') == 0)) {
    if (!cvox.ChromeVox.entireDocumentIsHidden) {
      document.body.setAttribute('aria-hidden', true);
      document.body.setAttribute('chromevoxignoreariahidden', true);
    }
    var originalRole = document.body.getAttribute('role');
    document.body.setAttribute('role', 'application');
    document.body.setAttribute('chromevoxoriginalrole', originalRole);
  }
};

/**
 * Clean up after ourselves to re-enable native screen readers.
 */
cvox.ChromeHost.prototype.unhidePageFromNativeScreenReaders = function() {
  if ((navigator.platform.indexOf('Win') == 0) ||
      (navigator.platform.indexOf('Mac') == 0)) {
    if (document.body.getAttribute('chromevoxoriginalrole') != '') {
      document.body.setAttribute(
          'role', document.body.getAttribute('chromevoxoriginalrole'));
    } else {
      document.body.removeAttribute('role');
    }
    if (!cvox.ChromeVox.entireDocumentIsHidden) {
      document.body.removeAttribute('aria-hidden');
      document.body.removeAttribute('chromevoxignoreariahidden');
    }
    document.body.removeAttribute('chromevoxoriginalrole');
  }
};

cvox.ChromeHost.prototype.onPageLoad = function() {
  cvox.PdfProcessor.processEmbeddedPdfs();

  cvox.ExtensionBridge.addDisconnectListener(goog.bind(function() {
    cvox.ChromeVox.isActive = false;
    cvox.ChromeVoxEventWatcher.cleanup(document);
    cvox.ChromeVox.navigationManager.reset();
    this.unhidePageFromNativeScreenReaders();
  }, this));
};

cvox.ChromeHost.prototype.sendToBackgroundPage = function(message) {
  cvox.ExtensionBridge.send(message);
};

cvox.ChromeHost.prototype.getApiSrc = function() {
  return this.getFileSrc('chromevox/injected/api.js');
};

cvox.ChromeHost.prototype.getFileSrc = function(file) {
  return window.chrome.extension.getURL(file);
};

/**
 * Activates or deactivates ChromeVox.
 * @param {boolean} active Whether ChromeVox should be active.
 */
cvox.ChromeHost.prototype.activateOrDeactivateChromeVox = function(active) {
  if (active == cvox.ChromeVox.isActive) {
    return;
  }

  cvox.ChromeVox.isActive = active;
  cvox.ChromeVox.navigationManager.showOrHideIndicator();

  // If ChromeVox is inactive, the event watcher will only listen
  // for key events.
  cvox.ChromeVoxEventWatcher.cleanup(document);
  cvox.ChromeVoxEventWatcher.init(document);

  if (document.activeElement) {
    var speakNodeAlso = document.hasFocus();
    cvox.ApiImplementation.syncToNode(document.activeElement, speakNodeAlso);
  } else {
    cvox.ChromeVox.navigationManager.updateIndicator();
  }

  if (active) {
    this.hidePageFromNativeScreenReaders();
  } else {
    this.unhidePageFromNativeScreenReaders();
  }
};

/**
 * @override
 */
cvox.ChromeHost.prototype.canShowLens = function() {
  return window.top == window;
};

cvox.HostFactory.hostConstructor = cvox.ChromeHost;
