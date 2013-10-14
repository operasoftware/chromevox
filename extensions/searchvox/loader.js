// Copyright 2012 Google Inc. All Rights Reserved.

goog.provide('cvox.SearchLoader');
goog.require('cvox.SearchContextMenu');

/**
 * @fileoverview Inject the script into the page.
 * @author peterxiao@google.com (Peter Xiao)
 */

/**
 * @constructor
 */
cvox.SearchLoader = function() {
};

/**
 * Called when document ready state changes.
 */
cvox.SearchLoader.onReadyStateChange = function() {
  /* Make sure document is complete. Loading base.js when the document is
   * loading will destroy the DOM. */
  if (document.readyState !== 'complete') {
    return;
  }
  var GOOGLE_HOST = 'www.google.com';
  var SEARCH_PATH = '/search';

  if (window.location.host !== GOOGLE_HOST ||
      window.location.pathname !== SEARCH_PATH) {
    return;
  }

  cvox.SearchContextMenu.init();
};

/**
 * Inject Search into the page.
 */
cvox.SearchLoader.init = function() {
  if (document.readyState !== 'complete') {
    document.onreadystatechange = cvox.SearchLoader.onReadyStateChange;
  } else {
    cvox.SearchLoader.onReadyStateChange();
  }
};
