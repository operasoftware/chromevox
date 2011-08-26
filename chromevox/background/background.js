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
 * @fileoverview Script that runs on the background page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

cvoxgoog.provide('cvox.ChromeVoxBackground');

cvoxgoog.require('cvox.BuildConfig');

cvoxgoog.require('cvox.ChromeVox');
cvoxgoog.require('cvox.ChromeVoxAccessibilityApiHandler');
cvoxgoog.require('cvox.ChromeVoxChromeNativeTtsEngine');
cvoxgoog.require('cvox.ChromeVoxEarcons');
cvoxgoog.require('cvox.ChromeVoxEditableTextBase');
cvoxgoog.require('cvox.ChromeVoxPrefs');
cvoxgoog.require('cvox.ExtensionBridge');
cvoxgoog.require('cvox.LocalEarconsManager');
cvoxgoog.require('cvox.LocalTtsManager');



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
  this.prefs = new cvox.ChromeVoxPrefs();
  this.readPrefs();

  this.ttsManager = this.createTtsManager();
  this.earconsManager = this.createEarconsManager(this.ttsManager);
  this.addBridgeListener();

  cvox.ChromeVoxAccessibilityApiHandler.init(this.ttsManager,
      this.earconsManager);

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
};


/**
 * Inject ChromeVox into a tab.
 * @param {Tab} tab The tab where ChromeVox scripts should be injected.
 */
cvox.ChromeVoxBackground.prototype.injectChromeVoxIntoTab = function(tab) {
  chrome.tabs.executeScript(
      tab.id,
      {file: 'build/build_defs.js',
       allFrames: true},
      function() {
        if (chrome.extension.lastError) {
          console.log('ERROR: Did not inject into ' + tab.url);
        }
      });
  chrome.tabs.executeScript(tab.id,
                            {file: 'build/build_config_chrome.js',
                             allFrames: true});
  chrome.tabs.executeScript(tab.id,
                            {file: 'chromevox/injected/main.js',
                             allFrames: true});
  chrome.tabs.executeScript(tab.id,
                            {file: 'common/extension_bridge.js',
                             allFrames: true});
};


/**
 * @return {cvox.AbstractTtsManager} New initialized TTS manager.
 */
cvox.ChromeVoxBackground.prototype.createTtsManager = function() {
  var ttsEngines = [cvox.ChromeVoxChromeNativeTtsEngine];
  return new cvox.LocalTtsManager(ttsEngines, null);
};


/**
 * @param {cvox.AbstractTtsManager} ttsManager A TTS Manager.
 * @return {Object} New initialized earcons manager.
 */
cvox.ChromeVoxBackground.prototype.createEarconsManager = function(ttsManager) {
  return new cvox.LocalEarconsManager([cvox.ChromeVoxEarcons], ttsManager);
};


/**
 * Called when a TTS message is received from a page content script.
 * @param {Object} msg The TTS message.
 */
cvox.ChromeVoxBackground.prototype.onTtsMessage = function(msg) {
  if (msg.action == 'speak') {
    this.ttsManager.speak(msg.text, msg.queueMode, msg.properties);
  } else if (msg.action == 'stop') {
    this.ttsManager.stop();
  } else if (msg.action == 'nextEngine') {
    this.ttsManager.nextTtsEngine(true);
  } else if (msg.action == 'increaseRate') {
    this.ttsManager.increaseProperty(
        cvox.AbstractTts.RATE, msg.modifier);
  } else if (msg.action == 'decreaseRate') {
    this.ttsManager.decreaseProperty(
        cvox.AbstractTts.RATE, msg.modifier);
  } else if (msg.action == 'increasePitch') {
    this.ttsManager.increaseProperty(
        cvox.AbstractTts.PITCH, msg.modifier);
  } else if (msg.action == 'decreasePitch') {
    this.ttsManager.decreaseProperty(
        cvox.AbstractTts.PITCH, msg.modifier);
  } else if (msg.action == 'increaseVolume') {
    this.ttsManager.increaseProperty(
        cvox.AbstractTts.VOLUME, msg.modifier);
  } else if (msg.action == 'decreaseVolume') {
    this.ttsManager.decreaseProperty(
        cvox.AbstractTts.VOLUME, msg.modifier);
  }
};


/**
 * Called when an earcon message is received from a page content script.
 * @param {Object} msg The earcon message.
 */
cvox.ChromeVoxBackground.prototype.onEarconMessage = function(msg) {
  if (msg.action == 'play') {
    this.earconsManager.playEarcon(msg.earcon);
  } else if (msg.action == 'nextEarcons') {
    this.earconsManager.nextEarcons();
  }
};


/**
 * Listen for connections from our content script bridges, and dispatch the
 * messages to the proper destination.
 */
cvox.ChromeVoxBackground.prototype.addBridgeListener = function() {
  var context = this;
  cvox.ExtensionBridge.addMessageListener(function(msg, port) {
    var target = msg['target'];
    var action = msg['action'];

    switch (target) {
    case 'BookmarkManager':
      var createDataObj = new Object();
      createDataObj.url = 'chromevox/background/bookmark_manager.html';
      chrome.windows.create(createDataObj);
      break;
    case 'KbExplorer':
      var explorerPage = new Object();
      explorerPage.url = 'chromevox/background/kbexplorer.html';
      chrome.tabs.create(explorerPage);
      break;
    case 'HelpDocs':
      var helpPage = new Object();
      helpPage.url = 'http://google-axs-chrome.googlecode.com/svn/trunk/' +
          'chromevox_tutorial/index.html';
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
        context.prefs.sendPrefsToPort(port);
      } else if (action == 'setPref') {
        context.prefs.setPref(msg['pref'], msg['value']);
        context.readPrefs();
      }
      break;
    case 'TTS':
      if (msg['startCallbackId']) {
        msg.properties['startCallback'] = function() {
          port.postMessage({'message': 'TTS_CALLBACK',
                            'id': msg['startCallbackId']});
        };
      }
      if (msg['endCallbackId']) {
        msg.properties['endCallback'] = function() {
          port.postMessage({'message': 'TTS_CALLBACK',
                            'id': msg['endCallbackId']});
        };
      }
      context.onTtsMessage(msg);
      break;
    case 'EARCON':
      context.onEarconMessage(msg);
      break;
    }
  });
};

/**
 * Read and apply preferences that affect the background context.
 */
cvox.ChromeVoxBackground.prototype.readPrefs = function() {
  var prefs = this.prefs.getPrefs();
  cvox.ChromeVoxEditableTextBase.cursorIsBlock =
      (prefs['cursorIsBlock'] == 'true');
};

var background = new cvox.ChromeVoxBackground();
background.init();

