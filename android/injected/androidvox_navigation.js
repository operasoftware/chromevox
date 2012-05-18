/**
 * @fileoverview Starts gesture navigation for AndroidVox.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('androidvoxnav');

goog.require('androidvoxnav.TouchExploreInputTranslator');
goog.require('androidvoxnav.constants');
goog.require('cvox.DomNavigator');
goog.require('navigation.gesturenav');

/**
 * Begins gesture navigation using ChromeVox to navigate.
 */
androidvoxnav.start = function() {
  androidvoxnav.constants.init();
  var domNavigator = new cvox.DomNavigator();
  var eventTranslator = new androidvoxnav.TouchExploreInputTranslator(document);
  navigation.gesturenav.start(domNavigator, eventTranslator);
};

androidvoxnav.start();
