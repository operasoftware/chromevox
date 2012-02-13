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
 * @fileoverview Script that runs on the background page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ChromeVoxBackground');

goog.require('cvox.AccessibilityApiHandler');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEditableTextBase');
goog.require('cvox.ChromeVoxPrefs');
goog.require('cvox.EarconsBackground');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');
goog.require('cvox.TtsBackground');



/**
 * This object manages the global and persistent state for ChromeVox.
 * It listens for messages from the content scripts on pages and
 * interprets them.
 * @constructor
 */
cvox.ChromeVoxBackground = function() {
};


/**
 * Initialize the background page: set up TTS and bridge listeners.
 */
cvox.ChromeVoxBackground.prototype.init = function() {
  cvox.ChromeVox.msgs = cvox.HostFactory.getMsgs();
  this.prefs = new cvox.ChromeVoxPrefs();
  this.readPrefs();

  this.tts = new cvox.TtsBackground();
  this.earcons = new cvox.EarconsBackground();
  this.addBridgeListener();
  this.addStorageListener();

  cvox.AccessibilityApiHandler.init(this.tts, this.earcons);

  if (COMPILED) {
    // Inject the content script into all running tabs.
    var self = this;
    console.log('Getting all windows');
    chrome.windows.getAll({'populate': true}, function(windows) {
      for (var i = 0; i < windows.length; i++) {
        var tabs = windows[i].tabs;
        for (var j = 0; j < tabs.length; j++) {
          var tab = tabs[j];
          self.injectChromeVoxIntoTab(tab);
        }
      }
    });
  }

  this.checkVersionNumber();
};


/**
 * Inject ChromeVox into a tab.
 * @param {Tab} tab The tab where ChromeVox scripts should be injected.
 */
cvox.ChromeVoxBackground.prototype.injectChromeVoxIntoTab = function(tab) {
  // INJECTED_AFTER_LOAD is set true to prevent ChromeVox from giving
  // the same feedback as a page loading.
  chrome.tabs.executeScript(
      tab.id,
      {'code': 'window.INJECTED_AFTER_LOAD = true;',
       'allFrames': true},
      function() {
        if (chrome.extension.lastError) {
          console.log('ERROR: Did not inject into ' + tab.url);
        }
      });
  chrome.tabs.executeScript(
      tab.id,
      {'file': 'chromeVoxChromePageScript.js',
       'allFrames': true},
      function() {
        if (chrome.extension.lastError) {
          console.log('ERROR: Did not inject into ' + tab.url);
        }
      });
};


/**
 * Called when a TTS message is received from a page content script.
 * @param {Object} msg The TTS message.
 */
cvox.ChromeVoxBackground.prototype.onTtsMessage = function(msg) {
  if (msg['action'] == 'speak') {
    this.tts.speak(msg['text'], msg['queueMode'], msg['properties']);
  } else if (msg['action'] == 'stop') {
    this.tts.stop();
  } else if (msg['action'] == 'increaseOrDecrease') {
    this.tts.increaseOrDecreaseProperty(msg['property'], msg['increase']);
    var value = this.tts.ttsProperties[msg['property']];
    var valueAsPercent = Math.round(value * 100);
    var announcement;
    switch (msg['property']) {
    case cvox.AbstractTts.RATE:
      announcement = cvox.ChromeVox.msgs.getMsg('announce_rate',
                                                [valueAsPercent]);
      break;
    case cvox.AbstractTts.PITCH:
      announcement = cvox.ChromeVox.msgs.getMsg('announce_pitch',
                                                [valueAsPercent]);
      break;
    case cvox.AbstractTts.VOLUME:
      announcement = cvox.ChromeVox.msgs.getMsg('announce_volume',
                                                [valueAsPercent]);
      break;
    }
    if (announcement) {
      this.tts.speak(announcement,
                     cvox.AbstractTts.QUEUE_MODE_FLUSH,
                     cvox.AbstractTts.PERSONALITY_ANNOTATION);
    }
  }
};


/**
 * Called when an earcon message is received from a page content script.
 * @param {Object} msg The earcon message.
 */
cvox.ChromeVoxBackground.prototype.onEarconMessage = function(msg) {
  if (msg.action == 'play') {
    this.earcons.playEarcon(msg.earcon);
  }
};


