// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview A wrapper for the Javascript messages file
 * to work in Rhino for BUILD rules.
 *
 * Copied from //quality/findy/google_chrome/i18n_messages_wrapper.js
 *
 * @author deboer@google.com (James deBoer)
 */

goog.require('goog.chrome.extensions.i18n');

print(goog.chrome.extensions.i18n.messagesToJsonString(msgs));
