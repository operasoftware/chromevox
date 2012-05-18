/**
 * @fileoverview Provides a simple interface for navigating the DOM through
 *     ChromeVox user commands.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('cvox.DomNavigator');

goog.require('cvox.AbstractTts');
goog.require('cvox.AndroidTts');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxUserCommands');
goog.require('navigation.DomNavigator');

/**
 * @implements {navigation.DomNavigator}
 * @constructor
 */
cvox.DomNavigator = function() {
  this.androidTts_ = new cvox.AndroidTts();
};

cvox.DomNavigator.prototype.startExploreByTouch = function() {
  cvox.ChromeVoxEventWatcher.focusFollowsMouse = true;
};

cvox.DomNavigator.prototype.stopExploreByTouch = function() {
  cvox.ChromeVoxEventWatcher.focusFollowsMouse = false;
};

cvox.DomNavigator.prototype.stopSpeaking = function() {
  this.androidTts_.stop();
};

cvox.DomNavigator.prototype.speakJumpLevel = function(
    jumpLevel) {
  this.androidTts_.speak(jumpLevel, cvox.AbstractTts.QUEUE_MODE_FLUSH, null);
};

cvox.DomNavigator.prototype.clickCurrentFocus = function() {
  cvox.ChromeVoxUserCommands.commands['forceClickOnCurrentItem']();
};

/**
 * Announce event's target as if it were focused.
 * @param {Event} event
 */
cvox.DomNavigator.prototype.announceTarget = function(event) {
  cvox.ChromeVoxEventWatcher.focusHandler(event);
};

cvox.DomNavigator.prototype.nextLink = function() {
  cvox.ChromeVoxUserCommands.commands['nextLink']();
};

cvox.DomNavigator.prototype.previousLink = function() {
  cvox.ChromeVoxUserCommands.commands['previousLink']();
};

cvox.DomNavigator.prototype.nextButton = function() {
  cvox.ChromeVoxUserCommands.commands['nextButton']();
};

cvox.DomNavigator.prototype.previousButton = function() {
  cvox.ChromeVoxUserCommands.commands['previousButton']();
};

cvox.DomNavigator.prototype.nextHeading = function() {
  cvox.ChromeVoxUserCommands.commands['nextHeading']();
};

cvox.DomNavigator.prototype.previousHeading = function() {
  cvox.ChromeVoxUserCommands.commands['previousHeading']();
};

cvox.DomNavigator.prototype.nextEditText = function() {
  cvox.ChromeVoxUserCommands.commands['nextEditText']();
};

cvox.DomNavigator.prototype.previousEditText = function() {
  cvox.ChromeVoxUserCommands.commands['previousEditText']();
};

cvox.DomNavigator.prototype.nextJumpPoint = function() {
  cvox.ChromeVoxUserCommands.commands['nextJump']();
};

cvox.DomNavigator.prototype.previousJumpPoint = function() {
  cvox.ChromeVoxUserCommands.commands['previousJump']();
};

cvox.DomNavigator.prototype.nextGranularity = function() {
  cvox.ChromeVoxUserCommands.commands['nextGranularity']();
};

cvox.DomNavigator.prototype.previousGranularity = function() {
  cvox.ChromeVoxUserCommands.commands['previousGranularity']();
};

cvox.DomNavigator.prototype.forward = function() {
  cvox.ChromeVoxUserCommands.commands['forward']();
};

cvox.DomNavigator.prototype.backward = function() {
  cvox.ChromeVoxUserCommands.commands['backward']();
};

cvox.DomNavigator.prototype.jumpToTop = function() {
  cvox.ChromeVoxUserCommands.commands['jumpToTop']();
};

cvox.DomNavigator.prototype.stopSpeech = function() {
  cvox.ChromeVoxUserCommands.commands['stopSpeech']();
};

cvox.DomNavigator.prototype.forwardInHistory = function() {
    history.go(1);
};

cvox.DomNavigator.prototype.backwardInHistory = function() {
    history.go(-1);
};
