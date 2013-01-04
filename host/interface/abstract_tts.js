// Copyright 2012 Google Inc.
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
 * @fileoverview Base class for Text-to-Speech engines that actually transform
 * text to speech.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractTts');

goog.require('cvox.TtsInterface');

/**
 * Creates a new instance.
 * @constructor
 * @implements {cvox.TtsInterface}
 */
cvox.AbstractTts = function() {
  this.ttsProperties = new Object();

  /** @private */

  if (cvox.AbstractTts.pronunciationDictionaryRegexp_ == undefined) {
    // Create an expression that matches all words in the pronunciation
    // dictionary on word boundaries, ignoring case.
    var words = [];
    for (var word in cvox.AbstractTts.PRONUNCIATION_DICTIONARY) {
      words.push(word);
    }
    var expr = '\\b(' + words.join('|') + ')\\b';
    cvox.AbstractTts.pronunciationDictionaryRegexp_ = new RegExp(expr, 'ig');
  }

  if (cvox.AbstractTts.substitutionDictionaryRegexp_ == undefined) {
    // Create an expression that matches all words in the substitution
    // dictionary.
    var symbols = [];
    for (var symbol in cvox.AbstractTts.SUBSTITUTION_DICTIONARY) {
      symbols.push(symbol);
    }
    var expr = '(' + symbols.join('|') + ')';
    cvox.AbstractTts.substitutionDictionaryRegexp_ = new RegExp(expr, 'ig');
  }
};


/**
 * Default TTS properties for this TTS engine.
 * @type {Object}
 * @protected
 */
cvox.AbstractTts.prototype.ttsProperties;


/**
 * Min value for TTS properties. Note that these might be different
 * on different host platforms (like Chrome, Android, etc.).
 * @type {Object.<string, number>}
 **/
cvox.AbstractTts.prototype.propertyMin = {
  'rate': 0.0,
  'pitch': 0.0,
  'volume': 0.0
};

/**
 * Max value for TTS properties. Note that these might be different
 * on different host platforms (like Chrome, Android, etc.).
 * @type {Object.<string, number>}
 **/
cvox.AbstractTts.prototype.propertyMax = {
  'rate': 1.0,
  'pitch': 1.0,
  'volume': 1.0
};

/**
 * Step value for TTS properties. Note that these might be different
 * on different host platforms (like Chrome, Android, etc.).
 * @type {Object.<string, number>}
 **/
cvox.AbstractTts.prototype.propertyStep = {
  'rate': 0.1,
  'pitch': 0.1,
  'volume': 0.1
};


/** @override */
cvox.AbstractTts.prototype.speak = function(textString, queueMode, properties) {
  return this;
};


/** @override */
cvox.AbstractTts.prototype.isSpeaking = function() {
  return false;
};


/** @override */
cvox.AbstractTts.prototype.stop = function() {
};


/** @override */
cvox.AbstractTts.prototype.increaseOrDecreaseProperty =
    function(propertyName, increase) {
  var min = this.propertyMin[propertyName];
  var max = this.propertyMax[propertyName];
  var step = this.propertyStep[propertyName];
  var current = this.ttsProperties[propertyName];
  current = increase ? current + step : current - step;
  this.ttsProperties[propertyName] = Math.max(Math.min(current, max), min);
};


/**
 * Merges the given properties with the default ones. Always returns a
 * new object, so that you can safely modify the result of mergeProperties
 * without worrying that you're modifying an object used elsewhere.
 * @param {Object=} properties The properties to merge with the default.
 * @return {Object} The merged properties.
 * @protected
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
    if (typeof(properties[tts.LANG]) == 'string') {
      mergedProperties[tts.LANG] = properties[tts.LANG];
    }

    var context = this;
    function mergeRelativeProperty(abs, rel) {
      if (typeof(properties[rel]) == 'number' &&
          typeof(mergedProperties[abs]) == 'number') {
        mergedProperties[abs] += properties[rel];
        var min = context.propertyMin[abs];
        var max = context.propertyMax[abs];
        if (mergedProperties[abs] > max) {
          mergedProperties[abs] = max;
        } else if (mergedProperties[abs] < min) {
          mergedProperties[abs] = min;
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
 * Method that cycles among the available punctuation levels.
 * @return {string} The resulting punctuation level message id.
 */
