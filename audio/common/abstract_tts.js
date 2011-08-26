// Copyright 2010 Google Inc.
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
 * @fileoverview Base class for Text-To-Speech-Engines.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

cvoxgoog.provide('cvox.AbstractTts');

cvoxgoog.require('cvox.AbstractLogger');



/**
 * Creates a new instance.
 * @constructor
 * @extends {cvox.AbstractLogger}
 */
cvox.AbstractTts = function() {
  //Inherit AbstractLogger
  cvox.AbstractLogger.call(this);
  this.ttsProperties = new Object();
  this.lens_ = null;
  this.lensContent_ = document.createElement('div');

  if (cvox.AbstractTts.pronunciationDictionaryRegexp == undefined) {
    // Create an expression that matches all words in the pronunciation
    // dictionary on word boundaries, ignoring case.
    var words = [];
    for (var word in cvox.AbstractTts.PRONUNCIATION_DICTIONARY) {
      words.push(word);
    }
    var expr = '\\b(' + words.join('|') + ')\\b';
    cvox.AbstractTts.pronunciationDictionaryRegexp = new RegExp(expr, 'ig');
  }

  if (cvox.AbstractTts.substitutionDictionaryRegexp == undefined) {
    // Create an expression that matches all words in the substitution
    // dictionary.
    var symbols = [];
    for (var symbol in cvox.AbstractTts.SUBSTITUTION_DICTIONARY) {
      symbols.push(symbol);
    }
    var expr = '(' + symbols.join('|') + ')';
    cvox.AbstractTts.substitutionDictionaryRegexp = new RegExp(expr, 'ig');
  }
};
cvoxgoog.inherits(cvox.AbstractTts, cvox.AbstractLogger);


/**
 * Default TTS properties for this TTS engine.
 * @type {Object}
 * @protected
 */
cvox.AbstractTts.prototype.ttsProperties;


/**
 * Override the super class method to configure logging.
 * @return {boolean} If logging is enabled.
 */
cvox.AbstractTts.prototype.logEnabled = function() {
  return cvox.AbstractTts.DEBUG;
};


/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: cvox.AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, cvox.AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.AbstractTts.prototype.speak = function(textString, queueMode, properties) {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] speak(' + textString + ', ' +
        queueMode + (properties ? ', ' + properties.toString() : '') + ')');
  }
  if (this.lens_) {
    if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
      var line = document.createElement('hr');
      this.lensContent_.appendChild(line);
    }
    // Remove elements if exceed maxHistory. Multiply by 2 to accont for <hr>.
    while (this.lensContent_.childNodes.length > this.lens_.maxHistory * 2) {
      var temp = this.lensContent_.childNodes[0];
      this.lensContent_.removeChild(temp);
    }
    var lensElem = document.createElement('span');
    lensElem.innerText = textString;
    lensElem.style.marginLeft = '0.5em !important';
    if (properties && properties[cvox.AbstractTts.COLOR]) {
      lensElem.style.color = properties[cvox.AbstractTts.COLOR] + ' !important';
    }
    if (properties && properties[cvox.AbstractTts.FONT_WEIGHT]) {
      lensElem.style.fontWeight =
          properties[cvox.AbstractTts.FONT_WEIGHT] + ' !important';
    }
    this.lensContent_.appendChild(lensElem);
    this.lens_.setLensContent(this.lensContent_);
  }
};


/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.AbstractTts.prototype.isSpeaking = function() {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] isSpeaking()');
  }
  return false;
};


/**
 * Stops speech.
 */
cvox.AbstractTts.prototype.stop = function() {
  if (this.logEnabled()) {
    this.log('[' + this.getName() + '] stop()');
  }
};


/**
 * Retrieves the default TTS properties for this TTS engine.
 * @return {Object} Default TTS properties.
 */
cvox.AbstractTts.prototype.getDefaultTtsProperties = function() {
  return this.ttsProperties;
};


/**
 * Sets the default TTS properties for this TTS engine.
 * @param {Object} ttsProperties Default TTS properties.
 */
cvox.AbstractTts.prototype.setDefaultTtsProperties = function(ttsProperties) {
  this.ttsProperties = ttsProperties;
};


/**
 * Increases a TTS speech property.
 * @param {string} property_name The name of the property to increase.
 * @param {boolean} announce Whether to announce that the property is changing.
 */
