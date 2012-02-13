// Copyright 2009 Google Inc.  All Rights Reserved.

/**
 * @fileoverview Utilities for integrating Chrome extensions i18n with
 * the translation console, and the way JSCompiler extracts and imports
 * messages into the TC.
 * @author matias@google.com (Matias Pelenur)
 */

goog.provide('goog.chrome.extensions.i18n');

goog.require('goog.json');

/**
 * Given an object with JS messages (of the form MSG_*), it produces a
 * chrome.18n.getMessage-compatible JSON representation of the messages. This
 * is supposed to be called from a localized JS messages file, to produce the
 * corresponding localized messages.JSON content for use by a Chrome extension.
 *
 * The chrome.i18n messages.json format is as follows:
 * <pre>
 * {
 *   "name": {
 *     "message": "Message text with a optional $PH_1$ placeholder(s)",
 *     "description": "Description for translators",
 *     "placeholders": {
 *       "ph_1": {
 *         "content": "Actual string that's placed within a message.",
 *         "example": "Example shown to a translator."
 *      },
 *      ...
 *   },
 *   ...
 * }
 * </pre>
 *
 * The description and example fields are optional, and not included in the
 * returned JSON object, since those are already present in the JS MSGs that
 * are exported to the TC.
 *
 * If a message needs placeholders in the JSON object, for use with parameter
 * replacement in chrome.i18n.getMessage, then standard goog.getMsg placeholders
 * should be used, and their content set to '$1', '$2', etc. This will cause
 * placeholders called $1, $2, etc to be created. For example:
 *
 * <pre>
 * msgs = {
 *   /** @ desc An example message. * /
 *   MSG_EXAMPLE_1 = goog.getMsg('Hi there.');
 *
 *   /** @ desc An example message with placeholders. * /
 *   MSG_EXAMPLE_2 = goog.getMsg('Hi, {$username}. Today is {$dayOfWeek}.',
 *       {'username': '$1', 'dayOfWeek': '$2'});
 * };
 *
 * var o = goog.chrome.extensions.i18n.messagesToJson(msgs);
 * </pre>
 *
 * @param {Object.<string>} msgs The object with the JS messages to use.
 *    You can pass 'this' to look for messages in the global scope.
 * @return {Object} the corresponding chrome.18n JSON object.
 * @see http://sites.google.com/a/chromium.org/dev/developers/design-documents/extensions/i18n.
 */
goog.chrome.extensions.i18n.messagesToJson = function(msgs) {
  var PREFIX = 'MSG_';
  var container = {};
  for (var name in msgs) {
    // Skip if the property doesn't start with the MSG_ prefix.
    if (name.indexOf(PREFIX) != 0) {
      continue;
    }

    var msg = msgs[name];
    var msgObj = {'message': msg};

    // Find any replacement placeholders ($n), and add a placeholder for them.
    var regex = /\$([1-9])/g;
    var matches = msg.match(regex);
    if (matches) {
      // Add placeholders to the msg JSON object
      var placeholders = {};
      for (var i = 1; i < matches.length + 1; i++) {
        placeholders[i] = {'content': '$' + i};
      }
      msgObj['placeholders'] = placeholders;
    }

    // Append the message object to the outer container. Remove MSG_ from the
    // name, and make it lowercase.
    var jsonName = name.slice(PREFIX.length).toLowerCase();
    container[jsonName] = msgObj;
  }

  return container;
};

/**
 * Same as messagesToJson, but returns a serialized string representation.
 *
 * @param {Object.<string>} msgs The object with the JS messages to use.
 * @return {string} the corresponding serialized chrome.18n JSON object.
 */
goog.chrome.extensions.i18n.messagesToJsonString = function(msgs) {
  return goog.json.serialize(goog.chrome.extensions.i18n.messagesToJson(msgs));
};
