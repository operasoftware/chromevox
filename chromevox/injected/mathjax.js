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
 * @fileoverview Bridge to MathJax functions from the ChromeVox content script.
 *
 * @author sorge@google.com (Volker Sorge)
 */

if (typeof(goog) != 'undefined' && goog.provide) {
  goog.provide('cvox.MathJax');
}

if (typeof(goog) != 'undefined' && goog.require) {
  goog.require('cvox.Api');
}

(function() {
   /**
    * The channel between the page and content script.
    * @type {MessageChannel}
    */
   var channel_ = new MessageChannel();


   /**
    * MathJaxImplementation - this is only visible if all the scripts are
    * compiled together like in the Android case. Otherwise, implementation
    * will remain null which means communication must happen over the bridge.
    *
    * @type {*}
    */
   var implementation_ = null;
   if (typeof(cvox.MathJaxImplementation) != 'undefined') {
     implementation_ = cvox.MathJaxImplementation;
   }


   /**
    * @constructor
    */
   cvox.MathJax = function() {
   };


   /**
    * Initialises message channel in Chromevox.
    */
   cvox.MathJax.initMessage = function() {
     if (!implementation_) {
       channel_.port1.onmessage = function(evt) {
             cvox.MathJax.execMessage(evt.data);
           };
       window.postMessage('cvox.MathJaxPortSetup', [channel_.port2], '*');
     }
   };


   /**
    * Post a message to Chromevox.
    * @param {string} cmd The command to be executed in Chromevox.
    * @param {Array} args List of arguments.
    */
   cvox.MathJax.postMessage = function(cmd, args) {
     if (!implementation_) {
       channel_.port1.postMessage(
           JSON.stringify({'cmd': cmd, 'args': args}));
     } else {
       implementation_.dispatchMessage({'cmd': cmd, 'args': args});
     }
   };


   /**
    * Executes a command for an incoming message.
    * @param {{cmd: string, id: string, args: string}} msg A
    *     serializable message.
    */
   cvox.MathJax.execMessage = function(msg) {
     var args = [];
     if (msg.args) {
       args = JSON.parse(msg.args);
     }
     switch (msg.cmd) {
     case 'Active': cvox.MathJax.isActive(msg.id); break;
     case 'NodeMML': cvox.MathJax.getCurrentNodeMML(msg.id); break;
     case 'IdMML': cvox.MathJax.getNodeMMLById(msg.id, args[0]); break;
     }
   };


   // TODO (sorge) Refactor to a common util module.
   /**
    * Compute the MathML representation of a MathJax element.
    * @param {Object} jax MathJax object.
    * @param {Function} fn Callback function.
    */
   cvox.MathJax.getMathML = function(jax, fn) {
     try {
       var mathMl = jax.root.toMathML('');
     } catch (err) {
       // Taken and adapted from MathJax extensions/MathMenu.js
       if (!err.restart) {throw err;}
       MathJax.Callback.After([cvox.MathJax.getMathML, jax, fn], err.restart);
     }
     MathJax.Callback(fn)(mathMl);
   };


   /**
    * Compute the MathML representation for the current node if it is a
    * MathJax node.
    * @param {string} id A string representing the callback id.
    */
   cvox.MathJax.getCurrentNodeMML = function(id) {
     cvox.Api.getCurrentNode(
       function(node) {
         var jax = MathJax.Hub.getJaxFor(node);
         if (jax) {
           cvox.MathJax.getMathML(jax,
                                  function(x) {
                                    cvox.MathJax.postMessage(
                                      'NodeMML', [id, x]);});}});
   };



   /**
    * Compute the MathML representation for a given node id.
    * @param {string} callbackId A string representing the callback id.
    * @param {Array.<string>} nodeId A string representing the Mathjax node id.
    */
   cvox.MathJax.getNodeMMLById = function(callbackId, nodeId) {
     var node = document.getElementById(nodeId);
     if (node) {
       var jax = MathJax.Hub.getJaxFor(node);
       cvox.MathJax.getMathML(jax,
                              function(x) {
                                cvox.MathJax.postMessage(
                                    'NodeMML', [callbackId, x]);});}
   };



   /**
    * Check if MathJax is injected in the page.
    * @param {string} id A string representing the callback id.
    * @return {boolean} True if MathJax is active.
    */
   cvox.MathJax.isActive = function(id) {
     if (typeof(MathJax) == 'undefined') {
       cvox.MathJax.postMessage('Active', [id, false]);
     } else {
       cvox.MathJax.postMessage('Active', [id, true]);
     }
   };

   // Initializing the bridge.
   cvox.MathJax.initMessage();

})();
