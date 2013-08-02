// Copyright 2012 Google Inc. All Rights Reserved.

goog.provide('cvox.SearchLoader');

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

  var SEARCH_FILES = [
    'closure/base.js',
    'extensions/searchvox/constants.js',
    'extensions/searchvox/util.js',
    'extensions/searchvox/abstract_result.js',
    'extensions/searchvox/results.js',
    'extensions/searchvox/search.js',
    'extensions/searchvox/search_tools.js',
    'extensions/searchvox/context_menu.js'];

  var scripts = [];
  for (var i = 0; i < SEARCH_FILES.length; i++) {
    scripts.push(cvox.ChromeVox.host.getFileSrc(SEARCH_FILES[i]));
  }

  var apiScript = cvox.ScriptInstaller.installScript(scripts,
    'searchvox', null, cvox.ApiImplementation.siteSpecificScriptBase);
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
