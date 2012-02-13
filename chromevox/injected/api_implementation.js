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
 * @fileoverview Implentation of ChromeVox's public API.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.provide('cvox.ApiImplementation');

goog.require('cvox.ChromeVox');

/**
 * @constructor
 */
cvox.ApiImplementation = function() {
};

/**
 * The URL to the script loader.
 * @type {string}
 */
cvox.ApiImplementation.siteSpecificScriptLoader;

/**
 * The URL base for the site-specific scripts.
 * @type {string}
 */
cvox.ApiImplementation.siteSpecificScriptBase;

/**
 * Inject the API into the page and set up communication with it.
 */
cvox.ApiImplementation.init = function() {
  window.addEventListener('message', cvox.ApiImplementation.portSetup, true);

  if (document.querySelector('script[cvoxapi]')) {
    // If the API script is already installed, just re-enable it.
    window.location.href = 'javascript:cvox.Api.internalEnable();';
    return;
  }

  var forceRedownload = '?' + new Date().getTime();
  var apiScript = document.createElement('script');
  apiScript.type = 'text/javascript';
  apiScript.setAttribute('cvoxapi', '1');
  apiScript.src = cvox.ChromeVox.host.getApiSrc() + forceRedownload;
  document.head.appendChild(apiScript);

  apiScript.onload = function() {
    // Load the enhancement script loader next.
    if (!document.querySelector('script[chromevoxScriptLoader]')) {
      var enhancementLoaderScript = document.createElement('script');
      enhancementLoaderScript.type = 'text/javascript';
      enhancementLoaderScript.src =
          cvox.ApiImplementation.siteSpecificScriptLoader;
      enhancementLoaderScript.setAttribute('chromevoxScriptLoader', '1');
      enhancementLoaderScript.setAttribute('chromevoxScriptBase',
          cvox.ApiImplementation.siteSpecificScriptBase);
      document.head.appendChild(enhancementLoaderScript);
    }
  };
};

/**
 * This method is called when the content script receives a message from
 * the page.
 * @param {Event} event The DOM event with the message data.
 * @return {boolean} True if default event processing should continue.
 */
cvox.ApiImplementation.portSetup = function(event) {
  if (event.data == 'cvox.PortSetup') {
    cvox.ApiImplementation.port = event.ports[0];
    cvox.ApiImplementation.port.onmessage = function(event) {
      cvox.ApiImplementation.dispatchApiMessage(
          cvox.ChromeVoxJSON.parse(event.data));
    };

    // Stop propagation since it was our message.
    event.stopPropagation();
    return false;
  }
  return true;
};

/**
 * Call the appropriate API function given a message from the page.
 */
cvox.ApiImplementation.dispatchApiMessage = function(message) {
  var method;
  switch (message['cmd']) {
    case 'speak': method = cvox.ApiImplementation.speak; break;
    case 'speakNodeRef': method = cvox.ApiImplementation.speakNodeRef; break;
    case 'stop': method = cvox.ApiImplementation.stop; break;
    case 'playEarcon': method = cvox.ApiImplementation.playEarcon; break;
    case 'syncToNodeRef': method = cvox.ApiImplementation.syncToNodeRef; break;
    case 'clickNodeRef': method = cvox.ApiImplementation.clickNodeRef; break;
    case 'getBuild': method = cvox.ApiImplementation.getBuild; break;
    case 'getVersion': method = cvox.ApiImplementation.getVersion; break;
  }
  if (!method) {
    throw 'Unknown API call: ' + message['cmd'];
  }

  method.apply(cvox.ApiImplementation, message['args']);
};

/**
 * Retrieve a node from its serializable node reference.
 *
 * @param {Object} nodeRef A serializable reference to a node.
 * @return {Node} The node on the page that this object refers to.
 */
cvox.ApiImplementation.getNodeFromRef_ = function(nodeRef) {
  if (nodeRef['id']) {
    return document.getElementById(nodeRef['id']);
  } else if (nodeRef['cvoxid']) {
    var selector = '*[cvoxid="' + nodeRef['cvoxid'] + '"]';
    var element = document.querySelector(selector);
    if (nodeRef['childIndex'] != null) {
      return element.childNodes[nodeRef['childIndex']];
    } else {
      return element;
    }
  }

  throw 'Bad node reference: ' + cvox.ChromeVoxJSON.stringify(nodeRef);
};

