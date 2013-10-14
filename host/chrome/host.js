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
goog.require('cvox.InitialSpeech');
goog.require('cvox.PdfProcessor');
goog.require('cvox.SearchLoader');
goog.require('cvox.TraverseMath');

/**
 * @constructor
 * @extends {cvox.AbstractHost}
 */
cvox.ChromeHost = function() {
  goog.base(this);

  /** @private {boolean} */
  this.gotPrefsAtLeastOnce_ = false;
};
goog.inherits(cvox.ChromeHost, cvox.AbstractHost);


/** @override */
cvox.ChromeHost.prototype.init = function() {
  // TODO(deboer): This pattern is relatively painful since it
  // must be duplicated in all host.js files. It also causes odd
  // dependencies.
  // TODO (stoarca): Not using goog.bind because for some reason it gets
  // compiled to native code and not possible to debug.
  var self = this;
  var listener = function(message) {
    if (message['history']) {
      cvox.ChromeVox.visitedUrls = message['history'];
    }

    if (message['keyBindings']) {
      cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable(message['keyBindings']);
    }
    if (message['prefs']) {
      var prefs = message['prefs'];
      cvox.ChromeVoxEditableTextBase.useIBeamCursor =
          (prefs['useIBeamCursor'] == 'true');
      cvox.ChromeVoxEditableTextBase.eventTypingEcho = true;
      cvox.ChromeVoxEventWatcher.focusFollowsMouse =
          (prefs['focusFollowsMouse'] == 'true');

      cvox.ChromeVox.version = prefs['version'];

      cvox.ChromeVox.earcons.enabled =
          /** @type {boolean} */(JSON.parse(prefs['earcons']));

      cvox.ChromeVox.typingEcho =
          /** @type {number} */(JSON.parse(prefs['typingEcho']));

      if (prefs['position']) {
        cvox.ChromeVox.position =
            /** @type {Object.<string, {x:number, y:number}>} */ (
                JSON.parse(prefs['position']));
      }

      if (prefs['granularity'] != 'undefined') {
        cvox.ChromeVox.navigationManager.setGranularity(
            /** @type {number} */ (JSON.parse(prefs['granularity'])));
      }

      self.activateOrDeactivateChromeVox(prefs['active'] == 'true');
      self.activateOrDeactivateStickyMode(prefs['sticky'] == 'true');
      if (!self.gotPrefsAtLeastOnce_) {
        cvox.InitialSpeech.speak();
      }
      self.gotPrefsAtLeastOnce_ = true;

      if (prefs['useVerboseMode'] == 'false') {
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
        var searchInit = prefs['siteSpecificEnhancements'] === 'true' ?
            cvox.SearchLoader.init : null;
        cvox.ApiImplementation.init(searchInit);
      }
    }
  };
  cvox.ExtensionBridge.addMessageListener(listener);

  cvox.ExtensionBridge.addMessageListener(function(msg, port) {
    if (msg['message'] == 'DOMAINS_STYLES') {
      cvox.TraverseMath.getInstance().addDomainsAndStyles(
          msg['domains'], msg['styles']);
    }});

  cvox.ExtensionBridge.addMessageListener(function(msg, port) {
    var message = msg['message'];
    if (message == 'USER_COMMAND') {
      var cmd = msg['command'];
      cvox.ChromeVoxUserCommands.commands[cmd](msg);
    }
  });

  cvox.ExtensionBridge.send({
      'target': 'Prefs',
      'action': 'getPrefs'
    });

  cvox.ExtensionBridge.send({
      'target': 'Data',
      'action': 'getHistory'
    });
};


/** @override */
cvox.ChromeHost.prototype.reinit = function() {
  cvox.ExtensionBridge.init();
};


/** @override */
cvox.ChromeHost.prototype.onPageLoad = function() {
  cvox.PdfProcessor.processEmbeddedPdfs();

  cvox.ExtensionBridge.addDisconnectListener(goog.bind(function() {
    cvox.ChromeVox.isActive = false;
    cvox.ChromeVoxEventWatcher.cleanup(window);
    // TODO(stoarca): Huh?? Why are we resetting during disconnect?
    // This is not appropriate behavior!
    cvox.ChromeVox.navigationManager.reset();
  }, this));
};


/** @override */
cvox.ChromeHost.prototype.sendToBackgroundPage = function(message) {
  cvox.ExtensionBridge.send(message);
};


/** @override */
cvox.ChromeHost.prototype.getApiSrc = function() {
  return this.getFileSrc('chromevox/injected/api.js');
};


/** @override */
cvox.ChromeHost.prototype.getFileSrc = function(file) {
  return window.chrome.extension.getURL(file);
};


/** @override */
cvox.ChromeHost.prototype.killChromeVox = function() {
  goog.base(this, 'killChromeVox');
  cvox.ExtensionBridge.removeMessageListeners();
};


/**
 * Activates or deactivates Sticky Mode.
 * @param {boolean} sticky Whether sticky mode should be active.
 */
cvox.ChromeHost.prototype.activateOrDeactivateStickyMode = function(sticky) {
  cvox.ChromeVox.isStickyOn = sticky;
};

cvox.HostFactory.hostConstructor = cvox.ChromeHost;
