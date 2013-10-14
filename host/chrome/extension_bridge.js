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
 * @fileoverview Bridge to aid in communication between a Chrome
 * background page and content script.
 *
 * It automatically figures out where it's being run and initializes itself
 * appropriately. Then just call send() to send a message from the background
 * to the page or vice versa, and addMessageListener() to provide a message
 * listener.  Messages can be any object that can be serialized using JSON.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ExtensionBridge');

goog.require('cvox.ChromeVoxJSON');

/**
 * @constructor
 */
cvox.ExtensionBridge = function() {};

/**
 * Initialize the extension bridge. Dynamically figure out whether we're in
 * the background page, content script, or in a page, and call the
 * corresponding function for more specific initialization.
 */
cvox.ExtensionBridge.init = function() {
  var self = cvox.ExtensionBridge;
  self.messageListeners = [];
  self.disconnectListeners = [];

  if (/^chrome-extension:\/\/.*background\.html$/.test(window.location.href)) {
    // This depends on the fact that the background page has a specific url. We
    // should never be loaded into another extension's background page, so this
    // is a safe check.
    self.context = self.BACKGROUND;
    self.initBackground();
    return;
  }

  if (chrome && chrome.extension) {
    self.context = self.CONTENT_SCRIPT;
    self.initContentScript();
  }
};

/**
 * Constant indicating we're in a background page.
 * @type {number}
 * @const
 */
cvox.ExtensionBridge.BACKGROUND = 0;

/**
 * Constant indicating we're in a content script.
 * @type {number}
 * @const
 */
cvox.ExtensionBridge.CONTENT_SCRIPT = 1;

/**
 * The name of the port between the content script and background page.
 * @type {string}
 * @const
 */
cvox.ExtensionBridge.PORT_NAME = 'cvox.ExtensionBridge.Port';

/**
 * The name of the message between the content script and background to
 * see if they're connected.
 * @type {string}
 * @const
 */
cvox.ExtensionBridge.PING_MSG = 'cvox.ExtensionBridge.Ping';

/**
 * The name of the message between the background and content script to
 * confirm that they're connected.
 * @type {string}
 * @const
 */
cvox.ExtensionBridge.PONG_MSG = 'cvox.ExtensionBridge.Pong';

/**
 * Send a message. If the context is a page, sends a message to the
 * extension background page. If the context is a background page, sends
 * a message to the current active tab (not all tabs).
 *
 * @param {Object} message The message to be sent.
 */
cvox.ExtensionBridge.send = function(message) {
  var self = cvox.ExtensionBridge;
  switch (self.context) {
  case self.BACKGROUND:
    self.sendBackgroundToContentScript(message);
    break;
  case self.CONTENT_SCRIPT:
    self.sendContentScriptToBackground(message);
    break;
  }
};

/**
 * Provide a function to listen to messages. In page context, this
 * listens to messages from the background. In background context,
 * this listens to messages from all pages.
 *
 * The function gets called with two parameters: the message, and a
 * port that can be used to send replies.
 *
 * @param {function(Object, Port)} listener The message listener.
 */
cvox.ExtensionBridge.addMessageListener = function(listener) {
  cvox.ExtensionBridge.messageListeners.push(listener);
};

/**
 * Provide a function to be called when the connection is
 * disconnected.
 *
 * @param {function()} listener The listener.
 */
cvox.ExtensionBridge.addDisconnectListener = function(listener) {
  cvox.ExtensionBridge.disconnectListeners.push(listener);
};

/**
 * Removes all message listeners from the extension bridge.
 */
cvox.ExtensionBridge.removeMessageListeners = function() {
  cvox.ExtensionBridge.messageListeners.length = 0;
};

/**
 * Initialize the extension bridge in a background page context by registering
 * a listener for connections from the content script.
 */
cvox.ExtensionBridge.initBackground = function() {
  var self = cvox.ExtensionBridge;

  var onConnectHandler = function(port) {
    if (port.name != self.PORT_NAME) {
      return;
    }
    port.onMessage.addListener(
        function(message) {
          if (message[cvox.ExtensionBridge.PING_MSG]) {
            var pongMessage = {};
            pongMessage[cvox.ExtensionBridge.PONG_MSG] = 1;
            port.postMessage(pongMessage);
	    return;
	  }
          for (var i = 0; i < self.messageListeners.length; i++) {
            self.messageListeners[i](message, port);
          }
        });
  };

  chrome.extension.onConnect.addListener(onConnectHandler);
  chrome.extension.onConnectExternal.addListener(onConnectHandler);
};