/**
 * Speaks the given string using the specified queueMode and properties.
 *
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode Valid modes are 0 for flush; 1 for queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ApiImplementation.speak = function(textString, queueMode, properties) {
  if (cvox.ChromeVox.isActive) {
    cvox.ChromeVox.tts.speak(textString, queueMode, properties);
  }
};

/**
 * Speaks the given node.
 *
 * @param {Object} nodeRef A serializable reference to a node.
 * @param {number=} queueMode Valid modes are 0 for flush; 1 for queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.ApiImplementation.speakNodeRef = function(nodeRef, queueMode, properties) {
  if (cvox.ChromeVox.isActive) {
    cvox.ApiImplementation.speak(
        cvox.DomUtil.getName(cvox.ApiImplementation.getNodeFromRef_(nodeRef)),
        queueMode,
        properties);
  }
};

/**
 * Stops speech.
 */
cvox.ApiImplementation.stop = function() {
  if (cvox.ChromeVox.isActive) {
    cvox.ChromeVox.tts.stop();
  }
};

/**
 * Plays the specified earcon sound.
 *
 * @param {string} earcon An earcon name.
 * Valid names are:
 *   ALERT_MODAL
 *   ALERT_NONMODAL
 *   BULLET
 *   BUSY_PROGRESS_LOOP
 *   BUSY_WORKING_LOOP
 *   BUTTON
 *   CHECK_OFF
 *   CHECK_ON
 *   COLLAPSED
 *   EDITABLE_TEXT
 *   ELLIPSIS
 *   EXPANDED
 *   FONT_CHANGE
 *   INVALID_KEYPRESS
 *   LINK
 *   LISTBOX
 *   LIST_ITEM
 *   NEW_MAIL
 *   OBJECT_CLOSE
 *   OBJECT_DELETE
 *   OBJECT_DESELECT
 *   OBJECT_OPEN
 *   OBJECT_SELECT
 *   PARAGRAPH_BREAK
 *   SEARCH_HIT
 *   SEARCH_MISS
 *   SECTION
 *   TASK_SUCCESS
 *   WRAP
 *   WRAP_EDGE
 * This list may expand over time.
 */
cvox.ApiImplementation.playEarcon = function(earcon) {
  if (cvox.ChromeVox.isActive) {
    cvox.ChromeVox.earcons.playEarconByName(earcon);
  }
};

/**
 * Synchronizes ChromeVox's internal cursor to a node by id.
 *
 * @param {Object} nodeRef A serializable reference to a node.
 * @param {boolean=} speakNode If true, speaks out the node.
 */
cvox.ApiImplementation.syncToNodeRef = function(nodeRef, speakNode) {
  var node = cvox.ApiImplementation.getNodeFromRef_(nodeRef);
  cvox.ApiImplementation.syncToNode(node, speakNode);
};

/**
 * Synchronizes ChromeVox's internal cursor to the targetNode.
 * Note that this will NOT trigger reading unless given the optional argument;
 * it is for setting the internal ChromeVox cursor so that when the user resumes
 * reading, they will be starting from a reasonable position.
 *
 * @param {Node} targetNode The node that ChromeVox should be synced to.
 * @param {boolean=} speakNode If true, speaks out the node.
 * @param {number?} opt_queueMode The queue mode to use for speaking.
 */
cvox.ApiImplementation.syncToNode = function(
    targetNode, speakNode, opt_queueMode) {
  if (!cvox.ChromeVox.isActive) {
    return;
  }

  if (opt_queueMode == undefined) {
    opt_queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;
  }

  cvox.ChromeVox.navigationManager.syncToNode(targetNode);

  if (speakNode == undefined) {
    speakNode = false;
  }

  if (speakNode) {
    var currentDesc = cvox.ChromeVox.navigationManager.getCurrentDescription();
    cvox.ChromeVox.navigationManager.speakDescriptionArray(
        currentDesc, opt_queueMode, null);
  }
};

/**
 * Simulate a click on an element.
 *
 * @param {Object} nodeRef A serializable reference to a node.
 * @param {boolean} shiftKey Specifies if shift is held down.
 */
cvox.ApiImplementation.clickNodeRef = function(nodeRef, shiftKey) {
  cvox.DomUtil.clickElem(
      cvox.ApiImplementation.getNodeFromRef_(nodeRef), shiftKey);
};

/**
 * Get the ChromeVox build info string.
 * @param {number} callbackId The callback Id.
 */
cvox.ApiImplementation.getBuild = function(callbackId) {
  cvox.ApiImplementation.port.postMessage(JSON.stringify(
      {
        'id': callbackId,
        'build': 'BUILD_TIMESTAMP_PLACEHOLDER'
      }));
};

/**
 * Get the ChromeVox version.
 * @param {number} callbackId The callback Id.
 */
cvox.ApiImplementation.getVersion = function(callbackId) {
  var version = cvox.ChromeVox.version;
  if (version == null) {
    window.setTimeout(function() {
      cvox.ApiImplementation.getVersion(callbackId);
    }, 1000);
    return;
  }
  cvox.ApiImplementation.port.postMessage(JSON.stringify(
      {
        'id': callbackId,
        'version': version
      }));
};