cvox.AbstractTts.cyclePunctuationLevel = function() {
  cvox.AbstractTts.currentPunctuationLevel_ =
      (cvox.AbstractTts.currentPunctuationLevel_ + 1) %
          cvox.AbstractTts.punctuationLevels_.length;
  return cvox.AbstractTts.punctuationLevels_[
      cvox.AbstractTts.currentPunctuationLevel_].msg;
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
 * @private
 */
cvox.AbstractTts.preprocess_ = function(text) {
  // Substitute all symbols in the substitution dictionary. This is pretty
  // efficient because we use a single regexp that matches all symbols
  // simultaneously.
  text = text.replace(
      cvox.AbstractTts.substitutionDictionaryRegexp_,
      function(symbol) {
        return ' ' + cvox.AbstractTts.SUBSTITUTION_DICTIONARY[symbol] + ' ';
      });

  // Handle single characters that we want to make sure we pronounce.
  if (text.length == 1) {
    return cvox.AbstractTts.CHARACTER_DICTIONARY[text] ||
          text.toUpperCase() + '.';
  }

  // Substitute all words in the pronunciation dictionary. This is pretty
  // efficient because we use a single regexp that matches all words
  // simultaneously, and it calls a function with each match, which we can
  // use to look up the replacement in our dictionary.
  text = text.replace(
      cvox.AbstractTts.pronunciationDictionaryRegexp_,
      function(word) {
        return cvox.AbstractTts.PRONUNCIATION_DICTIONARY[word.toLowerCase()];
      });

  // Special case for google+, where the punctuation must be pronounced.
  text = text.replace(/google\+/ig, 'google plus');

  text = text.replace(
      cvox.AbstractTts.repetitionRegexp_, cvox.AbstractTts.repetitionReplace_);

  var pL = cvox.AbstractTts.punctuationLevels_[
      cvox.AbstractTts.currentPunctuationLevel_];
  text = text.replace(pL.regexp,
      cvox.AbstractTts.createPunctuationReplace_(pL.clear));

  // If there's no lower case letters, and at least two spaces, skip spacing
  // text.
  var skipSpacing = false;
  if (!text.match(/[a-z]+/) && text.indexOf(' ') != text.lastIndexOf(' ')) {
    skipSpacing = true;
  }

  // Convert all-caps words to lowercase if they don't look like acronyms,
  // otherwise add a space before all-caps words so that all-caps words in
  // the middle of camelCase will be separated.
  text = text.replace(/[A-Z]+/g, function(word) {
    // If a word contains vowels and is more than 3 letters long, it is
    // probably a real word and not just an abbreviation. Convert it to lower
    // case and speak it normally.
    if ((word.length > 3) && word.match(/([AEIOUY])/g)) {
      return word.toLowerCase();
    } else if (!skipSpacing) {
      // Builds spaced-out camelCased/all CAPS words so they sound better when
      // spoken by TTS engines.
      return ' ' + word.split('').join(' ');
    } else {
      return word;
    }
  });

  //  Remove all whitespace from the beginning and end, and collapse all
  // inner strings of whitespace to a single space.
  text = text.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');

  return text;
};


/**
 * Static method to preprocess text to be spoken properly by a speech
 * engine.
 *
 * Same as above, but also allows the caller to receive information about how
 * to speak the processed string.
 *
 * @param {string} text A text string to be spoken.
 * @param {Object= } properties Out parameter populated with how to speak the
 *     string.
 * @return {string} The text formatted in a way that will sound better by
 *     most speech engines.
 * @protected
 */
cvox.AbstractTts.preprocessWithProperties = function(text, properties) {
  if (text.length == 1 && text >= 'A' && text <= 'Z') {
    for (var prop in cvox.AbstractTts.PERSONALITY_CAPITAL)
      properties[prop] = cvox.AbstractTts.PERSONALITY_CAPITAL[prop];
  }

  if (properties && properties[cvox.AbstractTts.PUNCTUATION_LEVEL]) {
    for (var i = 0, pL; pL = cvox.AbstractTts.punctuationLevels_[i]; i++) {
      if (properties[cvox.AbstractTts.PUNCTUATION_LEVEL] == pL.name) {
        cvox.AbstractTts.currentPunctuationLevel_ = i;
        break;
      }
    }
  }

  return cvox.AbstractTts.preprocess_(text);
};


/** TTS rate property. @type {string} */
cvox.AbstractTts.RATE = 'rate';
/** TTS pitch property. @type {string} */
cvox.AbstractTts.PITCH = 'pitch';
/** TTS volume property. @type {string} */
cvox.AbstractTts.VOLUME = 'volume';
/** TTS language property. @type {string} */
cvox.AbstractTts.LANG = 'lang';

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

/** TTS punctuation-level property. @type {string} */
cvox.AbstractTts.PUNCTUATION_LEVEL = 'punctuationLevel';

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
 * TTS personality for capital letters.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_CAPITAL = {
  'relativePitch': 0.6
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
 * Character dictionary. These symbols are replaced with their human readable
 * equivalents. This replacement only occurs for single character utterances.
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.CHARACTER_DICTIONARY = {
  ' ': 'space',
  '`': 'backtick',
  '~': 'tilde',
  '!': 'exclamation point',
  '@': 'at',
  '#': 'pound',
  '$': 'dollar',
  '%': 'percent',
  '^': 'caret',
  '&': 'ampersand',
  '*': 'asterisk',
  '(': 'open paren',
  ')': 'close paren',
  '-': 'hyphen',
  '_': 'underscore',
  '=': 'equals',
  '+': 'plus',
  '[': 'left bracket',
  ']': 'right bracket',
  '{': 'left brace',
  '}': 'right brace',
  '|': 'pipe',
  ';': 'semicolon',
  ':': 'colon',
  ',': 'comma',
  '.': 'period',
  '<': 'less than',
  '>': 'greater than',
  '/': 'slash',
  '?': 'question mark',
  '"': 'quote',
  '\'': 'single quote',
  '\t': 'tab',
  '\r': 'return',
  '\n': 'new line',
  '\\': 'backslash'
};


/**
 * Pronunciation dictionary. Each key must be lowercase, its replacement
 * should be spelled out the way most TTS engines will pronounce it
 * correctly. This particular dictionary only handles letters and numbers,
 * no symbols.
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.PRONUNCIATION_DICTIONARY = {
  'admob': 'ad-mob',
  'adsense': 'ad-sense',
  'adwords': 'ad-words',
  'angularjs': 'angular j s',
  'bcc': 'B C C',
  'cc': 'C C',
  'chromevox': 'chrome vox',
  'cr48': 'C R 48',
  'ctrl': 'control',
  'doubleclick': 'double-click',
  'gmail': 'gee mail',
  'gtalk': 'gee talk',
  'http': 'H T T P',
  'https' : 'H T T P S',
  'igoogle': 'eye google',
  'pagerank': 'page-rank',
  'username': 'user-name',
  'www': 'W W W',
  'youtube': 'you tube'
};


/**
 * Pronunciation dictionary regexp.
 * @type {RegExp};
 * @private
 */
cvox.AbstractTts.pronunciationDictionaryRegexp_;


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
  '\u00bc': 'one fourth',
  '\u00bd': 'one half',
  '\u200e': 'left to right mark',
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
 * Substitution dictionary regexp.
 * @type {RegExp};
 * @private
 */
cvox.AbstractTts.substitutionDictionaryRegexp_;


/**
 * repetition filter regexp.
 * @type {RegExp}
 * @private
 */
cvox.AbstractTts.repetitionRegexp_ =
    /([-\/\\|!@#$%^&*\(\)=_+\[\]\{\}.?;'":<>])\1{2,}/g;


/**
 * Constructs a description of a repeated character. Use as a param to
 * string.replace.
 * @param {string} match The matching string.
 * @return {string} The description.
 * @private
 */
cvox.AbstractTts.repetitionReplace_ = function(match) {
  var count = match.length;
  return count + ' ' + cvox.AbstractTts.CHARACTER_DICTIONARY[match[0]];
};


/**
 * Constructs a function for string.replace that handles description of a
 *  punctuation character.
 * @param {boolean} clear Whether we want to use whitespace in place of match.
 * @return {function(string): string} The replacement function.
 * @private
 */
cvox.AbstractTts.createPunctuationReplace_ = function(clear) {
  return function(match) {
    var retain = cvox.AbstractTts.retainPunctuation_.indexOf(match) != -1 ?
        match : ' ';
    return clear ? retain :
        ' ' + cvox.AbstractTts.CHARACTER_DICTIONARY[match] + retain + ' ';
  }
};


/**
 * @type {!Array.<{name:(string),
 * msg:(string),
 * regexp:(RegExp),
 * clear:(boolean)}>}
 * @private
 */
cvox.AbstractTts.punctuationLevels_ = [
  /**
   * Punctuation belonging to the 'none' level.
   */
  {
    name: 'none',
    msg: 'no_punctuation',
    regexp: /[-$#"()*;:<>\n\\\/+='~`@_]/g,
    clear: true
  },

  /**
   * Punctuation belonging to the 'some' level.
   */
  {
    name: 'some',
    msg: 'some_punctuation',
    regexp: /[-$#"()*:<>\\\/+=~`%]/g,
    clear: false
  },

  /**
   * Punctuation belonging to the 'all' level.
   */
  {
    name: 'all',
    msg: 'all_punctuation',
    regexp: /[-$#"()*;:<>\n\\\/+='~`!@_.,?%]/g,
    clear: false
  }
];

/**
 * A list of punctuation characters that should always be spliced into output
 * even with literal word substitutions.
 * This is important for tts prosity.
 * @type {!Array.<string>}
 * @private
 */
cvox.AbstractTts.retainPunctuation_ = ['.', ',', ';', '?', '!', '\''];


/**
 * @type {number}'
 @private
 */
cvox.AbstractTts.currentPunctuationLevel_ = 1;