/**
 * Initialize the extension bridge in a content script context, listening
 * for messages from the background page.
 */
cvox.ExtensionBridge.initContentScript = function() {
  var self = cvox.ExtensionBridge;
  self.connected = false;
  self.pingAttempts = 0;
  self.queuedMessages = [];

  var onMessageHandler = function(request, sender, sendResponse) {
    if (request && request['srcFile']) {
      // TODO (clchen, deboer): Investigate this further and come up with a
      // cleaner solution. The root issue is that this should never be run on
      // the background page, but it is in the Chrome OS case.
      return;
    }
    if (request[cvox.ExtensionBridge.PONG_MSG]) {
      self.gotPongFromBackgroundPage();
    } else {
      for (var i = 0; i < self.messageListeners.length; i++) {
        self.messageListeners[i](request, cvox.ExtensionBridge.backgroundPort);
      }
    }
    sendResponse({});
  };

  // Listen to requests from the background that don't come from
  // our connection port.
  chrome.extension.onMessage.addListener(onMessageHandler);

  self.setupBackgroundPort();

  self.tryToPingBackgroundPage();
};

/**
 * Set up the connection to the background page.
 */
cvox.ExtensionBridge.setupBackgroundPort = function() {
  // Set up the connection to the background page.
  var self = cvox.ExtensionBridge;
  self.backgroundPort = chrome.extension.connect({name: self.PORT_NAME});
  self.backgroundPort.onMessage.addListener(
      function(message) {
        if (message[cvox.ExtensionBridge.PONG_MSG]) {
          self.gotPongFromBackgroundPage();
        } else {
          for (var i = 0; i < self.messageListeners.length; i++) {
            self.messageListeners[i](message, self.backgroundPort);
          }
        }
      });
  self.backgroundPort.onDisconnect.addListener(
      function(event) {
        // If we're not connected yet, don't give up - try again.
        if (!self.connected) {
          self.backgroundPort = null;
	  return;
	}

        for (var i = 0; i < self.disconnectListeners.length; i++) {
          self.disconnectListeners[i]();
        }
      });
};

/**
 * Try to ping the background page.
 */
cvox.ExtensionBridge.tryToPingBackgroundPage = function() {
  var self = cvox.ExtensionBridge;

  // If we already got a pong, great - we're done.
  if (self.connected) {
    return;
  }

  self.pingAttempts++;
  if (self.pingAttempts > 5) {
    // Could not connect after 5 ping attempts. Call the disconnect
    // handlers, which will disable ChromeVox.
    for (var i = 0; i < self.disconnectListeners.length; i++) {
      self.disconnectListeners[i]();
    }
    return;
  }

  // Send the ping.
  var msg = {};
  msg[cvox.ExtensionBridge.PING_MSG] = 1;
  if (!self.backgroundPort) {
    self.setupBackgroundPort();
  }
  self.backgroundPort.postMessage(msg);

  // Check again in 500 ms in case we get no response.
  window.setTimeout(cvox.ExtensionBridge.tryToPingBackgroundPage, 500);
};

/**
 * Got pong from the background page, now we know the connection was
 * successful.
 */
cvox.ExtensionBridge.gotPongFromBackgroundPage = function() {
  var self = cvox.ExtensionBridge;
  self.connected = true;

  while (self.queuedMessages.length > 0) {
    self.sendContentScriptToBackground(self.queuedMessages.shift());
  }
};

/**
 * Send a message from the content script to the background page.
 *
 * @param {Object} message The message to send.
 */
cvox.ExtensionBridge.sendContentScriptToBackground = function(message) {
  var self = cvox.ExtensionBridge;
  if (!self.connected) {
    // We're not connected to the background page, so queue this message
    // until we're connected.
    self.queuedMessages.push(message);
    return;
  }

  if (cvox.ExtensionBridge.backgroundPort) {
    cvox.ExtensionBridge.backgroundPort.postMessage(message);
  } else {
    chrome.extension.sendMessage(message);
  }
};

/**
 * Send a message from the background page to the content script of the
 * current selected tab.
 *
 * @param {Object} message The message to send.
 */
cvox.ExtensionBridge.sendBackgroundToContentScript = function(message) {
  chrome.tabs.query(
      {'active': true, 'lastFocusedWindow': true},
      function(tabs) {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        }
      });
};

cvox.ExtensionBridge.init();
