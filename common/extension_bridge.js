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
 * @fileoverview Bridge to aid in communication between a Chrome
 * background page and scripts injected into a page by a content script.
 *
 * This is needed when the extension's content script dynamically loads
 * most of its code by injecting script tags into the page. To communicate
 * with the background page, the page script needs to post a message that
 * the content script can listen to and then forward to the background page.
 *
 * To use cvox.ExtensionBridge, this file must be included in all three
 * contexts:
 *
 *   1. From the background page.
 *   2. From the content script (in the manifest.json after all other scripts).
 *   3. Inject it into the page from the content script.
 *
 * It automatically figures out where it's being run and initializes itself
 * appropriately. Then just call send() to send a message from the background
 * to the page or vice versa, and addMessageListener() to provide a message
 * listener.  Messages can be any object that can be serialized using JSON.
 *
 * Messages can be sent to the background page from either the page or the
 * content script, and messages sent from the background page are delivered
 * to both the content script and the page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

cvoxgoog.provide('cvox.ExtensionBridge');

cvoxgoog.require('cvox.BuildConfig');
cvoxgoog.require('cvox.ChromeVoxJSON');

if (BUILD_TYPE == BUILD_TYPE_CHROME) {
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
    self.listeners = [];

    try {
      if (chrome && chrome.windows &&
          window.location.toString().indexOf('chrome-extension://') == 0 &&
          window.location.toString().indexOf('background.html') > 0) {
        // This depends on the fact that chrome.windows is only available
        // from background pages.
        // Also, prevent initializing background specific script in
        // non-background extension pages.
        self.json = JSON;
        self.context = self.BACKGROUND;
        self.initBackground();
        return;
      } else {
        self.json = cvox.ChromeVoxJSON;
        self.context = self.PAGE;
        self.initPage();
        return;
      }
    } catch (e) {
      // Ignore exception that will be raised if we try to access
      // chrome.windows from a content script.
    }

    // TODO (clchen, dmazzoni): Find a cleaner way to get here.
    // Right now, we are relying on the fact that there will be
    // an exception thrown in the if statement to get to this
    // part of the code.
    if (chrome && chrome.extension) {
      self.json = JSON;
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
   * Constant indicating we're in a page.
   * @type {number}
   * @const
   */
  cvox.ExtensionBridge.PAGE = 2;

  /**
   * The name of the port between the content script and background page.
   * @type {string}
   * @const
   */
  cvox.ExtensionBridge.PORT_NAME = 'cvox.ExtensionBridge.Port';

  /**
   * The name of the message between the page and content script that sets
   * up the bidirectional port between them.
   * @type {string}
   * @const
   */
  cvox.ExtensionBridge.PORT_SETUP_MSG = 'cvox.ExtensionBridge.PortSetup';

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
      case self.PAGE:
        self.sendPageToContentScript(message);
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
    cvox.ExtensionBridge.listeners.push(listener);
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
      port.onMessage.addListener(function(message) {
        for (var i = 0; i < self.listeners.length; i++) {
          self.listeners[i](message, port);
        }
      });
    };

    chrome.extension.onConnect.addListener(onConnectHandler);
    chrome.extension.onConnectExternal.addListener(onConnectHandler);
  };

  /**
   * Initialize the extension bridge in a content script context, listening
   * for messages from the background page and accepting a bidirectional port
   * from the page.
   */
  cvox.ExtensionBridge.initContentScript = function() {
    var self = cvox.ExtensionBridge;

    var onRequestHandler = function(request, sender, sendResponse) {
      for (var i = 0; i < self.listeners.length; i++) {
        self.listeners[i](request, self.backgroundPort);
      }
      if (self.port) {
        self.port.postMessage(self.json.stringify(request));
      }
      sendResponse({});
    };

    // Listen to requests from the background that don't come from
    // our connection port.
    chrome.extension.onRequest.addListener(onRequestHandler);

    // Listen to events on the main window and wait for a port setup message
    // from the page to continue.
    window.addEventListener('message', function(event) {
      if (event.data == self.PORT_SETUP_MSG) {
        // Now that we have a page connection, connect to background too.
        // (Don't do this earlier, otherwise initial messages from the
        // background wouldn't make it all the way through to the page.)
        cvox.ExtensionBridge.setupBackgroundPort();

        self.port = event.ports[0];
        self.port.onmessage = function(event) {
          self.backgroundPort.postMessage(self.json.parse(event.data));
        };

        // Stop propagation if it was our message.
        event.stopPropagation();
        return false;
      }
      return true;
    }, true);
  };

  /**
   * Set up the connection to the background page.
   */
  cvox.ExtensionBridge.setupBackgroundPort = function() {
    var self = cvox.ExtensionBridge;
    self.backgroundPort = chrome.extension.connect({name: self.PORT_NAME});
    self.backgroundPort.onMessage.addListener(
        function(message) {
          for (var i = 0; i < self.listeners.length; i++) {
            self.listeners[i](message, self.backgroundPort);
          }
          if (self.port) {
            self.port.postMessage(self.json.stringify(message));
          }
        });
  };

  /**
   * Initialize the extension bridge in a page context, creating a
   * MessageChannel and sending one of the ports to the content script
   * and then listening for messages on the other port.
   */
  cvox.ExtensionBridge.initPage = function() {
    var self = cvox.ExtensionBridge;
    self.channel = new MessageChannel();

    // Note: using postMessage.apply rather than just calling postMessage
    // directly because the 3-argument form of postMessage is still in the
    // HTML5 draft.
    window.postMessage.apply(
        window, [self.PORT_SETUP_MSG, [self.channel.port2], '*']);

    self.channel.port1.onmessage = function(event) {
      for (var i = 0; i < self.listeners.length; i++) {
        self.listeners[i](self.json.parse(event.data), self.channel.port1);
      }
    };
  };

  /**
   * Send a message from the content script to the background page.
   *
   * @param {Object} message The message to send.
   */
  cvox.ExtensionBridge.sendContentScriptToBackground = function(message) {
    if (cvox.ExtensionBridge.backgroundPort) {
      cvox.ExtensionBridge.backgroundPort.postMessage(message);
    } else {
      chrome.extension.sendRequest(message);
    }
  };

  /**
   * Send a message from the background page to the content script of the
   * current selected tab.
   *
   * @param {Object} message The message to send.
   */
  cvox.ExtensionBridge.sendBackgroundToContentScript = function(message) {
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendRequest(tab.id, message, function() {});
    });
  };

  /**
   * Send a message from the current page to its content script.
   *
   * @param {Object} message The message to send.
   */
  cvox.ExtensionBridge.sendPageToContentScript = function(message) {
    cvox.ExtensionBridge.channel.port1.postMessage(
        cvox.ExtensionBridge.json.stringify(message));
  };

  cvox.ExtensionBridge.init();
} else {
  if (window.cvoxgoog == undefined) {
    cvox = {};
  }
  cvox.ExtensionBridge = function() {};
}