cvox.AbstractTts.prototype.increaseProperty =
    function(property_name, announce) {
  if (property_name == cvox.AbstractTts.RATE) {
    this.ttsProperties.rate = this.increasePropertyValue(
        this.ttsProperties.rate);
    if (announce) {
      this.speak(cvox.AbstractTts.str.increaseRate, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.PITCH) {
    this.ttsProperties.pitch = this.increasePropertyValue(
        this.ttsProperties.pitch);
    if (announce) {
      this.speak(cvox.AbstractTts.str.increasePitch, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.VOLUME) {
    this.ttsProperties.volume = this.increasePropertyValue(
        this.ttsProperties.volume);
    if (announce) {
      this.speak(cvox.AbstractTts.str.increaseVolume, 0, this.ttsProperties);
    }
  }
};


/**
 * Decreases a TTS speech property.
 * @param {string} property_name The name of the property to decrease.
 * @param {boolean} announce Whether to announce that the property is changing.
 */
cvox.AbstractTts.prototype.decreaseProperty =
    function(property_name, announce) {
  if (property_name == cvox.AbstractTts.RATE) {
    this.ttsProperties.rate = this.decreasePropertyValue(
        this.ttsProperties.rate);
    if (announce) {
      this.speak(cvox.AbstractTts.str.decreaseRate, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.PITCH) {
    this.ttsProperties.pitch = this.decreasePropertyValue(
        this.ttsProperties.pitch);
    if (announce) {
      this.speak(cvox.AbstractTts.str.decreasePitch, 0, this.ttsProperties);
    }
  } else if (property_name == cvox.AbstractTts.VOLUME) {
    this.ttsProperties.volume = this.decreasePropertyValue(
        this.ttsProperties.volume);
    if (announce) {
      this.speak(cvox.AbstractTts.str.decreaseVolume, 0, this.ttsProperties);
    }
  }
};


/**
 * Merges the given properties with the default ones. Always returns a
 * new object, so that you can safely modify the result of mergeProperties
 * without worrying that you're modifying an object used elsewhere.
 * @param {Object=} properties The properties to merge with the default.
 * @return {Object} The merged properties.
 */
cvox.AbstractTts.prototype.mergeProperties = function(properties) {
  var mergedProperties = new Object();
  var p;
  if (this.ttsProperties) {
    for (p in this.ttsProperties) {
      mergedProperties[p] = this.ttsProperties[p];
    }
  }
  if (properties) {
    var tts = cvox.AbstractTts;
    if (typeof(properties[tts.VOLUME]) == 'number') {
      mergedProperties[tts.VOLUME] = properties[tts.VOLUME];
    }
    if (typeof(properties[tts.PITCH]) == 'number') {
      mergedProperties[tts.PITCH] = properties[tts.PITCH];
    }
    if (typeof(properties[tts.RATE]) == 'number') {
      mergedProperties[tts.RATE] = properties[tts.RATE];
    }

    function mergeRelativeProperty(abs, rel) {
      if (typeof(properties[rel]) == 'number' &&
          typeof(mergedProperties[abs]) == 'number') {
        mergedProperties[abs] += properties[rel];
        if (mergedProperties[abs] > 1.0) {
          mergedProperties[abs] = 1.0;
        } else if (mergedProperties[abs] < 0.0) {
          mergedProperties[abs] = 0.0;
        }
      }
    }

    mergeRelativeProperty(tts.VOLUME, tts.RELATIVE_VOLUME);
    mergeRelativeProperty(tts.PITCH, tts.RELATIVE_PITCH);
    mergeRelativeProperty(tts.RATE, tts.RELATIVE_RATE);
  }

  return mergedProperties;
};


/**
 * Decrease by 0.1 the value of a TTS property that's normally in the range
 * 0.0 - 1.0, and make sure it doesn't end up smaller than 0.0. Return the
 * new value.
 * @param {number} current_value The current value of the property.
 * @return {number} The new value.
 */
cvox.AbstractTts.prototype.decreasePropertyValue = function(current_value) {
  return Math.max(0.0, current_value - 0.1);
};


/**
 * Set a chromevis.ChromeVisLens to display any messages spoken via speak().
 * @param {Object} lens The chromevis.ChromeVisLens object.
 */
cvox.AbstractTts.prototype.setLens = function(lens) {
  this.lens_ = lens;
};


/**
 * Increase by 0.1 the value of a TTS property that's normally in the range
 * 0.0 - 1.0, and make sure it doesn't end up larger than 1.0. Return the
 * new value.
 * @param {number} current_value The current value of the property.
 * @return {number} The new value.
 */
cvox.AbstractTts.prototype.increasePropertyValue = function(current_value) {
  return Math.min(1.0, current_value + 0.1);
};


/**
 * Static method to preprocess text to be spoken properly by a speech
 * engine.
 *
 * 1. Replace any single character with a description of that character.
 *
 * 2. Convert all-caps words to lowercase if they don't look like an
 *    acronym / abbreviation.
 *
 * @param {string} text A text string to be spoken.
 * @return {string} The text formatted in a way that will sound better by
 *     most speech engines.
 */
cvox.AbstractTts.preprocess = function(text) {
  // Substitute all symbols in the substitution dictionary. This is pretty
  // efficient because we use a single regexp that matches all symbols
  // simultaneously.
  text = text.replace(
      cvox.AbstractTts.substitutionDictionaryRegexp,
      function(symbol) {
        return ' ' + cvox.AbstractTts.SUBSTITUTION_DICTIONARY[symbol] + ' ';
      });

  // Handle single characters that we want to make sure we pronounce.
  if (text.length == 1) {
    switch (text) {
    case ' ': return 'space';
    case '`': return 'backtick';
    case '~': return 'tilde';
    case '!': return 'exclamation point';
    case '@': return 'at';
    case '#': return 'pound';
    case '$': return 'dollar';
    case '%': return 'percent';
    case '^': return 'caret';
    case '&': return 'ampersand';
    case '*': return 'asterisk';
    case '(': return 'open paren';
    case ')': return 'close paren';
    case '-': return 'hyphen';
    case '_': return 'underscore';
    case '=': return 'equals';
    case '+': return 'plus';
    case '[': return 'left bracket';
    case ']': return 'right bracket';
    case '{': return 'left brace';
    case '}': return 'right brace';
    case '|': return 'pipe';
    case ';': return 'semicolon';
    case ':': return 'colon';
    case ',': return 'comma';
    case '.': return 'period';
    case '<': return 'less than';
    case '>': return 'greater than';
    case '/': return 'slash';
    case '?': return 'question mark';
    case '"': return 'quote';
    case '\'': return 'single quote';
    case '\t': return 'tab';
    case '\r': return 'return';
    case '\n': return 'new line';
    case '\\': return 'backslash';
    default: return text.toUpperCase() + '.';
    }
  }

  // Substitute all words in the pronunciation dictionary. This is pretty
  // efficient because we use a single regexp that matches all words
  // simultaneously, and it calls a function with each match, which we can
  // use to look up the replacement in our dictionary.
  text = text.replace(
      cvox.AbstractTts.pronunciationDictionaryRegexp,
      function(word) {
        return cvox.AbstractTts.PRONUNCIATION_DICTIONARY[word.toLowerCase()];
      });

  // Special case for google+, where the punctuation must be pronounced.
  text = text.replace(/google\+/ig, 'google-plus');

  // Convert all-caps words to lowercase if they don't look like acronyms,
  // otherwise add a space before all-caps words so that all-caps words in
  // the middle of camelCase will be separated.
  var allCapsWords = text.match(/([A-Z]+)/g);
  if (allCapsWords) {
    for (var word, i = 0; word = allCapsWords[i]; i++) {
      var replacement;
      // If a word contains vowels and is more than 3 letters long,
      // it is probably a real word and not just an abbreviation.
      // Convert it to lower case and speak it normally.
      if ((word.length > 3) && word.match(/([AEIOUY])/g)) {
        replacement = word.toLowerCase();
      } else {
        // This regex will space out any camelCased/all CAPS words
        // so they sound better when spoken by TTS engines.
        replacement = word.replace(/([A-Z])/g, ' $1');
      }
      text = text.replace(word, replacement);
    }
  }

  //  Remove all whitespace from the beginning and end, and collapse all
  // inner strings of whitespace to a single space.
  text = text.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');

  if (text.length > 0)
    return text;
  else
    return 'blank';
};


/** TTS rate property. @type {string} */
cvox.AbstractTts.RATE = 'rate';
/** TTS pitch property. @type {string} */
cvox.AbstractTts.PITCH = 'pitch';
/** TTS volume property. @type {string} */
cvox.AbstractTts.VOLUME = 'volume';

/** TTS relative rate property. @type {string} */
cvox.AbstractTts.RELATIVE_RATE = 'relativeRate';
/** TTS relative pitch property. @type {string} */
cvox.AbstractTts.RELATIVE_PITCH = 'relativePitch';
/** TTS relative volume property. @type {string} */
cvox.AbstractTts.RELATIVE_VOLUME = 'relativeVolume';

/** TTS color property (for the lens display). @type {string} */
cvox.AbstractTts.COLOR = 'color';
/** TTS CSS font-weight property (for the lens display). @type {string} */
cvox.AbstractTts.FONT_WEIGHT = 'fontWeight';


/**
 * TTS personality for annotations - text spoken by ChromeVox that
 * doesn't come from the web page or user interface.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_ANNOTATION = {
  'relativePitch': -0.1,
  // TODO:(rshearer) Added this color change for I/O presentation.
  'color': 'yellow'
};


/**
 * TTS personality for an aside - text in parentheses.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_ASIDE = {
  'relativePitch': -0.1,
  'color': '#669'
};


/**
 * TTS personality for quoted text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_QUOTE = {
  'relativePitch': 0.1,
  'color': '#b6b',
  'fontWeight': 'bold'
};


/**
 * TTS personality for strong or bold text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_STRONG = {
  'relativePitch': 0.1,
  'color': '#b66',
  'fontWeight': 'bold'
};


/**
 * TTS personality for emphasis or italicized text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_EMPHASIS = {
  'relativeVolume': 0.1,
  'relativeRate': -0.1,
  'color': '#6bb',
  'fontWeight': 'bold'
};


/**
 * Flag indicating if the TTS is being debugged.
 * @type {boolean}
 */
cvox.AbstractTts.DEBUG = true;


/**
 * Speech queue mode that interrupts the current utterance.
 * @type {number}
 */
cvox.AbstractTts.QUEUE_MODE_FLUSH = 0;


/**
 * Speech queue mode that does not interrupt the current utterance.
 * @type {number}
 */
cvox.AbstractTts.QUEUE_MODE_QUEUE = 1;


/**
 * String constants.
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.str = {
  'increaseRate': 'increasing rate',
  'increasePitch': 'increasing pitch',
  'increaseVolume': 'increasing volume',
  'decreaseRate': 'decreasing rate',
  'decreasePitch': 'decreasing pitch',
  'decreaseVolume': 'decreasing volume'
};


/**
 * Pronunciation dictionary. Each key must be lowercase, its replacement
 * should be spelled out the way most TTS engines will pronounce it
 * correctly. This particular dictionary only handles letters and numbers,
 * no symbols.
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.PRONUNCIATION_DICTIONARY = {
  'bcc': 'B C C',
  'cc': 'C C',
  'chromevox': 'chrome-vox',
  'cr48': 'C R 48',
  'ctrl': 'control',
  'gmail': 'gee-mail',
  'gtalk': 'gee-talk',
  'http': 'H T T P',
  'igoogle': 'eye-google',
  'username': 'user-name',
  'www': 'W W W',
  'youtube': 'you-tube'
};


/**
 * Substitution dictionary. These symbols or patterns are ALWAYS substituted
 * whenever they occur, so this should be reserved only for unicode characters
 * and characters that never have any different meaning in context.
 *
 * For example, do not include '$' here because $2 should be read as
 * "two dollars".
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.SUBSTITUTION_DICTIONARY = {
  '://': 'colon slash slash',
  '\u2190': 'left arrow',
  '\u2191': 'up arrow',
  '\u2192': 'right arrow',
  '\u2193': 'down arrow',
  '\u21d0': 'left double arrow',
  '\u21d1': 'up double arrow',
  '\u21d2': 'right double  arrow',
  '\u21d3': 'down double arrow',
  '\u21e6': 'left arrow',
  '\u21e7': 'up arrow',
  '\u21e8': 'right arrow',
  '\u21e9': 'down arrow',
  '\u2303': 'control',
  '\u2318': 'command',
  '\u2325': 'option',
  '\u25b2': 'up triangle',
  '\u25b3': 'up triangle',
  '\u25b4': 'up triangle',
  '\u25b5': 'up triangle',
  '\u25b6': 'right triangle',
  '\u25b7': 'right triangle',
  '\u25b8': 'right triangle',
  '\u25b9': 'right triangle',
  '\u25ba': 'right pointer',
  '\u25bb': 'right pointer',
  '\u25bc': 'down triangle',
  '\u25bd': 'down triangle',
  '\u25be': 'down triangle',
  '\u25bf': 'down triangle',
  '\u25c0': 'left triangle',
  '\u25c1': 'left triangle',
  '\u25c2': 'left triangle',
  '\u25c3': 'left triangle',
  '\u25c4': 'left pointer',
  '\u25c5': 'left pointer',
  '\uf8ff': 'apple'
};


/**
 * Pronunciation dictionary regexp.
 * @type {RegExp};
 */
cvox.AbstractTts.pronunciationDictionaryRegexp;


/**
 * Substitution dictionary regexp.
 * @type {RegExp};
 */
cvox.AbstractTts.substitutionDictionaryRegexp;
