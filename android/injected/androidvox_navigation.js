/**
 * @fileoverview Starts gesture navigation for AndroidVox.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('androidvoxnav');

goog.require('cvox.DomNavigator');
goog.require('navigation.gesturenav');

/**
 * Begins gesture navigation using ChromeVox to navigate.
 */
function start() {
  var domNavigator = new cvox.DomNavigator();
  navigation.gesturenav.start(domNavigator, document);
}

start();

