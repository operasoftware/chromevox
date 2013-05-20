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
 * @fileoverview Implentation of ChromeVox's public API.
 *
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathJaxImplementation');

goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ScriptInstaller');


/**
 * @constructor
 */
cvox.MathJaxImplementation = function() {
};


/**
 * The port to communicate with the content script.
 * @type {Port}
 */
cvox.MathJaxImplementation.port = null;


/**
 * The next id to use for async callbacks.
 * @type {number}
 * @private
 */
cvox.MathJaxImplementation.nextCallbackId_ = 1;


/**
 * Map from callback ID to callback function.
 * @type {Object.<number, Function>}
 * @private
 */
cvox.MathJaxImplementation.callbackMap_ = {};


/**
 * Register a callback function in the mapping.
 * @param {Function} callback The callback function.
 * @return {number} id The new id.
 * @private
 */
cvox.MathJaxImplementation.registerCallback_ = function(callback) {
  var id = cvox.MathJaxImplementation.nextCallbackId_;
  cvox.MathJaxImplementation.nextCallbackId_++;
  cvox.MathJaxImplementation.callbackMap_[id] = callback;
  return id;
};


/**
 * Destructive Retrieval of a callback function from the mapping.
 * @param {string} idStr The id.
 * @return {Function} The callback function.
 * @private
 */
cvox.MathJaxImplementation.retrieveCallback_ = function(idStr) {
  var id = parseInt(idStr, 10);
  var callback = cvox.MathJaxImplementation.callbackMap_[id];
  if (callback) {
    delete cvox.MathJaxImplementation.callbackMap_[id];
    return callback;
  }
  return null;
};



/**
 * Initialise communication with the content script.
 */
cvox.MathJaxImplementation.init = function() {
  window.addEventListener('message',
                          cvox.MathJaxImplementation.portSetup, true);
  var scripts = new Array();
  scripts.push(cvox.ChromeVox.host.getFileSrc('chromevox/injected/mathjax.js'));
  scripts.push(cvox.ApiImplementation.siteSpecificScriptLoader);
  cvox.ScriptInstaller.installScript(
      scripts, 'mathjax', null, cvox.ApiImplementation.siteSpecificScriptBase);
};


/**
 * Destructive Retrieval of a callback function from the mapping.
 * @param {string} data The command to be sent to the content script.
 * @param {Function} callback A callback function.
 * @param {Array=} args Array of arguments.
 */
cvox.MathJaxImplementation.postMsg = function(data, callback, args) {
  args = args || [];
  var id = cvox.MathJaxImplementation.registerCallback_(callback);
  var idStr = id.toString();
  cvox.MathJaxImplementation.port.postMessage(
      {'cmd': data, 'id': idStr, 'args': JSON.stringify(args)});
};


/**
 * This method is called when the content script receives a message from
 * the page.
 * @param {Event} event The DOM event with the message data.
 * @return {boolean} True if default event processing should continue.
 */
cvox.MathJaxImplementation.portSetup = function(event) {
  if (event.data == 'cvox.MathJaxPortSetup') {
    cvox.MathJaxImplementation.port = event.ports[0];
    cvox.MathJaxImplementation.port.onmessage = function(event) {
      cvox.MathJaxImplementation.dispatchMessage(
        /** @type{{cmd: string, args: Array.<string>}} */
        (cvox.ChromeVoxJSON.parse(event.data)));
    };
    return false;
  }
  return true;
};


/**
 * Call the appropriate Cvox function dealing with MathJax return values.
 * @param {{cmd: string, args: Array.<string>}} message A message object.
 */
cvox.MathJaxImplementation.dispatchMessage = function(message) {
  var method;
  switch (message['cmd']) {
    case 'NodeMML': method = cvox.MathJaxImplementation.convertMathML; break;
    case 'Active': method = cvox.MathJaxImplementation.applyBoolean; break;
    break;
  }

  if (!method) {
    throw 'Unknown MathJax call: ' + message['cmd'];
  }
  var args = message['args'];
  var callback = cvox.MathJaxImplementation.retrieveCallback_(args[0]);
  if (callback && method) {
    method.apply(cvox.MathJaxImplementation, [callback].concat(args.slice(1)));
  }
};


/**
 * Converts a Boolean string to boolean value and applies a callback function.
 * @param {function(boolean)} callback A function with one argument.
 * @param {boolean} bool A truth value.
  */
cvox.MathJaxImplementation.applyBoolean = function(callback, bool) {
  callback(bool);
};


/**
 * True if MathJax is injected in a page.
 * @param {function(boolean)} callback A function with one argument.
 */
cvox.MathJaxImplementation.isMathjaxActive = function(callback) {
  if (cvox.MathJaxImplementation.port) {
    cvox.MathJaxImplementation.postMsg('Active', callback);
  } else {
    if (typeof(MathJax) == 'undefined') {
      callback(false);
    } else {
      callback(true);
    }
  }
};


/**
 * Converts a MathML string to a DOM node and applies a callback function.
 * @param {function(Node)} callback A function with one argument.
 * @param {string} mml The MathML string.
 * @return {Node} The DOM node.
 */
cvox.MathJaxImplementation.convertMathML = function(callback, mml) {
  if (mml) {
    var dp = new DOMParser;
    var cleanMml = mml.replace(/>\s+</g, '><');
    callback(dp.parseFromString(cleanMml, 'text/xml').firstChild);
  }
  return null;
};


// TODO (sorge) Refactor to a common util module.
/**
 * Compute the MathML representation of a MathJax element.
 * @param {Object} jax MathJax object.
 * @param {Function} fn Callback function.
 * @private
 */
cvox.MathJaxImplementation.getMathML_ = function(jax, fn) {
  try {
    var mathMl = jax.root.toMathML('');
  } catch (err) {
    // Taken and adapted from MathJax extensions/MathMenu.js
    if (!err.restart) {throw err;}
    MathJax.Callback.After([cvox.MathJaxImplementation.getMathML_, jax, fn],
                           err.restart);
  }
  MathJax.Callback(fn)(mathMl);
};


/**
 * Compute the MathML representation of current node if it is a MathJax node.
 * @param {function(Node)} callback A function with one argument.
 */
cvox.MathJaxImplementation.getMathML = function(callback) {
  if (cvox.MathJaxImplementation.port) {
    cvox.MathJaxImplementation.postMsg('NodeMML', callback);
  } else {
    var jax = MathJax.Hub.getJaxFor(
        cvox.ChromeVox.navigationManager.getCurrentNode());
    if (jax) {
      cvox.MathJaxImplementation.getMathML_(
          jax,
          function(x) {
            return cvox.MathJaxImplementation.convertMathML(callback, x);});
    }
  }
};


/**
 * Get the MathML for a Mathjax node by id.
 * @param {function(Node)} callback Callback function.
 * @param {string} id The new node id.
 */
cvox.MathJaxImplementation.getMathMLById = function(callback, id) {
  if (cvox.MathJaxImplementation.port) {
    cvox.MathJaxImplementation.postMsg('IdMML', callback, [id]);
  } else {
    var jax = MathJax.Hub.getJaxFor(
        document.getElementById(id));
    if (jax) {
      cvox.MathJaxImplementation.getMathML_(
          jax,
          function(x) {
            return cvox.MathJaxImplementation.convertMathML(callback, x);});
    }
  }
};