/**
 * Listen for connections from our content script bridges, and dispatch the
 * messages to the proper destination.
 */
cvox.ChromeVoxBackground.prototype.addBridgeListener = function() {
  cvox.ExtensionBridge.addMessageListener(goog.bind(function(msg, port) {
    var target = msg['target'];
    var action = msg['action'];

    switch (target) {
    case 'KbExplorer':
      var explorerPage = new Object();
      explorerPage.url = 'chromevox/background/kbexplorer.html';
      chrome.tabs.create(explorerPage);
      break;
    case 'HelpDocs':
      var helpPage = new Object();
      helpPage.url = 'http://chromevox.com/tutorial/index.html';
      chrome.tabs.create(helpPage);
      break;
    case 'Options':
      if (action == 'open') {
        var optionsPage = new Object();
        optionsPage.url = 'chromevox/background/options.html';
        chrome.tabs.create(optionsPage);
      }
      break;
    case 'Prefs':
      if (action == 'getPrefs') {
        this.prefs.sendPrefsToPort(port);
      } else if (action == 'setPref') {
        if (msg['pref'] == 'active' &&
            msg['value'] != 'true' &&
            cvox.ChromeVox.isActive) {
          this.tts.speak(cvox.ChromeVox.msgs.getMsg('chromevox_inactive'));
        }
        this.prefs.setPref(msg['pref'], msg['value']);
        this.readPrefs();
      }
      break;
    case 'TTS':
      if (msg['startCallbackId']) {
        msg['properties']['startCallback'] = function() {
          port.postMessage({'message': 'TTS_CALLBACK',
                            'id': msg['startCallbackId']});
        };
      }
      if (msg['endCallbackId']) {
        msg['properties']['endCallback'] = function() {
          port.postMessage({'message': 'TTS_CALLBACK',
                            'id': msg['endCallbackId']});
        };
      }
      try {
        this.onTtsMessage(msg);
      } catch (err) {
        console.log(err);
      }
      break;
    case 'EARCON':
      this.onEarconMessage(msg);
      break;
    }
  }, this));
};


/**
 * Listen for changes to local storage, and reloads the key map.
 */
cvox.ChromeVoxBackground.prototype.addStorageListener = function() {
  var storageEventHandler = goog.bind(function() {
    // Reload the key map from local storage
    this.prefs.reloadKeyMap();
  }, this);
  window.addEventListener('storage', storageEventHandler, false);
};


/**
 * Checks the version number. If it has changed, display release notes
 * to the user.
 */
cvox.ChromeVoxBackground.prototype.checkVersionNumber = function() {
  this.localStorageVersion = localStorage['versionString'];
  this.showNotesIfNewVersion();
};


/**
 * Display release notes to the user.
 * @param {string} version The version number string.
 */
cvox.ChromeVoxBackground.prototype.displayReleaseNotes = function(version) {
  chrome.tabs.create(
      {'url': 'http://chromevox.com/release_notes.html'});

  // Update version number in local storage
  localStorage['versionString'] = version;
  this.localStorageVersion = version;
};


/**
 * Gets the current version number from the extension manifest.
 */
cvox.ChromeVoxBackground.prototype.showNotesIfNewVersion = function() {
  // Check version number in manifest.
  var url = chrome.extension.getURL('manifest.json');
  var xhr = new XMLHttpRequest();
  var context = this;
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var manifest = JSON.parse(xhr.responseText);
      console.log('Version: ' + manifest.version);
      if (context.localStorageVersion != manifest.version) {
        context.displayReleaseNotes(manifest.version);
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
};


/**
 * Read and apply preferences that affect the background context.
 */
cvox.ChromeVoxBackground.prototype.readPrefs = function() {
  var prefs = this.prefs.getPrefs();
  cvox.ChromeVoxEditableTextBase.cursorIsBlock =
      (prefs['cursorIsBlock'] == 'true');
  cvox.ChromeVox.isActive = (prefs['active'] == 'true');
};

// Create the background page object and export a function window['speak']
// so that other background pages can access it.
(function() {
   var background = new cvox.ChromeVoxBackground();
   background.init();
   window['speak'] = goog.bind(background.tts.speak, background.tts);
})();
