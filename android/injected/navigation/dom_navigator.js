/**
 * @fileoverview DomNavigator provides a simple interface for navigating the
 *     DOM.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('navigation.DomNavigator');

/**
 * @interface
 */
navigation.DomNavigator = function() {};

navigation.DomNavigator.prototype.startExploreByTouch = function() {};

navigation.DomNavigator.prototype.stopExploreByTouch = function() {};

navigation.DomNavigator.prototype.clickCurrentFocus = function() {};

/**
 * Announce event's target as if it were focused.
 * @param {Event} event
 */
navigation.DomNavigator.prototype.announceTarget = function(event) {};

navigation.DomNavigator.prototype.nextLink = function() {};

navigation.DomNavigator.prototype.previousLink = function() {};

navigation.DomNavigator.prototype.nextEditText = function() {};

navigation.DomNavigator.prototype.previousEditText = function() {};

navigation.DomNavigator.prototype.nextJumpPoint = function() {};

navigation.DomNavigator.prototype.previousJumpPoint = function() {};

navigation.DomNavigator.prototype.nextGranularity = function() {};

navigation.DomNavigator.prototype.previousGranularity = function() {};

navigation.DomNavigator.prototype.forward = function() {};

navigation.DomNavigator.prototype.backward = function() {};

navigation.DomNavigator.prototype.stopSpeaking = function() {};

/**
 * @param {string} jumpLevel The jump level to speak.
 */
navigation.DomNavigator.prototype.speakJumpLevel = function(jumpLevel) {};
