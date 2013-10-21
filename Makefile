
# Copyright 2012 Google Inc. All Rights Reserved.
#
# ChromeVox requires the closure compiler and the rhino JS intepreter.
#


CLOSURE_ROOT=/usr/local/lib/closure

# On Debian, rhino is available through apt-get.
RHINO=rhino


# The closure compiler is available at http://code.google.com/closure/compiler/
CLOSURE_COMPILER=java -jar $(CLOSURE_ROOT)/compiler.jar --manage_closure_dependencies

# The closure DepsWriter, available at
#     http://code.google.com/closure/library/docs/depswriter.html
DEPSWRITER=python $(CLOSURE_ROOT)/depswriter.py

#######################################



deps.js: .FORCE
	@echo Building Javascript dependencies deps.js
	@$(DEPSWRITER) --root_with_prefix=". ../" >deps.js


.FORCE:

CHROMEVOX_manifest_manifest_gen_passthru_SRCS = chromevox/manifest_compiled.json
CHROMEVOX_manifest_manifest_gen_passthru_FILES = chromevox/manifest_compiled_manifest/manifest.json
chromevox/manifest_compiled_manifest/manifest.json: $(CHROMEVOX_manifest_manifest_gen_passthru_SRCS)
	@echo Generating file chromevox/manifest_compiled_manifest/manifest.json
	@mkdir -p $(dir chromevox/manifest_compiled_manifest/manifest.json)
	@cat $< >$@


CHROMEVOX_manifest_compiled_manifest/manifest.json_FILES = $(CHROMEVOX_manifest_manifest_gen_passthru_FILES)
CLOSURE_base_FILES = closure/base.js

CHROMEVOX_MESSAGES_messages_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_MESSAGES_messages_SRCS = chromevox/messages/messages.js
CHROMEVOX_MESSAGES_messages_FILES = $(CHROMEVOX_MESSAGES_messages_DEPS) $(CHROMEVOX_MESSAGES_messages_SRCS)

CLOSURE_JSON_json_FILES = external/closure_json_json.js

CHROME_extensions_i18n_DEPS = $(CLOSURE_JSON_json_FILES) $(CLOSURE_base_FILES)
CHROME_extensions_i18n_SRCS = external/extensions_i18n.js
CHROME_extensions_i18n_FILES = $(CHROME_extensions_i18n_DEPS) $(CHROME_extensions_i18n_SRCS)

CHROME_messages_wrapper_DEPS = $(CLOSURE_base_FILES) $(CHROME_extensions_i18n_FILES)
CHROME_messages_wrapper_SRCS = external/messages_wrapper.js
CHROME_messages_wrapper_FILES = $(CHROME_messages_wrapper_DEPS) $(CHROME_messages_wrapper_SRCS)

CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_DEPS = $(CHROMEVOX_MESSAGES_messages_FILES) $(CHROME_messages_wrapper_FILES)
CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_FILES = $(CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_DEPS)

CHROMEVOX_MESSAGES_i18n_messages_localized__en_DEPS = $(CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_FILES)
chromevox/messages/i18n_messages_localized__en.js_FILES = chromevox/messages/i18n_messages_localized__en.js
chromevox/messages/i18n_messages_localized__en.js: $(CHROMEVOX_MESSAGES_i18n_messages_localized__en_DEPS)
	@echo Building Javascript binary chromevox/messages/i18n_messages_localized__en.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromevox/messages/i18n_messages_localized__en.js


CHROMEVOX_MESSAGES_i18n_messages_localized__en.js_FILES = chromevox/messages/i18n_messages_localized__en.js
CHROMEVOX_MESSAGES_messages_en.json_SRCS = $(CHROMEVOX_MESSAGES_i18n_messages_localized__en.js_FILES)
CHROMEVOX_MESSAGES_messages_en.json_FILES = chromevox/messages/_locales/en/messages.json
chromevox/messages/_locales/en/messages.json: $(CHROMEVOX_MESSAGES_messages_en.json_SRCS)
	@echo Generating file chromevox/messages/_locales/en/messages.json
	@mkdir -p $(dir chromevox/messages/_locales/en/messages.json)
	@$(RHINO) $(CHROMEVOX_MESSAGES_messages_en.json_SRCS) > $(CHROMEVOX_MESSAGES_messages_en.json_FILES)


CHROMEVOX_MESSAGES__locales/en/messages.json_FILES = $(CHROMEVOX_MESSAGES_messages_en.json_FILES)
CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES = $(CHROMEVOX_MESSAGES__locales/en/messages.json_FILES)
CHROMEVOX_MESSAGES_i18n_messages_filegroup: $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES)

HOST_INTERFACE_abstract_msgs_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_msgs_SRCS = host/interface/abstract_msgs.js
HOST_INTERFACE_abstract_msgs_FILES = $(HOST_INTERFACE_abstract_msgs_DEPS) $(HOST_INTERFACE_abstract_msgs_SRCS)

COMMON_chromevox_DEPS = $(CLOSURE_base_FILES)
COMMON_chromevox_SRCS = common/chromevox.js
COMMON_chromevox_FILES = $(COMMON_chromevox_DEPS) $(COMMON_chromevox_SRCS)

COMMON_cursor_DEPS = $(CLOSURE_base_FILES)
COMMON_cursor_SRCS = common/cursor.js
COMMON_cursor_FILES = $(COMMON_cursor_DEPS) $(COMMON_cursor_SRCS)

CLOSURE_DEBUG_error_DEPS = $(CLOSURE_base_FILES)
CLOSURE_DEBUG_error_SRCS = external/closure_debug_error.js
CLOSURE_DEBUG_error_FILES = $(CLOSURE_DEBUG_error_DEPS) $(CLOSURE_DEBUG_error_SRCS)

CLOSURE_DOM_nodetype_DEPS = $(CLOSURE_base_FILES)
CLOSURE_DOM_nodetype_SRCS = external/closure_dom_nodetype.js
CLOSURE_DOM_nodetype_FILES = $(CLOSURE_DOM_nodetype_DEPS) $(CLOSURE_DOM_nodetype_SRCS)

CLOSURE_STRING_string_DEPS = $(CLOSURE_base_FILES)
CLOSURE_STRING_string_SRCS = external/closure_string_string.js
CLOSURE_STRING_string_FILES = $(CLOSURE_STRING_string_DEPS) $(CLOSURE_STRING_string_SRCS)

CLOSURE_ASSERTS_asserts_DEPS = $(CLOSURE_DEBUG_error_FILES) $(CLOSURE_DOM_nodetype_FILES) $(CLOSURE_STRING_string_FILES) $(CLOSURE_base_FILES)
CLOSURE_ASSERTS_asserts_SRCS = external/closure_asserts_asserts.js
CLOSURE_ASSERTS_asserts_FILES = $(CLOSURE_ASSERTS_asserts_DEPS) $(CLOSURE_ASSERTS_asserts_SRCS)

CLOSURE_ARRAY_array_DEPS = $(CLOSURE_ASSERTS_asserts_FILES) $(CLOSURE_base_FILES)
CLOSURE_ARRAY_array_SRCS = external/closure_array_array.js
CLOSURE_ARRAY_array_FILES = $(CLOSURE_ARRAY_array_DEPS) $(CLOSURE_ARRAY_array_SRCS)

CLOSURE_MATH_math_DEPS = $(CLOSURE_ARRAY_array_FILES) $(CLOSURE_ASSERTS_asserts_FILES) $(CLOSURE_base_FILES)
CLOSURE_MATH_math_SRCS = external/closure_math_math.js
CLOSURE_MATH_math_FILES = $(CLOSURE_MATH_math_DEPS) $(CLOSURE_MATH_math_SRCS)

CLOSURE_I18N_compactnumberformatsymbols_DEPS = $(CLOSURE_base_FILES)
CLOSURE_I18N_compactnumberformatsymbols_SRCS = external/closure_i18n_compactnumberformatsymbols.js
CLOSURE_I18N_compactnumberformatsymbols_FILES = $(CLOSURE_I18N_compactnumberformatsymbols_DEPS) $(CLOSURE_I18N_compactnumberformatsymbols_SRCS)

CLOSURE_I18N_currency_DEPS = $(CLOSURE_base_FILES)
CLOSURE_I18N_currency_SRCS = external/closure_i18n_currency.js
CLOSURE_I18N_currency_FILES = $(CLOSURE_I18N_currency_DEPS) $(CLOSURE_I18N_currency_SRCS)

CLOSURE_I18N_numberformatsymbols_DEPS = $(CLOSURE_base_FILES)
CLOSURE_I18N_numberformatsymbols_SRCS = external/closure_i18n_numberformatsymbols.js
CLOSURE_I18N_numberformatsymbols_FILES = $(CLOSURE_I18N_numberformatsymbols_DEPS) $(CLOSURE_I18N_numberformatsymbols_SRCS)

CLOSURE_I18N_numberformat_DEPS = $(CLOSURE_ASSERTS_asserts_FILES) $(CLOSURE_MATH_math_FILES) $(CLOSURE_base_FILES) $(CLOSURE_I18N_compactnumberformatsymbols_FILES) $(CLOSURE_I18N_currency_FILES) $(CLOSURE_I18N_numberformatsymbols_FILES)
CLOSURE_I18N_numberformat_SRCS = external/closure_i18n_numberformat.js
CLOSURE_I18N_numberformat_FILES = $(CLOSURE_I18N_numberformat_DEPS) $(CLOSURE_I18N_numberformat_SRCS)

CLOSURE_I18N_ordinalrules_DEPS = $(CLOSURE_base_FILES)
CLOSURE_I18N_ordinalrules_SRCS = external/closure_i18n_ordinalrules.js
CLOSURE_I18N_ordinalrules_FILES = $(CLOSURE_I18N_ordinalrules_DEPS) $(CLOSURE_I18N_ordinalrules_SRCS)

CLOSURE_I18N_pluralrules_DEPS = $(CLOSURE_base_FILES)
CLOSURE_I18N_pluralrules_SRCS = external/closure_i18n_pluralrules.js
CLOSURE_I18N_pluralrules_FILES = $(CLOSURE_I18N_pluralrules_DEPS) $(CLOSURE_I18N_pluralrules_SRCS)

CLOSURE_I18N_messageformat_DEPS = $(CLOSURE_ASSERTS_asserts_FILES) $(CLOSURE_base_FILES) $(CLOSURE_I18N_numberformat_FILES) $(CLOSURE_I18N_ordinalrules_FILES) $(CLOSURE_I18N_pluralrules_FILES)
CLOSURE_I18N_messageformat_SRCS = external/closure_i18n_messageformat.js
CLOSURE_I18N_messageformat_FILES = $(CLOSURE_I18N_messageformat_DEPS) $(CLOSURE_I18N_messageformat_SRCS)

HOST_INTERFACE_tts_interface_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_tts_interface_SRCS = host/interface/tts_interface.js
HOST_INTERFACE_tts_interface_FILES = $(HOST_INTERFACE_tts_interface_DEPS) $(HOST_INTERFACE_tts_interface_SRCS)

HOST_INTERFACE_abstract_tts_DEPS = $(CLOSURE_I18N_messageformat_FILES) $(CLOSURE_base_FILES) $(HOST_INTERFACE_tts_interface_FILES)
HOST_INTERFACE_abstract_tts_SRCS = host/interface/abstract_tts.js
HOST_INTERFACE_abstract_tts_FILES = $(HOST_INTERFACE_abstract_tts_DEPS) $(HOST_INTERFACE_abstract_tts_SRCS)

HOST_INTERFACE_abstract_earcons_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_earcons_SRCS = host/interface/abstract_earcons.js
HOST_INTERFACE_abstract_earcons_FILES = $(HOST_INTERFACE_abstract_earcons_DEPS) $(HOST_INTERFACE_abstract_earcons_SRCS)

COMMON_node_state_DEPS = $(CLOSURE_base_FILES)
COMMON_node_state_SRCS = common/node_state.js
COMMON_node_state_FILES = $(COMMON_node_state_DEPS) $(COMMON_node_state_SRCS)

COMMON_aria_util_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(COMMON_chromevox_FILES) $(COMMON_node_state_FILES)
COMMON_aria_util_SRCS = common/aria_util.js
COMMON_aria_util_FILES = $(COMMON_aria_util_DEPS) $(COMMON_aria_util_SRCS)

COMMON_dom_predicates_DEPS = $(CLOSURE_base_FILES)
COMMON_dom_predicates_SRCS = common/dom_predicates.js
COMMON_dom_predicates_FILES = $(COMMON_dom_predicates_DEPS) $(COMMON_dom_predicates_SRCS)

COMMON_xpath_util_DEPS = $(CLOSURE_base_FILES)
COMMON_xpath_util_SRCS = common/xpath_util.js
COMMON_xpath_util_FILES = $(COMMON_xpath_util_DEPS) $(COMMON_xpath_util_SRCS)

COMMON_dom_util_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_predicates_FILES) $(COMMON_node_state_FILES) $(COMMON_xpath_util_FILES)
COMMON_dom_util_SRCS = common/dom_util.js
COMMON_dom_util_FILES = $(COMMON_dom_util_DEPS) $(COMMON_dom_util_SRCS)

COMMON_selection_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_xpath_util_FILES)
COMMON_selection_util_SRCS = common/selection_util.js
COMMON_selection_util_FILES = $(COMMON_selection_util_DEPS) $(COMMON_selection_util_SRCS)

COMMON_traverse_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_FILES) $(COMMON_dom_predicates_FILES) $(COMMON_dom_util_FILES)
COMMON_traverse_util_SRCS = common/traverse_util.js
COMMON_traverse_util_FILES = $(COMMON_traverse_util_DEPS) $(COMMON_traverse_util_SRCS)

COMMON_cursor_selection_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_util_FILES)
COMMON_cursor_selection_SRCS = common/cursor_selection.js
COMMON_cursor_selection_FILES = $(COMMON_cursor_selection_DEPS) $(COMMON_cursor_selection_SRCS)

COMMON_platform_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES)
COMMON_platform_util_SRCS = common/platform_util.js
COMMON_platform_util_FILES = $(COMMON_platform_util_DEPS) $(COMMON_platform_util_SRCS)

COMMON_spannable_DEPS = $(CLOSURE_base_FILES)
COMMON_spannable_SRCS = common/spannable.js
COMMON_spannable_FILES = $(COMMON_spannable_DEPS) $(COMMON_spannable_SRCS)

COMMON_nav_braille_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_platform_util_FILES) $(COMMON_spannable_FILES)
COMMON_nav_braille_SRCS = common/nav_braille.js
COMMON_nav_braille_FILES = $(COMMON_nav_braille_DEPS) $(COMMON_nav_braille_SRCS)

HOST_CHROME_braille_key_types_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES)
HOST_CHROME_braille_key_types_SRCS = host/chrome/braille_key_types.js
HOST_CHROME_braille_key_types_FILES = $(HOST_CHROME_braille_key_types_DEPS) $(HOST_CHROME_braille_key_types_SRCS)

HOST_INTERFACE_braille_interface_DEPS = $(CLOSURE_base_FILES) $(COMMON_nav_braille_FILES) $(HOST_CHROME_braille_key_types_FILES)
HOST_INTERFACE_braille_interface_SRCS = host/interface/braille_interface.js
HOST_INTERFACE_braille_interface_FILES = $(HOST_INTERFACE_braille_interface_DEPS) $(HOST_INTERFACE_braille_interface_SRCS)

HOST_INTERFACE_abstract_braille_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_braille_interface_FILES)
HOST_INTERFACE_abstract_braille_SRCS = host/interface/abstract_braille.js
HOST_INTERFACE_abstract_braille_FILES = $(HOST_INTERFACE_abstract_braille_DEPS) $(HOST_INTERFACE_abstract_braille_SRCS)

HOST_INTERFACE_abstract_host_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_host_SRCS = host/interface/abstract_host.js
HOST_INTERFACE_abstract_host_FILES = $(HOST_INTERFACE_abstract_host_DEPS) $(HOST_INTERFACE_abstract_host_SRCS)

HOST_INTERFACE_mathjax_interface_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_mathjax_interface_SRCS = host/interface/mathjax_interface.js
HOST_INTERFACE_mathjax_interface_FILES = $(HOST_INTERFACE_mathjax_interface_DEPS) $(HOST_INTERFACE_mathjax_interface_SRCS)

HOST_INTERFACE_abstract_mathjax_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_mathjax_interface_FILES)
HOST_INTERFACE_abstract_mathjax_SRCS = host/interface/abstract_mathjax.js
HOST_INTERFACE_abstract_mathjax_FILES = $(HOST_INTERFACE_abstract_mathjax_DEPS) $(HOST_INTERFACE_abstract_mathjax_SRCS)

HOST_INTERFACE_host_factory_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_braille_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_abstract_mathjax_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_abstract_tts_FILES)
HOST_INTERFACE_host_factory_SRCS = host/interface/host_factory.js
HOST_INTERFACE_host_factory_FILES = $(HOST_INTERFACE_host_factory_DEPS) $(HOST_INTERFACE_host_factory_SRCS)

HOST_CHROME_msgs_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_CHROME_msgs_SRCS = host/chrome/msgs.js
HOST_CHROME_msgs_FILES = $(HOST_CHROME_msgs_DEPS) $(HOST_CHROME_msgs_SRCS)

CHROMEVOX_INJECTED_console_tts_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_tts_interface_FILES)
CHROMEVOX_INJECTED_console_tts_SRCS = chromevox/injected/console_tts.js
CHROMEVOX_INJECTED_console_tts_FILES = $(CHROMEVOX_INJECTED_console_tts_DEPS) $(CHROMEVOX_INJECTED_console_tts_SRCS)

COMMON_composite_tts_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_tts_interface_FILES)
COMMON_composite_tts_SRCS = common/composite_tts.js
COMMON_composite_tts_FILES = $(COMMON_composite_tts_DEPS) $(COMMON_composite_tts_SRCS)

COMMON_braille_text_handler_DEPS = $(CLOSURE_base_FILES)
COMMON_braille_text_handler_SRCS = common/braille_text_handler.js
COMMON_braille_text_handler_FILES = $(COMMON_braille_text_handler_DEPS) $(COMMON_braille_text_handler_SRCS)

COMMON_content_editable_extractor_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_FILES) $(COMMON_traverse_util_FILES)
COMMON_content_editable_extractor_SRCS = common/content_editable_extractor.js
COMMON_content_editable_extractor_FILES = $(COMMON_content_editable_extractor_DEPS) $(COMMON_content_editable_extractor_SRCS)

COMMON_editable_text_area_shadow_DEPS = $(CLOSURE_base_FILES)
COMMON_editable_text_area_shadow_SRCS = common/editable_text_area_shadow.js
COMMON_editable_text_area_shadow_FILES = $(COMMON_editable_text_area_shadow_DEPS) $(COMMON_editable_text_area_shadow_SRCS)

COMMON_editable_text_DEPS = $(CLOSURE_I18N_messageformat_FILES) $(CLOSURE_base_FILES) $(HOST_INTERFACE_tts_interface_FILES) $(COMMON_braille_text_handler_FILES) $(COMMON_content_editable_extractor_FILES) $(COMMON_dom_util_FILES) $(COMMON_editable_text_area_shadow_FILES)
COMMON_editable_text_SRCS = common/editable_text.js
COMMON_editable_text_FILES = $(COMMON_editable_text_DEPS) $(COMMON_editable_text_SRCS)

LIBLOUIS_NACL_js_library_DEPS = $(CLOSURE_base_FILES)
LIBLOUIS_NACL_js_library_SRCS = liblouis_nacl/liblouis_native_client.js
LIBLOUIS_NACL_js_library_FILES = $(LIBLOUIS_NACL_js_library_DEPS) $(LIBLOUIS_NACL_js_library_SRCS)

HOST_CHROME_braille_display_manager_DEPS = $(CLOSURE_base_FILES) $(COMMON_nav_braille_FILES)
HOST_CHROME_braille_display_manager_SRCS = host/chrome/braille_display_manager.js
HOST_CHROME_braille_display_manager_FILES = $(HOST_CHROME_braille_display_manager_DEPS) $(HOST_CHROME_braille_display_manager_SRCS)

HOST_CHROME_braille_background_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_braille_FILES) $(LIBLOUIS_NACL_js_library_FILES) $(HOST_CHROME_braille_display_manager_FILES)
HOST_CHROME_braille_background_SRCS = host/chrome/braille_background.js
HOST_CHROME_braille_background_FILES = $(HOST_CHROME_braille_background_DEPS) $(HOST_CHROME_braille_background_SRCS)

HOST_CHROME_earcons_background_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES)
HOST_CHROME_earcons_background_SRCS = host/chrome/earcons_background.js
HOST_CHROME_earcons_background_FILES = $(HOST_CHROME_earcons_background_DEPS) $(HOST_CHROME_earcons_background_SRCS)

COMMON_chromevox_json_DEPS = $(CLOSURE_base_FILES)
COMMON_chromevox_json_SRCS = common/chromevox_json.js
COMMON_chromevox_json_FILES = $(COMMON_chromevox_json_DEPS) $(COMMON_chromevox_json_SRCS)

HOST_CHROME_extension_bridge_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_json_FILES)
HOST_CHROME_extension_bridge_SRCS = host/chrome/extension_bridge.js
HOST_CHROME_extension_bridge_FILES = $(HOST_CHROME_extension_bridge_DEPS) $(HOST_CHROME_extension_bridge_SRCS)

COMMON_math_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_xpath_util_FILES)
COMMON_math_util_SRCS = common/math_util.js
COMMON_math_util_FILES = $(COMMON_math_util_DEPS) $(COMMON_math_util_SRCS)

COMMON_nav_description_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(COMMON_chromevox_FILES) $(COMMON_cursor_selection_FILES)
COMMON_nav_description_SRCS = common/nav_description.js
COMMON_nav_description_FILES = $(COMMON_nav_description_DEPS) $(COMMON_nav_description_SRCS)

COMMON_nav_math_description_DEPS = $(CLOSURE_base_FILES) $(COMMON_nav_description_FILES)
COMMON_nav_math_description_SRCS = common/nav_math_description.js
COMMON_nav_math_description_FILES = $(COMMON_nav_math_description_DEPS) $(COMMON_nav_math_description_SRCS)

COMMON_math_semantic_util_DEPS = $(CLOSURE_base_FILES)
COMMON_math_semantic_util_SRCS = common/math_semantic_util.js
COMMON_math_semantic_util_FILES = $(COMMON_math_semantic_util_DEPS) $(COMMON_math_semantic_util_SRCS)

COMMON_math_semantic_attr_DEPS = $(CLOSURE_base_FILES) $(COMMON_math_semantic_util_FILES)
COMMON_math_semantic_attr_SRCS = common/math_semantic_attr.js
COMMON_math_semantic_attr_FILES = $(COMMON_math_semantic_attr_DEPS) $(COMMON_math_semantic_attr_SRCS)

COMMON_math_semantic_tree_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_math_semantic_attr_FILES) $(COMMON_math_semantic_util_FILES)
COMMON_math_semantic_tree_SRCS = common/math_semantic_tree.js
COMMON_math_semantic_tree_FILES = $(COMMON_math_semantic_tree_DEPS) $(COMMON_math_semantic_tree_SRCS)

COMMON_traverse_math_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(COMMON_math_semantic_tree_FILES)
COMMON_traverse_math_SRCS = common/traverse_math.js
COMMON_traverse_math_FILES = $(COMMON_traverse_math_DEPS) $(COMMON_traverse_math_SRCS)

SPEECH_RULES_speech_rule_DEPS = $(CLOSURE_base_FILES)
SPEECH_RULES_speech_rule_SRCS = speech_rules/speech_rule.js
SPEECH_RULES_speech_rule_FILES = $(SPEECH_RULES_speech_rule_DEPS) $(SPEECH_RULES_speech_rule_SRCS)

SPEECH_RULES_speech_rule_evaluator_DEPS = $(CLOSURE_base_FILES) $(SPEECH_RULES_speech_rule_FILES)
SPEECH_RULES_speech_rule_evaluator_SRCS = speech_rules/speech_rule_evaluator.js
SPEECH_RULES_speech_rule_evaluator_FILES = $(SPEECH_RULES_speech_rule_evaluator_DEPS) $(SPEECH_RULES_speech_rule_evaluator_SRCS)

SPEECH_RULES_speech_rule_functions_DEPS = $(CLOSURE_base_FILES)
SPEECH_RULES_speech_rule_functions_SRCS = speech_rules/speech_rule_functions.js
SPEECH_RULES_speech_rule_functions_FILES = $(SPEECH_RULES_speech_rule_functions_DEPS) $(SPEECH_RULES_speech_rule_functions_SRCS)

SPEECH_RULES_speech_rule_store_DEPS = $(CLOSURE_base_FILES)
SPEECH_RULES_speech_rule_store_SRCS = speech_rules/speech_rule_store.js
SPEECH_RULES_speech_rule_store_FILES = $(SPEECH_RULES_speech_rule_store_DEPS) $(SPEECH_RULES_speech_rule_store_SRCS)

SPEECH_RULES_base_rule_store_DEPS = $(CLOSURE_base_FILES) $(COMMON_math_util_FILES) $(SPEECH_RULES_speech_rule_FILES) $(SPEECH_RULES_speech_rule_evaluator_FILES) $(SPEECH_RULES_speech_rule_functions_FILES) $(SPEECH_RULES_speech_rule_store_FILES)
SPEECH_RULES_base_rule_store_SRCS = speech_rules/base_rule_store.js
SPEECH_RULES_base_rule_store_FILES = $(SPEECH_RULES_base_rule_store_DEPS) $(SPEECH_RULES_base_rule_store_SRCS)

SPEECH_RULES_math_store_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_nav_math_description_FILES) $(COMMON_traverse_math_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(SPEECH_RULES_base_rule_store_FILES) $(SPEECH_RULES_speech_rule_FILES)
SPEECH_RULES_math_store_SRCS = speech_rules/math_store.js
SPEECH_RULES_math_store_FILES = $(SPEECH_RULES_math_store_DEPS) $(SPEECH_RULES_math_store_SRCS)

SPEECH_RULES_math_simple_store_DEPS = $(CLOSURE_base_FILES) $(SPEECH_RULES_math_store_FILES) $(SPEECH_RULES_speech_rule_FILES)
SPEECH_RULES_math_simple_store_SRCS = speech_rules/math_simple_store.js
SPEECH_RULES_math_simple_store_FILES = $(SPEECH_RULES_math_simple_store_DEPS) $(SPEECH_RULES_math_simple_store_SRCS)

CHROMEVOX_BACKGROUND_MATHMAPS_math_map_DEPS = $(CLOSURE_base_FILES) $(COMMON_math_util_FILES) $(SPEECH_RULES_math_simple_store_FILES)
CHROMEVOX_BACKGROUND_MATHMAPS_math_map_SRCS = chromevox/background/mathmaps/math_map.js
CHROMEVOX_BACKGROUND_MATHMAPS_math_map_FILES = $(CHROMEVOX_BACKGROUND_MATHMAPS_math_map_DEPS) $(CHROMEVOX_BACKGROUND_MATHMAPS_math_map_SRCS)

HOST_CHROME_tts_base_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES)
HOST_CHROME_tts_base_SRCS = host/chrome/tts_base.js
HOST_CHROME_tts_base_FILES = $(HOST_CHROME_tts_base_DEPS) $(HOST_CHROME_tts_base_SRCS)

HOST_CHROME_tts_background_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_BACKGROUND_MATHMAPS_math_map_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_CHROME_tts_base_FILES)
HOST_CHROME_tts_background_SRCS = host/chrome/tts_background.js
HOST_CHROME_tts_background_FILES = $(HOST_CHROME_tts_background_DEPS) $(HOST_CHROME_tts_background_SRCS)

COMMON_braille_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_nav_braille_FILES) $(COMMON_node_state_FILES) $(COMMON_spannable_FILES)
COMMON_braille_util_SRCS = common/braille_util.js
COMMON_braille_util_FILES = $(COMMON_braille_util_DEPS) $(COMMON_braille_util_SRCS)

CHROMEVOX_BACKGROUND_accessibility_api_handler_DEPS = $(CLOSURE_base_FILES) $(COMMON_braille_util_FILES) $(COMMON_editable_text_FILES) $(COMMON_nav_braille_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_braille_interface_FILES)
CHROMEVOX_BACKGROUND_accessibility_api_handler_SRCS = chromevox/background/accessibility_api_handler.js
CHROMEVOX_BACKGROUND_accessibility_api_handler_FILES = $(CHROMEVOX_BACKGROUND_accessibility_api_handler_DEPS) $(CHROMEVOX_BACKGROUND_accessibility_api_handler_SRCS)

CHROMEVOX_BACKGROUND_injected_script_loader_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_BACKGROUND_injected_script_loader_SRCS = chromevox/background/injected_script_loader.js
CHROMEVOX_BACKGROUND_injected_script_loader_FILES = $(CHROMEVOX_BACKGROUND_injected_script_loader_DEPS) $(CHROMEVOX_BACKGROUND_injected_script_loader_SRCS)

COMMON_key_sequence_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES)
COMMON_key_sequence_SRCS = common/key_sequence.js
COMMON_key_sequence_FILES = $(COMMON_key_sequence_DEPS) $(COMMON_key_sequence_SRCS)

COMMON_key_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_key_sequence_FILES)
COMMON_key_util_SRCS = common/key_util.js
COMMON_key_util_FILES = $(COMMON_key_util_DEPS) $(COMMON_key_util_SRCS)

CHROMEVOX_BACKGROUND_KEYMAPS_key_map_DEPS = $(CLOSURE_base_FILES) $(COMMON_key_util_FILES) $(COMMON_platform_util_FILES)
CHROMEVOX_BACKGROUND_KEYMAPS_key_map_SRCS = chromevox/background/keymaps/key_map.js
CHROMEVOX_BACKGROUND_KEYMAPS_key_map_FILES = $(CHROMEVOX_BACKGROUND_KEYMAPS_key_map_DEPS) $(CHROMEVOX_BACKGROUND_KEYMAPS_key_map_SRCS)

COMMON_command_store_DEPS = $(CLOSURE_base_FILES)
COMMON_command_store_SRCS = common/command_store.js
COMMON_command_store_FILES = $(COMMON_command_store_DEPS) $(COMMON_command_store_SRCS)

HOST_CHROME_earcons_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_CHROME_extension_bridge_FILES)
HOST_CHROME_earcons_SRCS = host/chrome/earcons.js
HOST_CHROME_earcons_FILES = $(HOST_CHROME_earcons_DEPS) $(HOST_CHROME_earcons_SRCS)

COMMON_buildinfo_DEPS = $(CLOSURE_base_FILES)
COMMON_buildinfo_SRCS = common/buildinfo.js
COMMON_buildinfo_FILES = $(COMMON_buildinfo_DEPS) $(COMMON_buildinfo_SRCS)

CHROMEVOX_INJECTED_api_util_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_INJECTED_api_util_SRCS = chromevox/injected/api_util.js
CHROMEVOX_INJECTED_api_util_FILES = $(CHROMEVOX_INJECTED_api_util_DEPS) $(CHROMEVOX_INJECTED_api_util_SRCS)

CHROMEVOX_INJECTED_script_installer_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES)
CHROMEVOX_INJECTED_script_installer_SRCS = chromevox/injected/script_installer.js
CHROMEVOX_INJECTED_script_installer_FILES = $(CHROMEVOX_INJECTED_script_installer_DEPS) $(CHROMEVOX_INJECTED_script_installer_SRCS)

CHROMEVOX_INJECTED_api_implementation_DEPS = $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_buildinfo_FILES) $(COMMON_chromevox_FILES) $(COMMON_chromevox_json_FILES) $(COMMON_dom_util_FILES) $(CHROMEVOX_INJECTED_api_util_FILES) $(CHROMEVOX_INJECTED_script_installer_FILES)
CHROMEVOX_INJECTED_api_implementation_SRCS = chromevox/injected/api_implementation.js
CHROMEVOX_INJECTED_api_implementation_FILES = $(CHROMEVOX_INJECTED_api_implementation_DEPS) $(CHROMEVOX_INJECTED_api_implementation_SRCS)

COMMON_date_widget_DEPS = $(CLOSURE_base_FILES)
COMMON_date_widget_SRCS = common/date_widget.js
COMMON_date_widget_FILES = $(COMMON_date_widget_DEPS) $(COMMON_date_widget_SRCS)

CHROMEVOX_INJECTED_event_suspender_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_INJECTED_event_suspender_SRCS = chromevox/injected/event_suspender.js
CHROMEVOX_INJECTED_event_suspender_FILES = $(CHROMEVOX_INJECTED_event_suspender_DEPS) $(CHROMEVOX_INJECTED_event_suspender_SRCS)

COMMON_focuser_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_event_suspender_FILES) $(COMMON_dom_util_FILES)
COMMON_focuser_SRCS = common/focuser.js
COMMON_focuser_FILES = $(COMMON_focuser_DEPS) $(COMMON_focuser_SRCS)

COMMON_media_widget_DEPS = $(CLOSURE_base_FILES)
COMMON_media_widget_SRCS = common/media_widget.js
COMMON_media_widget_FILES = $(COMMON_media_widget_DEPS) $(COMMON_media_widget_SRCS)

COMMON_time_widget_DEPS = $(CLOSURE_base_FILES)
COMMON_time_widget_SRCS = common/time_widget.js
COMMON_time_widget_FILES = $(COMMON_time_widget_DEPS) $(COMMON_time_widget_SRCS)

CHROMEVOX_INJECTED_active_indicator_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_FILES) $(COMMON_dom_util_FILES)
CHROMEVOX_INJECTED_active_indicator_SRCS = chromevox/injected/active_indicator.js
CHROMEVOX_INJECTED_active_indicator_FILES = $(CHROMEVOX_INJECTED_active_indicator_DEPS) $(CHROMEVOX_INJECTED_active_indicator_SRCS)

CHROMEVOX_INJECTED_node_breadcrumb_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES)
CHROMEVOX_INJECTED_node_breadcrumb_SRCS = chromevox/injected/node_breadcrumb.js
CHROMEVOX_INJECTED_node_breadcrumb_FILES = $(CHROMEVOX_INJECTED_node_breadcrumb_DEPS) $(CHROMEVOX_INJECTED_node_breadcrumb_SRCS)

CHROMEVOX_INJECTED_history_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(CHROMEVOX_INJECTED_node_breadcrumb_FILES)
CHROMEVOX_INJECTED_history_SRCS = chromevox/injected/history.js
CHROMEVOX_INJECTED_history_FILES = $(CHROMEVOX_INJECTED_history_DEPS) $(CHROMEVOX_INJECTED_history_SRCS)

CHROMEVOX_MESSAGES_spoken_message_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_MESSAGES_spoken_message_SRCS = chromevox/messages/spoken_message.js
CHROMEVOX_MESSAGES_spoken_message_FILES = $(CHROMEVOX_MESSAGES_spoken_message_DEPS) $(CHROMEVOX_MESSAGES_spoken_message_SRCS)

CHROMEVOX_MESSAGES_spoken_messages_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(CHROMEVOX_MESSAGES_spoken_message_FILES)
CHROMEVOX_MESSAGES_spoken_messages_SRCS = chromevox/messages/spoken_messages.js
CHROMEVOX_MESSAGES_spoken_messages_FILES = $(CHROMEVOX_MESSAGES_spoken_messages_DEPS) $(CHROMEVOX_MESSAGES_spoken_messages_SRCS)

CHROMEVOX_INJECTED_UI_widget_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_MESSAGES_spoken_messages_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_earcons_FILES)
CHROMEVOX_INJECTED_UI_widget_SRCS = chromevox/injected/ui/widget.js
CHROMEVOX_INJECTED_UI_widget_FILES = $(CHROMEVOX_INJECTED_UI_widget_DEPS) $(CHROMEVOX_INJECTED_UI_widget_SRCS)

SPEECH_RULES_mathml_store_DEPS = $(CLOSURE_base_FILES) $(SPEECH_RULES_math_store_FILES)
SPEECH_RULES_mathml_store_SRCS = speech_rules/mathml_store.js
SPEECH_RULES_mathml_store_FILES = $(SPEECH_RULES_mathml_store_DEPS) $(SPEECH_RULES_mathml_store_SRCS)

SPEECH_RULES_speech_rule_engine_DEPS = $(CLOSURE_base_FILES) $(COMMON_nav_description_FILES) $(COMMON_nav_math_description_FILES) $(SPEECH_RULES_base_rule_store_FILES) $(SPEECH_RULES_speech_rule_FILES)
SPEECH_RULES_speech_rule_engine_SRCS = speech_rules/speech_rule_engine.js
SPEECH_RULES_speech_rule_engine_FILES = $(SPEECH_RULES_speech_rule_engine_DEPS) $(SPEECH_RULES_speech_rule_engine_SRCS)

WALKERS_abstract_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_nav_braille_FILES)
WALKERS_abstract_walker_SRCS = walkers/abstract_walker.js
WALKERS_abstract_walker_FILES = $(WALKERS_abstract_walker_DEPS) $(WALKERS_abstract_walker_SRCS)

WALKERS_abstract_node_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_dom_util_FILES) $(WALKERS_abstract_walker_FILES)
WALKERS_abstract_node_walker_SRCS = walkers/abstract_node_walker.js
WALKERS_abstract_node_walker_FILES = $(WALKERS_abstract_node_walker_DEPS) $(WALKERS_abstract_node_walker_SRCS)

WALKERS_bare_object_walker_DEPS = $(CLOSURE_base_FILES) $(WALKERS_abstract_node_walker_FILES)
WALKERS_bare_object_walker_SRCS = walkers/bare_object_walker.js
WALKERS_bare_object_walker_FILES = $(WALKERS_bare_object_walker_DEPS) $(WALKERS_bare_object_walker_SRCS)

COMMON_aural_style_util_DEPS = $(CLOSURE_base_FILES)
COMMON_aural_style_util_SRCS = common/aural_style_util.js
COMMON_aural_style_util_FILES = $(COMMON_aural_style_util_DEPS) $(COMMON_aural_style_util_SRCS)

COMMON_earcon_util_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(COMMON_aria_util_FILES) $(COMMON_dom_util_FILES)
COMMON_earcon_util_SRCS = common/earcon_util.js
COMMON_earcon_util_FILES = $(COMMON_earcon_util_DEPS) $(COMMON_earcon_util_SRCS)

COMMON_description_util_DEPS = $(CLOSURE_base_FILES) $(SPEECH_RULES_mathml_store_FILES) $(SPEECH_RULES_speech_rule_engine_FILES) $(WALKERS_bare_object_walker_FILES) $(COMMON_aria_util_FILES) $(COMMON_aural_style_util_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_dom_util_FILES) $(COMMON_earcon_util_FILES) $(COMMON_nav_description_FILES) $(COMMON_traverse_math_FILES)
COMMON_description_util_SRCS = common/description_util.js
COMMON_description_util_FILES = $(COMMON_description_util_DEPS) $(COMMON_description_util_SRCS)

COMMON_find_util_DEPS = $(CLOSURE_base_FILES) $(WALKERS_bare_object_walker_FILES) $(COMMON_cursor_selection_FILES)
COMMON_find_util_SRCS = common/find_util.js
COMMON_find_util_FILES = $(COMMON_find_util_DEPS) $(COMMON_find_util_SRCS)

COMMON_interframe_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_json_FILES) $(COMMON_dom_util_FILES)
COMMON_interframe_SRCS = common/interframe.js
COMMON_interframe_FILES = $(COMMON_interframe_DEPS) $(COMMON_interframe_SRCS)

COMMON_page_selection_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_nav_description_FILES)
COMMON_page_selection_SRCS = common/page_selection.js
COMMON_page_selection_FILES = $(COMMON_page_selection_DEPS) $(COMMON_page_selection_SRCS)

SPEECH_RULES_mathml_store_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_math_util_FILES) $(COMMON_traverse_math_FILES)
SPEECH_RULES_mathml_store_util_SRCS = speech_rules/mathml_store_util.js
SPEECH_RULES_mathml_store_util_FILES = $(SPEECH_RULES_mathml_store_util_DEPS) $(SPEECH_RULES_mathml_store_util_SRCS)

SPEECH_RULES_store_util_DEPS = $(CLOSURE_base_FILES)
SPEECH_RULES_store_util_SRCS = speech_rules/store_util.js
SPEECH_RULES_store_util_FILES = $(SPEECH_RULES_store_util_DEPS) $(SPEECH_RULES_store_util_SRCS)

SPEECH_RULES_mathml_store_rules_DEPS = $(CLOSURE_base_FILES) $(SPEECH_RULES_math_store_FILES) $(SPEECH_RULES_mathml_store_FILES) $(SPEECH_RULES_mathml_store_util_FILES) $(SPEECH_RULES_store_util_FILES)
SPEECH_RULES_mathml_store_rules_SRCS = speech_rules/mathml_store_rules.js
SPEECH_RULES_mathml_store_rules_FILES = $(SPEECH_RULES_mathml_store_rules_DEPS) $(SPEECH_RULES_mathml_store_rules_SRCS)

WALKERS_abstract_shifter_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_nav_braille_FILES) $(WALKERS_abstract_walker_FILES)
WALKERS_abstract_shifter_SRCS = walkers/abstract_shifter.js
WALKERS_abstract_shifter_FILES = $(WALKERS_abstract_shifter_DEPS) $(WALKERS_abstract_shifter_SRCS)

WALKERS_math_shifter_DEPS = $(CLOSURE_base_FILES) $(COMMON_braille_util_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_dom_util_FILES) $(COMMON_nav_description_FILES) $(COMMON_traverse_math_FILES) $(SPEECH_RULES_mathml_store_FILES) $(SPEECH_RULES_mathml_store_rules_FILES) $(SPEECH_RULES_speech_rule_engine_FILES) $(WALKERS_abstract_shifter_FILES)
WALKERS_math_shifter_SRCS = walkers/math_shifter.js
WALKERS_math_shifter_FILES = $(WALKERS_math_shifter_DEPS) $(WALKERS_math_shifter_SRCS)

COMMON_table_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_xpath_util_FILES)
COMMON_table_util_SRCS = common/table_util.js
COMMON_table_util_FILES = $(COMMON_table_util_DEPS) $(COMMON_table_util_SRCS)

COMMON_traverse_table_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_predicates_FILES) $(COMMON_dom_util_FILES) $(COMMON_selection_util_FILES) $(COMMON_table_util_FILES) $(COMMON_traverse_util_FILES)
COMMON_traverse_table_SRCS = common/traverse_table.js
COMMON_traverse_table_FILES = $(COMMON_traverse_table_DEPS) $(COMMON_traverse_table_SRCS)

WALKERS_table_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_braille_util_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_nav_description_FILES) $(COMMON_traverse_table_FILES) $(WALKERS_abstract_walker_FILES)
WALKERS_table_walker_SRCS = walkers/table_walker.js
WALKERS_table_walker_FILES = $(WALKERS_table_walker_DEPS) $(WALKERS_table_walker_SRCS)

WALKERS_column_walker_DEPS = $(CLOSURE_base_FILES) $(WALKERS_table_walker_FILES)
WALKERS_column_walker_SRCS = walkers/column_walker.js
WALKERS_column_walker_FILES = $(WALKERS_column_walker_DEPS) $(WALKERS_column_walker_SRCS)

WALKERS_row_walker_DEPS = $(CLOSURE_base_FILES) $(WALKERS_table_walker_FILES)
WALKERS_row_walker_SRCS = walkers/row_walker.js
WALKERS_row_walker_FILES = $(WALKERS_row_walker_DEPS) $(WALKERS_row_walker_SRCS)

WALKERS_table_shifter_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_dom_predicates_FILES) $(COMMON_dom_util_FILES) $(COMMON_nav_braille_FILES) $(WALKERS_abstract_shifter_FILES) $(WALKERS_column_walker_FILES) $(WALKERS_row_walker_FILES)
WALKERS_table_shifter_SRCS = walkers/table_shifter.js
WALKERS_table_shifter_FILES = $(WALKERS_table_shifter_DEPS) $(WALKERS_table_shifter_SRCS)

CHROMEVOX_INJECTED_navigation_history_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES)
CHROMEVOX_INJECTED_navigation_history_SRCS = chromevox/injected/navigation_history.js
CHROMEVOX_INJECTED_navigation_history_FILES = $(CHROMEVOX_INJECTED_navigation_history_DEPS) $(CHROMEVOX_INJECTED_navigation_history_SRCS)

COMMON_traverse_content_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_dom_util_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_util_FILES)
COMMON_traverse_content_SRCS = common/traverse_content.js
COMMON_traverse_content_FILES = $(COMMON_traverse_content_DEPS) $(COMMON_traverse_content_SRCS)

WALKERS_abstract_selection_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_spannable_FILES) $(COMMON_traverse_content_FILES) $(WALKERS_abstract_walker_FILES) $(WALKERS_bare_object_walker_FILES)
WALKERS_abstract_selection_walker_SRCS = walkers/abstract_selection_walker.js
WALKERS_abstract_selection_walker_FILES = $(WALKERS_abstract_selection_walker_DEPS) $(WALKERS_abstract_selection_walker_SRCS)

WALKERS_character_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_traverse_content_FILES) $(WALKERS_abstract_selection_walker_FILES)
WALKERS_character_walker_SRCS = walkers/character_walker.js
WALKERS_character_walker_FILES = $(WALKERS_character_walker_DEPS) $(WALKERS_character_walker_SRCS)

COMMON_group_util_DEPS = $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_dom_util_FILES)
COMMON_group_util_SRCS = common/group_util.js
COMMON_group_util_FILES = $(COMMON_group_util_DEPS) $(COMMON_group_util_SRCS)

WALKERS_group_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_braille_util_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_group_util_FILES) $(WALKERS_abstract_node_walker_FILES)
WALKERS_group_walker_SRCS = walkers/group_walker.js
WALKERS_group_walker_FILES = $(WALKERS_group_walker_DEPS) $(WALKERS_group_walker_SRCS)

WALKERS_structural_line_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_traverse_content_FILES) $(WALKERS_abstract_selection_walker_FILES)
WALKERS_structural_line_walker_SRCS = walkers/structural_line_walker.js
WALKERS_structural_line_walker_FILES = $(WALKERS_structural_line_walker_DEPS) $(WALKERS_structural_line_walker_SRCS)

WALKERS_layout_line_walker_DEPS = $(CLOSURE_base_FILES) $(WALKERS_abstract_walker_FILES) $(WALKERS_structural_line_walker_FILES)
WALKERS_layout_line_walker_SRCS = walkers/layout_line_walker.js
WALKERS_layout_line_walker_FILES = $(WALKERS_layout_line_walker_DEPS) $(WALKERS_layout_line_walker_SRCS)

WALKERS_object_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_braille_util_FILES) $(COMMON_description_util_FILES) $(WALKERS_abstract_node_walker_FILES)
WALKERS_object_walker_SRCS = walkers/object_walker.js
WALKERS_object_walker_FILES = $(WALKERS_object_walker_DEPS) $(WALKERS_object_walker_SRCS)

WALKERS_sentence_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_traverse_content_FILES) $(WALKERS_abstract_selection_walker_FILES)
WALKERS_sentence_walker_SRCS = walkers/sentence_walker.js
WALKERS_sentence_walker_FILES = $(WALKERS_sentence_walker_DEPS) $(WALKERS_sentence_walker_SRCS)

WALKERS_word_walker_DEPS = $(CLOSURE_base_FILES) $(COMMON_traverse_content_FILES) $(WALKERS_abstract_selection_walker_FILES)
WALKERS_word_walker_SRCS = walkers/word_walker.js
WALKERS_word_walker_FILES = $(WALKERS_word_walker_DEPS) $(WALKERS_word_walker_SRCS)

CHROMEVOX_INJECTED_navigation_shifter_DEPS = $(CLOSURE_base_FILES) $(COMMON_traverse_content_FILES) $(WALKERS_abstract_shifter_FILES) $(WALKERS_character_walker_FILES) $(WALKERS_group_walker_FILES) $(WALKERS_layout_line_walker_FILES) $(WALKERS_object_walker_FILES) $(WALKERS_sentence_walker_FILES) $(WALKERS_word_walker_FILES)
CHROMEVOX_INJECTED_navigation_shifter_SRCS = chromevox/injected/navigation_shifter.js
CHROMEVOX_INJECTED_navigation_shifter_FILES = $(CHROMEVOX_INJECTED_navigation_shifter_DEPS) $(CHROMEVOX_INJECTED_navigation_shifter_SRCS)

CHROMEVOX_INJECTED_navigation_speaker_DEPS = $(CLOSURE_base_FILES) $(COMMON_nav_description_FILES)
CHROMEVOX_INJECTED_navigation_speaker_SRCS = chromevox/injected/navigation_speaker.js
CHROMEVOX_INJECTED_navigation_speaker_FILES = $(CHROMEVOX_INJECTED_navigation_speaker_DEPS) $(CHROMEVOX_INJECTED_navigation_speaker_SRCS)

CHROMEVOX_INJECTED_navigation_manager_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_UI_widget_FILES) $(COMMON_chromevox_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_find_util_FILES) $(COMMON_focuser_FILES) $(COMMON_interframe_FILES) $(COMMON_nav_braille_FILES) $(COMMON_nav_description_FILES) $(COMMON_page_selection_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_math_FILES) $(WALKERS_math_shifter_FILES) $(WALKERS_table_shifter_FILES) $(CHROMEVOX_INJECTED_active_indicator_FILES) $(CHROMEVOX_INJECTED_event_suspender_FILES) $(CHROMEVOX_INJECTED_navigation_history_FILES) $(CHROMEVOX_INJECTED_navigation_shifter_FILES) $(CHROMEVOX_INJECTED_navigation_speaker_FILES)
CHROMEVOX_INJECTED_navigation_manager_SRCS = chromevox/injected/navigation_manager.js
CHROMEVOX_INJECTED_navigation_manager_FILES = $(CHROMEVOX_INJECTED_navigation_manager_DEPS) $(CHROMEVOX_INJECTED_navigation_manager_SRCS)

CHROMEVOX_INJECTED_UI_search_widget_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_navigation_manager_FILES) $(COMMON_chromevox_FILES) $(COMMON_cursor_selection_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(CHROMEVOX_INJECTED_UI_widget_FILES)
CHROMEVOX_INJECTED_UI_search_widget_SRCS = chromevox/injected/ui/search_widget.js
CHROMEVOX_INJECTED_UI_search_widget_FILES = $(CHROMEVOX_INJECTED_UI_search_widget_DEPS) $(CHROMEVOX_INJECTED_UI_search_widget_SRCS)

CHROMEVOX_INJECTED_UI_overlay_widget_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(CHROMEVOX_INJECTED_UI_search_widget_FILES)
CHROMEVOX_INJECTED_UI_overlay_widget_SRCS = chromevox/injected/ui/overlay_widget.js
CHROMEVOX_INJECTED_UI_overlay_widget_FILES = $(CHROMEVOX_INJECTED_UI_overlay_widget_DEPS) $(CHROMEVOX_INJECTED_UI_overlay_widget_SRCS)

CHROMEVOX_INJECTED_UI_keyboard_help_widget_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_command_store_FILES) $(COMMON_key_util_FILES) $(CHROMEVOX_INJECTED_UI_overlay_widget_FILES)
CHROMEVOX_INJECTED_UI_keyboard_help_widget_SRCS = chromevox/injected/ui/keyboard_help_widget.js
CHROMEVOX_INJECTED_UI_keyboard_help_widget_FILES = $(CHROMEVOX_INJECTED_UI_keyboard_help_widget_DEPS) $(CHROMEVOX_INJECTED_UI_keyboard_help_widget_SRCS)

CLOSURE_OBJECT_object_DEPS = $(CLOSURE_base_FILES)
CLOSURE_OBJECT_object_SRCS = external/closure_object_object.js
CLOSURE_OBJECT_object_FILES = $(CLOSURE_OBJECT_object_DEPS) $(CLOSURE_OBJECT_object_SRCS)

CHROMEVOX_INJECTED_user_event_detail_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES)
CHROMEVOX_INJECTED_user_event_detail_SRCS = chromevox/injected/user_event_detail.js
CHROMEVOX_INJECTED_user_event_detail_FILES = $(CHROMEVOX_INJECTED_user_event_detail_DEPS) $(CHROMEVOX_INJECTED_user_event_detail_SRCS)

CHROMEVOX_INJECTED_UI_context_menu_widget_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_user_event_detail_FILES) $(COMMON_chromevox_FILES) $(CHROMEVOX_INJECTED_UI_overlay_widget_FILES)
CHROMEVOX_INJECTED_UI_context_menu_widget_SRCS = chromevox/injected/ui/context_menu_widget.js
CHROMEVOX_INJECTED_UI_context_menu_widget_FILES = $(CHROMEVOX_INJECTED_UI_context_menu_widget_DEPS) $(CHROMEVOX_INJECTED_UI_context_menu_widget_SRCS)

CHROMEVOX_INJECTED_UI_node_search_widget_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_MESSAGES_spoken_messages_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(CHROMEVOX_INJECTED_UI_search_widget_FILES)
CHROMEVOX_INJECTED_UI_node_search_widget_SRCS = chromevox/injected/ui/node_search_widget.js
CHROMEVOX_INJECTED_UI_node_search_widget_FILES = $(CHROMEVOX_INJECTED_UI_node_search_widget_DEPS) $(CHROMEVOX_INJECTED_UI_node_search_widget_SRCS)

CHROMEVOX_INJECTED_UI_select_widget_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_UI_overlay_widget_FILES)
CHROMEVOX_INJECTED_UI_select_widget_SRCS = chromevox/injected/ui/select_widget.js
CHROMEVOX_INJECTED_UI_select_widget_FILES = $(CHROMEVOX_INJECTED_UI_select_widget_DEPS) $(CHROMEVOX_INJECTED_UI_select_widget_SRCS)

COMMON_focus_util_DEPS = $(CLOSURE_base_FILES)
COMMON_focus_util_SRCS = common/focus_util.js
COMMON_focus_util_FILES = $(COMMON_focus_util_DEPS) $(COMMON_focus_util_SRCS)

CHROMEVOX_TESTING_spoken_list_builder_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_TESTING_spoken_list_builder_SRCS = chromevox/testing/spoken_list_builder.js
CHROMEVOX_TESTING_spoken_list_builder_FILES = $(CHROMEVOX_TESTING_spoken_list_builder_DEPS) $(CHROMEVOX_TESTING_spoken_list_builder_SRCS)

CHROMEVOX_INJECTED_runner_interface_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_spoken_list_builder_FILES)
CHROMEVOX_INJECTED_runner_interface_SRCS = chromevox/injected/runner_interface.js
CHROMEVOX_INJECTED_runner_interface_FILES = $(CHROMEVOX_INJECTED_runner_interface_DEPS) $(CHROMEVOX_INJECTED_runner_interface_SRCS)

CHROMEVOX_TESTING_abstract_test_case_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_runner_interface_FILES) $(CHROMEVOX_TESTING_spoken_list_builder_FILES)
CHROMEVOX_TESTING_abstract_test_case_SRCS = chromevox/testing/abstract_test_case.js
CHROMEVOX_TESTING_abstract_test_case_FILES = $(CHROMEVOX_TESTING_abstract_test_case_DEPS) $(CHROMEVOX_TESTING_abstract_test_case_SRCS)

HOST_TESTING_tts_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_TESTING_tts_SRCS = host/testing/tts.js
HOST_TESTING_tts_FILES = $(HOST_TESTING_tts_DEPS) $(HOST_TESTING_tts_SRCS)

CHROMEVOX_INJECTED_runner_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_spoken_list_builder_FILES) $(COMMON_composite_tts_FILES) $(HOST_TESTING_tts_FILES) $(CHROMEVOX_INJECTED_history_FILES) $(CHROMEVOX_INJECTED_node_breadcrumb_FILES) $(CHROMEVOX_INJECTED_runner_interface_FILES)
CHROMEVOX_INJECTED_runner_SRCS = chromevox/injected/runner.js
CHROMEVOX_INJECTED_runner_FILES = $(CHROMEVOX_INJECTED_runner_DEPS) $(CHROMEVOX_INJECTED_runner_SRCS)

CHROMEVOX_INJECTED_user_commands_DEPS = $(CLOSURE_OBJECT_object_FILES) $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_UI_context_menu_widget_FILES) $(CHROMEVOX_INJECTED_UI_keyboard_help_widget_FILES) $(CHROMEVOX_INJECTED_UI_node_search_widget_FILES) $(CHROMEVOX_INJECTED_UI_search_widget_FILES) $(CHROMEVOX_INJECTED_UI_select_widget_FILES) $(COMMON_chromevox_FILES) $(COMMON_command_store_FILES) $(COMMON_dom_predicates_FILES) $(COMMON_dom_util_FILES) $(COMMON_editable_text_FILES) $(COMMON_focus_util_FILES) $(COMMON_platform_util_FILES) $(HOST_CHROME_braille_key_types_FILES) $(CHROMEVOX_INJECTED_console_tts_FILES) $(CHROMEVOX_INJECTED_runner_FILES) $(CHROMEVOX_INJECTED_user_event_detail_FILES)
CHROMEVOX_INJECTED_user_commands_SRCS = chromevox/injected/user_commands.js
CHROMEVOX_INJECTED_user_commands_FILES = $(CHROMEVOX_INJECTED_user_commands_DEPS) $(CHROMEVOX_INJECTED_user_commands_SRCS)

CHROMEVOX_INJECTED_keyboard_handler_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_BACKGROUND_KEYMAPS_key_map_FILES) $(CHROMEVOX_INJECTED_UI_keyboard_help_widget_FILES) $(COMMON_chromevox_FILES) $(COMMON_key_sequence_FILES) $(COMMON_key_util_FILES) $(CHROMEVOX_INJECTED_history_FILES) $(CHROMEVOX_INJECTED_user_commands_FILES)
CHROMEVOX_INJECTED_keyboard_handler_SRCS = chromevox/injected/keyboard_handler.js
CHROMEVOX_INJECTED_keyboard_handler_FILES = $(CHROMEVOX_INJECTED_keyboard_handler_DEPS) $(CHROMEVOX_INJECTED_keyboard_handler_SRCS)

CHROMEVOX_INJECTED_live_regions_DEPS = $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_interframe_FILES) $(COMMON_nav_description_FILES) $(CHROMEVOX_INJECTED_navigation_speaker_FILES)
CHROMEVOX_INJECTED_live_regions_SRCS = chromevox/injected/live_regions.js
CHROMEVOX_INJECTED_live_regions_FILES = $(CHROMEVOX_INJECTED_live_regions_DEPS) $(CHROMEVOX_INJECTED_live_regions_SRCS)

CHROMEVOX_INJECTED_live_regions_deprecated_DEPS = $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_nav_description_FILES)
CHROMEVOX_INJECTED_live_regions_deprecated_SRCS = chromevox/injected/live_regions_deprecated.js
CHROMEVOX_INJECTED_live_regions_deprecated_FILES = $(CHROMEVOX_INJECTED_live_regions_deprecated_DEPS) $(CHROMEVOX_INJECTED_live_regions_deprecated_SRCS)

CHROMEVOX_INJECTED_event_watcher_DEPS = $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_date_widget_FILES) $(COMMON_dom_util_FILES) $(COMMON_editable_text_FILES) $(COMMON_focuser_FILES) $(COMMON_media_widget_FILES) $(COMMON_platform_util_FILES) $(COMMON_time_widget_FILES) $(CHROMEVOX_INJECTED_active_indicator_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_suspender_FILES) $(CHROMEVOX_INJECTED_history_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(CHROMEVOX_INJECTED_live_regions_FILES) $(CHROMEVOX_INJECTED_live_regions_deprecated_FILES) $(CHROMEVOX_INJECTED_navigation_speaker_FILES) $(CHROMEVOX_INJECTED_user_commands_FILES) $(CHROMEVOX_INJECTED_user_event_detail_FILES)
CHROMEVOX_INJECTED_event_watcher_SRCS = chromevox/injected/event_watcher.js
CHROMEVOX_INJECTED_event_watcher_FILES = $(CHROMEVOX_INJECTED_event_watcher_DEPS) $(CHROMEVOX_INJECTED_event_watcher_SRCS)

CHROMEVOX_INJECTED_initial_speech_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_description_util_FILES) $(COMMON_dom_util_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(CHROMEVOX_INJECTED_live_regions_FILES)
CHROMEVOX_INJECTED_initial_speech_SRCS = chromevox/injected/initial_speech.js
CHROMEVOX_INJECTED_initial_speech_FILES = $(CHROMEVOX_INJECTED_initial_speech_DEPS) $(CHROMEVOX_INJECTED_initial_speech_SRCS)

CHROMEVOX_INJECTED_pdf_processor_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_INJECTED_pdf_processor_SRCS = chromevox/injected/pdf_processor.js
CHROMEVOX_INJECTED_pdf_processor_FILES = $(CHROMEVOX_INJECTED_pdf_processor_DEPS) $(CHROMEVOX_INJECTED_pdf_processor_SRCS)

EXTENSIONS_SEARCHVOX_constants_DEPS = $(CLOSURE_base_FILES)
EXTENSIONS_SEARCHVOX_constants_SRCS = extensions/searchvox/constants.js
EXTENSIONS_SEARCHVOX_constants_FILES = $(EXTENSIONS_SEARCHVOX_constants_DEPS) $(EXTENSIONS_SEARCHVOX_constants_SRCS)

EXTENSIONS_SEARCHVOX_util_DEPS = $(CLOSURE_base_FILES)
EXTENSIONS_SEARCHVOX_util_SRCS = extensions/searchvox/util.js
EXTENSIONS_SEARCHVOX_util_FILES = $(EXTENSIONS_SEARCHVOX_util_DEPS) $(EXTENSIONS_SEARCHVOX_util_SRCS)

EXTENSIONS_SEARCHVOX_abstract_result_DEPS = $(CLOSURE_base_FILES) $(EXTENSIONS_SEARCHVOX_util_FILES)
EXTENSIONS_SEARCHVOX_abstract_result_SRCS = extensions/searchvox/abstract_result.js
EXTENSIONS_SEARCHVOX_abstract_result_FILES = $(EXTENSIONS_SEARCHVOX_abstract_result_DEPS) $(EXTENSIONS_SEARCHVOX_abstract_result_SRCS)

EXTENSIONS_SEARCHVOX_results_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(EXTENSIONS_SEARCHVOX_abstract_result_FILES) $(EXTENSIONS_SEARCHVOX_util_FILES)
EXTENSIONS_SEARCHVOX_results_SRCS = extensions/searchvox/results.js
EXTENSIONS_SEARCHVOX_results_FILES = $(EXTENSIONS_SEARCHVOX_results_DEPS) $(EXTENSIONS_SEARCHVOX_results_SRCS)

EXTENSIONS_SEARCHVOX_search_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(EXTENSIONS_SEARCHVOX_constants_FILES) $(EXTENSIONS_SEARCHVOX_results_FILES) $(EXTENSIONS_SEARCHVOX_util_FILES)
EXTENSIONS_SEARCHVOX_search_SRCS = extensions/searchvox/search.js
EXTENSIONS_SEARCHVOX_search_FILES = $(EXTENSIONS_SEARCHVOX_search_DEPS) $(EXTENSIONS_SEARCHVOX_search_SRCS)

EXTENSIONS_SEARCHVOX_search_tools_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(EXTENSIONS_SEARCHVOX_constants_FILES) $(EXTENSIONS_SEARCHVOX_search_FILES) $(EXTENSIONS_SEARCHVOX_util_FILES)
EXTENSIONS_SEARCHVOX_search_tools_SRCS = extensions/searchvox/search_tools.js
EXTENSIONS_SEARCHVOX_search_tools_FILES = $(EXTENSIONS_SEARCHVOX_search_tools_DEPS) $(EXTENSIONS_SEARCHVOX_search_tools_SRCS)

EXTENSIONS_SEARCHVOX_context_menu_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(COMMON_key_sequence_FILES) $(EXTENSIONS_SEARCHVOX_search_FILES) $(EXTENSIONS_SEARCHVOX_search_tools_FILES)
EXTENSIONS_SEARCHVOX_context_menu_SRCS = extensions/searchvox/context_menu.js
EXTENSIONS_SEARCHVOX_context_menu_FILES = $(EXTENSIONS_SEARCHVOX_context_menu_DEPS) $(EXTENSIONS_SEARCHVOX_context_menu_SRCS)

EXTENSIONS_SEARCHVOX_loader_DEPS = $(CLOSURE_base_FILES) $(EXTENSIONS_SEARCHVOX_context_menu_FILES)
EXTENSIONS_SEARCHVOX_loader_SRCS = extensions/searchvox/loader.js
EXTENSIONS_SEARCHVOX_loader_FILES = $(EXTENSIONS_SEARCHVOX_loader_DEPS) $(EXTENSIONS_SEARCHVOX_loader_SRCS)

HOST_CHROME_host_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_initial_speech_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(CHROMEVOX_INJECTED_pdf_processor_FILES) $(COMMON_chromevox_FILES) $(COMMON_traverse_math_FILES) $(EXTENSIONS_SEARCHVOX_loader_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_CHROME_extension_bridge_FILES)
HOST_CHROME_host_SRCS = host/chrome/host.js
HOST_CHROME_host_FILES = $(HOST_CHROME_host_DEPS) $(HOST_CHROME_host_SRCS)

HOST_CHROME_tts_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_CHROME_tts_base_FILES)
HOST_CHROME_tts_SRCS = host/chrome/tts.js
HOST_CHROME_tts_FILES = $(HOST_CHROME_tts_DEPS) $(HOST_CHROME_tts_SRCS)

CHROMEVOX_BACKGROUND_prefs_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_BACKGROUND_KEYMAPS_key_map_FILES) $(COMMON_chromevox_FILES) $(HOST_CHROME_extension_bridge_FILES)
CHROMEVOX_BACKGROUND_prefs_SRCS = chromevox/background/prefs.js
CHROMEVOX_BACKGROUND_prefs_FILES = $(CHROMEVOX_BACKGROUND_prefs_DEPS) $(CHROMEVOX_BACKGROUND_prefs_SRCS)

CHROMEVOX_BACKGROUND_options_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_BACKGROUND_KEYMAPS_key_map_FILES) $(COMMON_chromevox_FILES) $(COMMON_command_store_FILES) $(COMMON_key_sequence_FILES) $(COMMON_platform_util_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_extension_bridge_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_BACKGROUND_prefs_FILES)
CHROMEVOX_BACKGROUND_options_SRCS = chromevox/background/options.js
CHROMEVOX_BACKGROUND_options_FILES = $(CHROMEVOX_BACKGROUND_options_DEPS) $(CHROMEVOX_BACKGROUND_options_SRCS)

CHROMEVOX_BACKGROUND_background_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_console_tts_FILES) $(COMMON_chromevox_FILES) $(COMMON_composite_tts_FILES) $(COMMON_editable_text_FILES) $(COMMON_nav_braille_FILES) $(HOST_CHROME_braille_background_FILES) $(HOST_CHROME_earcons_background_FILES) $(HOST_CHROME_extension_bridge_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_background_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_BACKGROUND_accessibility_api_handler_FILES) $(CHROMEVOX_BACKGROUND_injected_script_loader_FILES) $(CHROMEVOX_BACKGROUND_options_FILES) $(CHROMEVOX_BACKGROUND_prefs_FILES)
CHROMEVOX_BACKGROUND_background_SRCS = chromevox/background/background.js
CHROMEVOX_BACKGROUND_background_FILES = $(CHROMEVOX_BACKGROUND_background_DEPS) $(CHROMEVOX_BACKGROUND_background_SRCS)

CHROMEVOX_BACKGROUND_loader_DEPS = $(CLOSURE_base_FILES) $(HOST_CHROME_msgs_FILES) $(CHROMEVOX_BACKGROUND_background_FILES)
CHROMEVOX_BACKGROUND_loader_SRCS = chromevox/background/loader.js
CHROMEVOX_BACKGROUND_loader_FILES = $(CHROMEVOX_BACKGROUND_loader_DEPS) $(CHROMEVOX_BACKGROUND_loader_SRCS)

chromeVoxChromeBackgroundScript_DEPS = $(CHROMEVOX_BACKGROUND_loader_FILES)
chromeVoxChromeBackgroundScript.js_FILES = chromeVoxChromeBackgroundScript.js
chromeVoxChromeBackgroundScript.js: $(chromeVoxChromeBackgroundScript_DEPS)
	@echo Building Javascript binary chromeVoxChromeBackgroundScript.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeVoxChromeBackgroundScript.js


CHROMEVOX_BACKGROUND_options_loader_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_BACKGROUND_options_FILES)
CHROMEVOX_BACKGROUND_options_loader_SRCS = chromevox/background/options_loader.js
CHROMEVOX_BACKGROUND_options_loader_FILES = $(CHROMEVOX_BACKGROUND_options_loader_DEPS) $(CHROMEVOX_BACKGROUND_options_loader_SRCS)

chromeVoxChromeOptionsScript_DEPS = $(CHROMEVOX_BACKGROUND_options_loader_FILES)
chromeVoxChromeOptionsScript.js_FILES = chromeVoxChromeOptionsScript.js
chromeVoxChromeOptionsScript.js: $(chromeVoxChromeOptionsScript_DEPS)
	@echo Building Javascript binary chromeVoxChromeOptionsScript.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeVoxChromeOptionsScript.js


HOST_CHROME_braille_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_braille_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_CHROME_braille_key_types_FILES)
HOST_CHROME_braille_SRCS = host/chrome/braille.js
HOST_CHROME_braille_FILES = $(HOST_CHROME_braille_DEPS) $(HOST_CHROME_braille_SRCS)

HOST_CHROME_mathjax_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_script_installer_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_mathjax_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_CHROME_mathjax_SRCS = host/chrome/mathjax.js
HOST_CHROME_mathjax_FILES = $(HOST_CHROME_mathjax_DEPS) $(HOST_CHROME_mathjax_SRCS)

CHROMEVOX_INJECTED_serializer_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES)
CHROMEVOX_INJECTED_serializer_SRCS = chromevox/injected/serializer.js
CHROMEVOX_INJECTED_serializer_FILES = $(CHROMEVOX_INJECTED_serializer_DEPS) $(CHROMEVOX_INJECTED_serializer_SRCS)

CHROMEVOX_INJECTED_init_globals_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_MESSAGES_spoken_messages_FILES) $(COMMON_chromevox_FILES) $(COMMON_composite_tts_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_console_tts_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_navigation_manager_FILES) $(CHROMEVOX_INJECTED_serializer_FILES)
CHROMEVOX_INJECTED_init_globals_SRCS = chromevox/injected/init_globals.js
CHROMEVOX_INJECTED_init_globals_FILES = $(CHROMEVOX_INJECTED_init_globals_DEPS) $(CHROMEVOX_INJECTED_init_globals_SRCS)

CHROMEVOX_INJECTED_init_document_DEPS = $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_INJECTED_init_globals_FILES)
CHROMEVOX_INJECTED_init_document_SRCS = chromevox/injected/init_document.js
CHROMEVOX_INJECTED_init_document_FILES = $(CHROMEVOX_INJECTED_init_document_DEPS) $(CHROMEVOX_INJECTED_init_document_SRCS)

CHROMEVOX_INJECTED_loader_DEPS = $(CLOSURE_base_FILES) $(HOST_CHROME_braille_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_mathjax_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_FILES) $(CHROMEVOX_INJECTED_init_document_FILES)
CHROMEVOX_INJECTED_loader_SRCS = chromevox/injected/loader.js
CHROMEVOX_INJECTED_loader_FILES = $(CHROMEVOX_INJECTED_loader_DEPS) $(CHROMEVOX_INJECTED_loader_SRCS)

chromeVoxChromePageScript_DEPS = $(CHROMEVOX_INJECTED_loader_FILES)
chromeVoxChromePageScript.js_FILES = chromeVoxChromePageScript.js
chromeVoxChromePageScript.js: $(chromeVoxChromePageScript_DEPS)
	@echo Building Javascript binary chromeVoxChromePageScript.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeVoxChromePageScript.js


CHROMEVOX_BACKGROUND_kbexplorer_DEPS = $(CLOSURE_base_FILES) $(COMMON_key_util_FILES)
CHROMEVOX_BACKGROUND_kbexplorer_SRCS = chromevox/background/kbexplorer.js
CHROMEVOX_BACKGROUND_kbexplorer_FILES = $(CHROMEVOX_BACKGROUND_kbexplorer_DEPS) $(CHROMEVOX_BACKGROUND_kbexplorer_SRCS)

CHROMEVOX_BACKGROUND_kbexplorer_loader_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_BACKGROUND_kbexplorer_FILES)
CHROMEVOX_BACKGROUND_kbexplorer_loader_SRCS = chromevox/background/kbexplorer_loader.js
CHROMEVOX_BACKGROUND_kbexplorer_loader_FILES = $(CHROMEVOX_BACKGROUND_kbexplorer_loader_DEPS) $(CHROMEVOX_BACKGROUND_kbexplorer_loader_SRCS)

chromeVoxKbExplorerScript_DEPS = $(CHROMEVOX_BACKGROUND_kbexplorer_loader_FILES)
chromeVoxKbExplorerScript.js_FILES = chromeVoxKbExplorerScript.js
chromeVoxKbExplorerScript.js: $(chromeVoxKbExplorerScript_DEPS)
	@echo Building Javascript binary chromeVoxKbExplorerScript.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeVoxKbExplorerScript.js


HOST_TESTING_host_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_TESTING_host_SRCS = host/testing/host.js
HOST_TESTING_host_FILES = $(HOST_TESTING_host_DEPS) $(HOST_TESTING_host_SRCS)

HOST_TESTING_mathjax_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_mathjax_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_TESTING_mathjax_SRCS = host/testing/mathjax.js
HOST_TESTING_mathjax_FILES = $(HOST_TESTING_mathjax_DEPS) $(HOST_TESTING_mathjax_SRCS)

CHROMEVOX_MESSAGES_messages_en.json_FILES = chromevox/messages/_locales/en/messages.json
HOST_TESTING_test_messages_SRCS = host/testing/test_messages.jsfragment $(CHROMEVOX_MESSAGES_messages_en.json_FILES)
HOST_TESTING_test_messages_FILES = host/testing/test_messages.js
host/testing/test_messages.js: $(HOST_TESTING_test_messages_SRCS)
	@echo Generating file host/testing/test_messages.js
	@mkdir -p $(dir host/testing/test_messages.js)
	@cat $(HOST_TESTING_test_messages_SRCS) >$(HOST_TESTING_test_messages_FILES)


HOST_TESTING_test_messages.js_FILES = $(HOST_TESTING_test_messages_FILES)
HOST_TESTING_test_messages_lib_DEPS = $(CLOSURE_base_FILES)
HOST_TESTING_test_messages_lib_SRCS = $(HOST_TESTING_test_messages.js_FILES)
HOST_TESTING_test_messages_lib_FILES = $(HOST_TESTING_test_messages_lib_DEPS) $(HOST_TESTING_test_messages_lib_SRCS)

HOST_TESTING_msgs_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_TESTING_test_messages_lib_FILES)
HOST_TESTING_msgs_SRCS = host/testing/msgs.js
HOST_TESTING_msgs_FILES = $(HOST_TESTING_msgs_DEPS) $(HOST_TESTING_msgs_SRCS)

CHROMEVOX_TESTING_tester_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_live_regions_FILES) $(CHROMEVOX_INJECTED_navigation_manager_FILES) $(CHROMEVOX_INJECTED_navigation_shifter_FILES) $(CHROMEVOX_INJECTED_user_commands_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_TESTING_host_FILES) $(HOST_TESTING_mathjax_FILES) $(HOST_TESTING_msgs_FILES) $(HOST_TESTING_tts_FILES)
CHROMEVOX_TESTING_tester_SRCS = chromevox/testing/tester.js
CHROMEVOX_TESTING_tester_FILES = $(CHROMEVOX_TESTING_tester_DEPS) $(CHROMEVOX_TESTING_tester_SRCS)

CHROMEVOX_INJECTED_event_watcher_test_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_tester_FILES)
CHROMEVOX_INJECTED_event_watcher_test_SRCS = chromevox/injected/event_watcher_test.js
CHROMEVOX_INJECTED_event_watcher_test_FILES = $(CHROMEVOX_INJECTED_event_watcher_test_DEPS) $(CHROMEVOX_INJECTED_event_watcher_test_SRCS)

CHROMEVOX_INJECTED_navigation_manager_test_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_tester_FILES) $(HOST_TESTING_tts_FILES) $(CHROMEVOX_INJECTED_navigation_shifter_FILES)
CHROMEVOX_INJECTED_navigation_manager_test_SRCS = chromevox/injected/navigation_manager_test.js
CHROMEVOX_INJECTED_navigation_manager_test_FILES = $(CHROMEVOX_INJECTED_navigation_manager_test_DEPS) $(CHROMEVOX_INJECTED_navigation_manager_test_SRCS)

COMMON_math_semantic_tree_test_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_tester_FILES) $(COMMON_math_semantic_attr_FILES) $(COMMON_math_semantic_tree_FILES) $(COMMON_math_semantic_util_FILES) $(COMMON_xpath_util_FILES)
COMMON_math_semantic_tree_test_SRCS = common/math_semantic_tree_test.js
COMMON_math_semantic_tree_test_FILES = $(COMMON_math_semantic_tree_test_DEPS) $(COMMON_math_semantic_tree_test_SRCS)

SPEECH_RULES_mathml_store_test_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_tester_FILES) $(SPEECH_RULES_math_store_FILES) $(SPEECH_RULES_mathml_store_FILES)
SPEECH_RULES_mathml_store_test_SRCS = speech_rules/mathml_store_test.js
SPEECH_RULES_mathml_store_test_FILES = $(SPEECH_RULES_mathml_store_test_DEPS) $(SPEECH_RULES_mathml_store_test_SRCS)

SPEECH_RULES_speech_rule_test_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_tester_FILES)
SPEECH_RULES_speech_rule_test_SRCS = speech_rules/speech_rule_test.js
SPEECH_RULES_speech_rule_test_FILES = $(SPEECH_RULES_speech_rule_test_DEPS) $(SPEECH_RULES_speech_rule_test_SRCS)

WALKERS_math_shifter_test_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_TESTING_abstract_test_case_FILES) $(CHROMEVOX_TESTING_tester_FILES) $(COMMON_cursor_selection_FILES) $(COMMON_description_util_FILES)
WALKERS_math_shifter_test_SRCS = walkers/math_shifter_test.js
WALKERS_math_shifter_test_FILES = $(WALKERS_math_shifter_test_DEPS) $(WALKERS_math_shifter_test_SRCS)

CHROMEVOX_BACKGROUND_tests_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_event_watcher_test_FILES) $(CHROMEVOX_INJECTED_init_globals_FILES) $(CHROMEVOX_INJECTED_navigation_manager_test_FILES) $(CHROMEVOX_INJECTED_runner_FILES) $(COMMON_chromevox_FILES) $(COMMON_math_semantic_tree_test_FILES) $(HOST_CHROME_braille_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_extension_bridge_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_FILES) $(HOST_INTERFACE_host_factory_FILES) $(SPEECH_RULES_mathml_store_test_FILES) $(SPEECH_RULES_speech_rule_test_FILES) $(WALKERS_math_shifter_test_FILES)
CHROMEVOX_BACKGROUND_tests_SRCS = chromevox/background/tests.js
CHROMEVOX_BACKGROUND_tests_FILES = $(CHROMEVOX_BACKGROUND_tests_DEPS) $(CHROMEVOX_BACKGROUND_tests_SRCS)

chromeVoxTestsScript_DEPS = $(CHROMEVOX_BACKGROUND_tests_FILES)
chromeVoxTestsScript.js_FILES = chromeVoxTestsScript.js
chromeVoxTestsScript.js: $(chromeVoxTestsScript_DEPS)
	@echo Building Javascript binary chromeVoxTestsScript.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeVoxTestsScript.js


CHROMEVOX_png_files_FILES = $(wildcard chromevox/*.png)
CHROMEVOX_png_files: $(CHROMEVOX_png_files_FILES)

CHROMEVOX_BACKGROUND_html_and_css_files_FILES = $(wildcard chromevox/background/*.html) $(wildcard chromevox/background/*.css)
CHROMEVOX_BACKGROUND_html_and_css_files: $(CHROMEVOX_BACKGROUND_html_and_css_files_FILES)

CHROMEVOX_BACKGROUND_BRAILLE_resource_files_FILES = $(wildcard chromevox/background/braille/*.*)
CHROMEVOX_BACKGROUND_BRAILLE_resource_files: $(CHROMEVOX_BACKGROUND_BRAILLE_resource_files_FILES)

CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES = $(wildcard chromevox/background/earcons/*.ogg)
CHROMEVOX_BACKGROUND_EARCONS_ogg_files: $(CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES)

CHROMEVOX_BACKGROUND_KEYMAPS_json_files_FILES = $(wildcard chromevox/background/keymaps/*.json)
CHROMEVOX_BACKGROUND_KEYMAPS_json_files: $(CHROMEVOX_BACKGROUND_KEYMAPS_json_files_FILES)

CHROMEVOX_BACKGROUND_MATHMAPS_FUNCTIONS_json_files_FILES = $(wildcard chromevox/background/mathmaps/functions/*.json)
CHROMEVOX_BACKGROUND_MATHMAPS_FUNCTIONS_json_files: $(CHROMEVOX_BACKGROUND_MATHMAPS_FUNCTIONS_json_files_FILES)

CHROMEVOX_BACKGROUND_MATHMAPS_SYMBOLS_json_files_FILES = $(wildcard chromevox/background/mathmaps/symbols/*.json)
CHROMEVOX_BACKGROUND_MATHMAPS_SYMBOLS_json_files: $(CHROMEVOX_BACKGROUND_MATHMAPS_SYMBOLS_json_files_FILES)

chromevox_deploy_fs_out_SRCS = $(CHROMEVOX_manifest_compiled_manifest/manifest.json_FILES) $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES) $(chromeVoxChromeBackgroundScript.js_FILES) $(chromeVoxChromeOptionsScript.js_FILES) $(chromeVoxChromePageScript.js_FILES) $(chromeVoxKbExplorerScript.js_FILES) $(chromeVoxTestsScript.js_FILES) closure/base.js closure/closure_preinit.js $(CHROMEVOX_png_files_FILES) $(CHROMEVOX_BACKGROUND_html_and_css_files_FILES) $(CHROMEVOX_BACKGROUND_BRAILLE_resource_files_FILES) $(CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES) $(CHROMEVOX_BACKGROUND_KEYMAPS_json_files_FILES) $(CHROMEVOX_BACKGROUND_MATHMAPS_FUNCTIONS_json_files_FILES) $(CHROMEVOX_BACKGROUND_MATHMAPS_SYMBOLS_json_files_FILES) chromevox/injected/api.js chromevox/injected/api_util.js chromevox/injected/mathjax.js chromevox/injected/mathjax_external_util.js extensions/searchvox/abstract_result.js extensions/searchvox/constants.js extensions/searchvox/context_menu.js extensions/searchvox/results.js extensions/searchvox/search.js extensions/searchvox/search_tools.js extensions/searchvox/util.js external/tables
chromevox_deploy_fs_out_FILES = chromevox_deploy_fs_out
chromevox_deploy_fs_out: $(chromevox_deploy_fs_out_SRCS)
	@echo Building Fileset chromevox_deploy_fs_out
	@mkdir -p $(chromevox_deploy_fs_out_FILES)
	@rsync -r --chmod=+rw $(CHROMEVOX_manifest_compiled_manifest/manifest.json_FILES) chromevox_deploy_fs_out/
	@mkdir -p chromevox_deploy_fs_out/_locales/en
	@rsync -r --chmod=+rw $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES) chromevox_deploy_fs_out/_locales/en
	@rsync -r --chmod=+rw $(chromeVoxChromeBackgroundScript.js_FILES) chromevox_deploy_fs_out/
	@rsync -r --chmod=+rw $(chromeVoxChromeOptionsScript.js_FILES) chromevox_deploy_fs_out/
	@rsync -r --chmod=+rw $(chromeVoxChromePageScript.js_FILES) chromevox_deploy_fs_out/
	@rsync -r --chmod=+rw $(chromeVoxKbExplorerScript.js_FILES) chromevox_deploy_fs_out/
	@rsync -r --chmod=+rw $(chromeVoxTestsScript.js_FILES) chromevox_deploy_fs_out/
	@rsync -r --chmod=+rw closure/base.js chromevox_deploy_fs_out/
	@rsync -r --chmod=+rw closure/closure_preinit.js chromevox_deploy_fs_out/
	@mkdir -p chromevox_deploy_fs_out/chromevox
	@rsync -r --chmod=+rw $(CHROMEVOX_png_files_FILES) chromevox_deploy_fs_out/chromevox
	@mkdir -p chromevox_deploy_fs_out/chromevox/background
	@rsync -r --chmod=+rw $(CHROMEVOX_BACKGROUND_html_and_css_files_FILES) chromevox_deploy_fs_out/chromevox/background
	@mkdir -p chromevox_deploy_fs_out/chromevox/background/braille
	@rsync -r --chmod=+rw $(CHROMEVOX_BACKGROUND_BRAILLE_resource_files_FILES) chromevox_deploy_fs_out/chromevox/background/braille
	@mkdir -p chromevox_deploy_fs_out/chromevox/background/earcons
	@rsync -r --chmod=+rw $(CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES) chromevox_deploy_fs_out/chromevox/background/earcons
	@mkdir -p chromevox_deploy_fs_out/chromevox/background/keymaps
	@rsync -r --chmod=+rw $(CHROMEVOX_BACKGROUND_KEYMAPS_json_files_FILES) chromevox_deploy_fs_out/chromevox/background/keymaps
	@mkdir -p chromevox_deploy_fs_out/chromevox/background/mathmaps/functions
	@rsync -r --chmod=+rw $(CHROMEVOX_BACKGROUND_MATHMAPS_FUNCTIONS_json_files_FILES) chromevox_deploy_fs_out/chromevox/background/mathmaps/functions
	@mkdir -p chromevox_deploy_fs_out/chromevox/background/mathmaps/symbols
	@rsync -r --chmod=+rw $(CHROMEVOX_BACKGROUND_MATHMAPS_SYMBOLS_json_files_FILES) chromevox_deploy_fs_out/chromevox/background/mathmaps/symbols
	@mkdir -p chromevox_deploy_fs_out/chromevox/injected
	@rsync -r --chmod=+rw chromevox/injected/api.js chromevox_deploy_fs_out/chromevox/injected
	@mkdir -p chromevox_deploy_fs_out/chromevox/injected
	@rsync -r --chmod=+rw chromevox/injected/api_util.js chromevox_deploy_fs_out/chromevox/injected
	@mkdir -p chromevox_deploy_fs_out/chromevox/injected
	@rsync -r --chmod=+rw chromevox/injected/mathjax.js chromevox_deploy_fs_out/chromevox/injected
	@mkdir -p chromevox_deploy_fs_out/chromevox/injected
	@rsync -r --chmod=+rw chromevox/injected/mathjax_external_util.js chromevox_deploy_fs_out/chromevox/injected
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/abstract_result.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/constants.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/context_menu.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/results.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/search.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/search_tools.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/extensions/searchvox
	@rsync -r --chmod=+rw extensions/searchvox/util.js chromevox_deploy_fs_out/extensions/searchvox
	@mkdir -p chromevox_deploy_fs_out/chromevox/background/braille/tables/
	@rsync -r --chmod=+rw external/tables/ chromevox_deploy_fs_out/chromevox/background/braille/tables/

chromevox_deploy_fs: chromevox_deploy_fs_out
chromevox_deploy_fs_FILES = $(chromevox_deploy_fs_out_FILES)
chromevox_deploy_crx_SRCS = $(chromevox_deploy_fs_FILES) private_keys/chromevox.pem external/package.sh
chromevox_deploy_crx_FILES = chromevox_deploy.crx
chromevox_deploy.crx: $(chromevox_deploy_crx_SRCS)
	@echo Generating file chromevox_deploy.crx
	@external/package.sh --key private_keys/chromevox.pem --src $(chromevox_deploy_fs_FILES) --crx $@


CHROMEVOX_manifest_uncompiled_manifest_gen_SRCS = chromevox/manifest_uncompiled.json
CHROMEVOX_manifest_uncompiled_manifest_gen_FILES = chromevox/manifest_uncompiled_manifest/manifest.json
chromevox/manifest_uncompiled_manifest/manifest.json: $(CHROMEVOX_manifest_uncompiled_manifest_gen_SRCS)
	@echo Generating file chromevox/manifest_uncompiled_manifest/manifest.json
	@mkdir -p $(dir chromevox/manifest_uncompiled_manifest/manifest.json)
	@cat $< >$@


CHROMEVOX_manifest_uncompiled_manifest/manifest.json_FILES = $(CHROMEVOX_manifest_uncompiled_manifest_gen_FILES)
chromevox_deploy_uncompiled_fs_out_SRCS = $(CHROMEVOX_manifest_uncompiled_manifest/manifest.json_FILES) $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES) external/tables
chromevox_deploy_uncompiled_fs_out_FILES = chromevox_deploy_uncompiled_fs_out
chromevox_deploy_uncompiled_fs_out: $(chromevox_deploy_uncompiled_fs_out_SRCS)
	@echo Building Fileset chromevox_deploy_uncompiled_fs_out
	@mkdir -p $(chromevox_deploy_uncompiled_fs_out_FILES)
	@rsync -r --chmod=+rw $(CHROMEVOX_manifest_uncompiled_manifest/manifest.json_FILES) chromevox_deploy_uncompiled_fs_out/
	@mkdir -p chromevox_deploy_uncompiled_fs_out/_locales/en
	@rsync -r --chmod=+rw $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES) chromevox_deploy_uncompiled_fs_out/_locales/en
	@mkdir -p chromevox_deploy_uncompiled_fs_out/chromevox/background/braille/tables/
	@rsync -r --chmod=+rw external/tables/ chromevox_deploy_uncompiled_fs_out/chromevox/background/braille/tables/

chromevox_deploy_uncompiled_fs: chromevox_deploy_uncompiled_fs_out
chromevox_deploy_uncompiled_fs_FILES = $(chromevox_deploy_uncompiled_fs_out_FILES)
chromevox: host/testing/test_messages.js chromevox_deploy_uncompiled_fs deps.js
	@echo Building unpacked Chrome extension for chromevox
	@cp -a chromevox_deploy_uncompiled_fs_out/* .

HOST_ANDROID_DEV_braille_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_braille_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_ANDROID_DEV_braille_SRCS = host/android_dev/braille.js
HOST_ANDROID_DEV_braille_FILES = $(HOST_ANDROID_DEV_braille_DEPS) $(HOST_ANDROID_DEV_braille_SRCS)

HOST_ANDROID_DEV_earcons_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_ANDROID_DEV_earcons_SRCS = host/android_dev/earcons.js
HOST_ANDROID_DEV_earcons_FILES = $(HOST_ANDROID_DEV_earcons_DEPS) $(HOST_ANDROID_DEV_earcons_SRCS)

CHROMEVOX_INJECTED_api_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES)
CHROMEVOX_INJECTED_api_SRCS = chromevox/injected/api.js
CHROMEVOX_INJECTED_api_FILES = $(CHROMEVOX_INJECTED_api_DEPS) $(CHROMEVOX_INJECTED_api_SRCS)

HOST_ANDROID_DEV_android_keymap_DEPS = $(CLOSURE_base_FILES)
HOST_ANDROID_DEV_android_keymap_SRCS = host/android_dev/android_keymap.js
HOST_ANDROID_DEV_android_keymap_FILES = $(HOST_ANDROID_DEV_android_keymap_DEPS) $(HOST_ANDROID_DEV_android_keymap_SRCS)

HOST_ANDROID_DEV_android_mathmap_DEPS = $(CLOSURE_base_FILES) $(COMMON_nav_description_FILES) $(SPEECH_RULES_math_simple_store_FILES) $(SPEECH_RULES_math_store_FILES)
HOST_ANDROID_DEV_android_mathmap_SRCS = host/android_dev/android_mathmap.js
HOST_ANDROID_DEV_android_mathmap_FILES = $(HOST_ANDROID_DEV_android_mathmap_DEPS) $(HOST_ANDROID_DEV_android_mathmap_SRCS)

HOST_ANDROID_DEV_androidvox_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_UI_search_widget_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_user_commands_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(COMMON_focuser_FILES) $(HOST_INTERFACE_abstract_tts_FILES)
HOST_ANDROID_DEV_androidvox_SRCS = host/android_dev/androidvox.js
HOST_ANDROID_DEV_androidvox_FILES = $(HOST_ANDROID_DEV_androidvox_DEPS) $(HOST_ANDROID_DEV_androidvox_SRCS)

HOST_ANDROID_DEV_host_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_initial_speech_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_ANDROID_DEV_android_keymap_FILES) $(HOST_ANDROID_DEV_android_mathmap_FILES) $(HOST_ANDROID_DEV_androidvox_FILES)
HOST_ANDROID_DEV_host_SRCS = host/android_dev/host.js
HOST_ANDROID_DEV_host_FILES = $(HOST_ANDROID_DEV_host_DEPS) $(HOST_ANDROID_DEV_host_SRCS)

CHROMEVOX_INJECTED_mathjax_external_util_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_INJECTED_mathjax_external_util_SRCS = chromevox/injected/mathjax_external_util.js
CHROMEVOX_INJECTED_mathjax_external_util_FILES = $(CHROMEVOX_INJECTED_mathjax_external_util_DEPS) $(CHROMEVOX_INJECTED_mathjax_external_util_SRCS)

HOST_ANDROID_DEV_mathjax_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_mathjax_external_util_FILES) $(HOST_INTERFACE_abstract_mathjax_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_ANDROID_DEV_mathjax_SRCS = host/android_dev/mathjax.js
HOST_ANDROID_DEV_mathjax_FILES = $(HOST_ANDROID_DEV_mathjax_DEPS) $(HOST_ANDROID_DEV_mathjax_SRCS)

HOST_ANDROID_DEV_tts_DEPS = $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_ANDROID_DEV_tts_SRCS = host/android_dev/tts.js
HOST_ANDROID_DEV_tts_FILES = $(HOST_ANDROID_DEV_tts_DEPS) $(HOST_ANDROID_DEV_tts_SRCS)

ANDROID_INJECTED_loader_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_init_document_FILES) $(HOST_ANDROID_DEV_braille_FILES) $(HOST_ANDROID_DEV_earcons_FILES) $(HOST_ANDROID_DEV_host_FILES) $(HOST_ANDROID_DEV_mathjax_FILES) $(HOST_ANDROID_DEV_tts_FILES) $(HOST_TESTING_msgs_FILES)
ANDROID_INJECTED_loader_SRCS = android/injected/loader.js
ANDROID_INJECTED_loader_FILES = $(ANDROID_INJECTED_loader_DEPS) $(ANDROID_INJECTED_loader_SRCS)

androidVoxDev_DEPS = $(ANDROID_INJECTED_loader_FILES)
androidVoxDev.js_FILES = androidVoxDev.js
androidVoxDev.js: $(androidVoxDev_DEPS)
	@echo Building Javascript binary androidVoxDev.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file androidVoxDev.js


HOST_CLANK_host_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(HOST_ANDROID_DEV_androidvox_FILES) $(HOST_ANDROID_DEV_host_FILES) $(HOST_INTERFACE_host_factory_FILES)
HOST_CLANK_host_SRCS = host/clank/host.js
HOST_CLANK_host_FILES = $(HOST_CLANK_host_DEPS) $(HOST_CLANK_host_SRCS)

CLANK_INJECTED_loader_DEPS = $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_init_document_FILES) $(HOST_ANDROID_DEV_braille_FILES) $(HOST_ANDROID_DEV_earcons_FILES) $(HOST_ANDROID_DEV_tts_FILES) $(HOST_CLANK_host_FILES) $(HOST_TESTING_msgs_FILES)
CLANK_INJECTED_loader_SRCS = clank/injected/loader.js
CLANK_INJECTED_loader_FILES = $(CLANK_INJECTED_loader_DEPS) $(CLANK_INJECTED_loader_SRCS)

clankVoxDev_DEPS = $(CLANK_INJECTED_loader_FILES)
clankVoxDev.js_FILES = clankVoxDev.js
clankVoxDev.js: $(clankVoxDev_DEPS)
	@echo Building Javascript binary clankVoxDev.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file clankVoxDev.js


CHROMEVIS_manifestmanifest_gen_SRCS = chromevis/manifest.json
CHROMEVIS_manifestmanifest_gen_FILES = chromevis/manifest_compiled_manifest/manifest.json
chromevis/manifest_compiled_manifest/manifest.json: $(CHROMEVIS_manifestmanifest_gen_SRCS)
	@echo Generating file chromevis/manifest_compiled_manifest/manifest.json
	@mkdir -p $(dir chromevis/manifest_compiled_manifest/manifest.json)
	@cat $< | sed -e 's/loader.js/LOADER.JS/' | grep -vE '^ *"[^ ]*.js"' | sed -e 's/LOADER.JS/binary.js/' >$@


CHROMEVIS_manifest_compiled_manifest/manifest.json_FILES = $(CHROMEVIS_manifestmanifest_gen_FILES)
CHROMEVIS_i18n_messages_DEPS = $(CLOSURE_base_FILES)
CHROMEVIS_i18n_messages_SRCS = chromevis/i18n_messages.js
CHROMEVIS_i18n_messages_FILES = $(CHROMEVIS_i18n_messages_DEPS) $(CHROMEVIS_i18n_messages_SRCS)

CHROMEVIS_i18n_messages_messages_jslib_DEPS = $(CHROMEVIS_i18n_messages_FILES) $(CHROME_messages_wrapper_FILES)
CHROMEVIS_i18n_messages_messages_jslib_FILES = $(CHROMEVIS_i18n_messages_messages_jslib_DEPS)

CHROMEVIS_i18n_messages_localized__en_DEPS = $(CHROMEVIS_i18n_messages_messages_jslib_FILES)
chromevis/i18n_messages_localized__en.js_FILES = chromevis/i18n_messages_localized__en.js
chromevis/i18n_messages_localized__en.js: $(CHROMEVIS_i18n_messages_localized__en_DEPS)
	@echo Building Javascript binary chromevis/i18n_messages_localized__en.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromevis/i18n_messages_localized__en.js


CHROMEVIS_i18n_messages_localized__en.js_FILES = chromevis/i18n_messages_localized__en.js
CHROMEVIS_messages_en.json_SRCS = $(CHROMEVIS_i18n_messages_localized__en.js_FILES)
CHROMEVIS_messages_en.json_FILES = chromevis/_locales/en/messages.json
chromevis/_locales/en/messages.json: $(CHROMEVIS_messages_en.json_SRCS)
	@echo Generating file chromevis/_locales/en/messages.json
	@mkdir -p $(dir chromevis/_locales/en/messages.json)
	@$(RHINO) $(CHROMEVIS_messages_en.json_SRCS) > $(CHROMEVIS_messages_en.json_FILES)


CHROMEVIS__locales/en/messages.json_FILES = $(CHROMEVIS_messages_en.json_FILES)
CHROMEVIS_i18n_messages_filegroup_FILES = $(CHROMEVIS__locales/en/messages.json_FILES)
CHROMEVIS_i18n_messages_filegroup: $(CHROMEVIS_i18n_messages_filegroup_FILES)

CHROMEVIS_png_files_FILES = $(wildcard chromevis/*.png)
CHROMEVIS_png_files: $(CHROMEVIS_png_files_FILES)

CHROMEVIS_BACKGROUND_loader_DEPS = $(CLOSURE_base_FILES) $(HOST_CHROME_extension_bridge_FILES)
CHROMEVIS_BACKGROUND_loader_SRCS = chromevis/background/loader.js
CHROMEVIS_BACKGROUND_loader_FILES = $(CHROMEVIS_BACKGROUND_loader_DEPS) $(CHROMEVIS_BACKGROUND_loader_SRCS)

CHROMEVIS_BACKGROUND_background_DEPS = $(CHROMEVIS_BACKGROUND_loader_FILES)
chromevis/background/background.js_FILES = chromevis/background/background.js
chromevis/background/background.js: $(CHROMEVIS_BACKGROUND_background_DEPS)
	@echo Building Javascript binary chromevis/background/background.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromevis/background/background.js


CHROMEVIS_BACKGROUND_background.js_FILES = chromevis/background/background.js
CHROMEVIS_BACKGROUND_html_files_FILES = $(wildcard chromevis/background/*.css) $(wildcard chromevis/background/*.html)
CHROMEVIS_BACKGROUND_html_files: $(CHROMEVIS_BACKGROUND_html_files_FILES)

HOST_INTERFACE_abstract_lens_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_lens_SRCS = host/interface/abstract_lens.js
HOST_INTERFACE_abstract_lens_FILES = $(HOST_INTERFACE_abstract_lens_DEPS) $(HOST_INTERFACE_abstract_lens_SRCS)

CHROMEVIS_INJECTED_lens_DEPS = $(CLOSURE_base_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_util_FILES) $(HOST_INTERFACE_abstract_lens_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_tts_interface_FILES)
CHROMEVIS_INJECTED_lens_SRCS = chromevis/injected/lens.js
CHROMEVIS_INJECTED_lens_FILES = $(CHROMEVIS_INJECTED_lens_DEPS) $(CHROMEVIS_INJECTED_lens_SRCS)

CHROMEVIS_INJECTED_reader_DEPS = $(CLOSURE_base_FILES) $(COMMON_traverse_content_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMEVIS_INJECTED_lens_FILES)
CHROMEVIS_INJECTED_reader_SRCS = chromevis/injected/reader.js
CHROMEVIS_INJECTED_reader_FILES = $(CHROMEVIS_INJECTED_reader_DEPS) $(CHROMEVIS_INJECTED_reader_SRCS)

CHROMEVIS_INJECTED_main_DEPS = $(CLOSURE_base_FILES) $(COMMON_focus_util_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMEVIS_INJECTED_lens_FILES) $(CHROMEVIS_INJECTED_reader_FILES)
CHROMEVIS_INJECTED_main_SRCS = chromevis/injected/main.js
CHROMEVIS_INJECTED_main_FILES = $(CHROMEVIS_INJECTED_main_DEPS) $(CHROMEVIS_INJECTED_main_SRCS)

CHROMEVIS_INJECTED_loader_DEPS = $(CLOSURE_base_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_tts_FILES) $(CHROMEVIS_INJECTED_main_FILES)
CHROMEVIS_INJECTED_loader_SRCS = chromevis/injected/loader.js
CHROMEVIS_INJECTED_loader_FILES = $(CHROMEVIS_INJECTED_loader_DEPS) $(CHROMEVIS_INJECTED_loader_SRCS)

CHROMEVIS_INJECTED_binary_DEPS = $(CHROMEVIS_INJECTED_loader_FILES)
chromevis/injected/binary.js_FILES = chromevis/injected/binary.js
chromevis/injected/binary.js: $(CHROMEVIS_INJECTED_binary_DEPS)
	@echo Building Javascript binary chromevis/injected/binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromevis/injected/binary.js


CHROMEVIS_INJECTED_binary.js_FILES = chromevis/injected/binary.js
chromevis_deploy_fs_out_SRCS = $(CHROMEVIS_manifest_compiled_manifest/manifest.json_FILES) $(CHROMEVIS_i18n_messages_filegroup_FILES) closure/closure_preinit.js $(CHROMEVIS_png_files_FILES) $(CHROMEVIS_BACKGROUND_background.js_FILES) $(CHROMEVIS_BACKGROUND_html_files_FILES) $(CHROMEVIS_INJECTED_binary.js_FILES) external/arrow.gif external/cross.gif external/hs.png external/hv.png external/jscolor.js external/keycode.js
chromevis_deploy_fs_out_FILES = chromevis_deploy_fs_out
chromevis_deploy_fs_out: $(chromevis_deploy_fs_out_SRCS)
	@echo Building Fileset chromevis_deploy_fs_out
	@mkdir -p $(chromevis_deploy_fs_out_FILES)
	@rsync -r --chmod=+rw $(CHROMEVIS_manifest_compiled_manifest/manifest.json_FILES) chromevis_deploy_fs_out/
	@mkdir -p chromevis_deploy_fs_out/_locales/en
	@rsync -r --chmod=+rw $(CHROMEVIS_i18n_messages_filegroup_FILES) chromevis_deploy_fs_out/_locales/en
	@rsync -r --chmod=+rw closure/closure_preinit.js chromevis_deploy_fs_out/
	@mkdir -p chromevis_deploy_fs_out/chromevis
	@rsync -r --chmod=+rw $(CHROMEVIS_png_files_FILES) chromevis_deploy_fs_out/chromevis
	@mkdir -p chromevis_deploy_fs_out/chromevis/background
	@rsync -r --chmod=+rw $(CHROMEVIS_BACKGROUND_background.js_FILES) chromevis_deploy_fs_out/chromevis/background
	@mkdir -p chromevis_deploy_fs_out/chromevis/background
	@rsync -r --chmod=+rw $(CHROMEVIS_BACKGROUND_html_files_FILES) chromevis_deploy_fs_out/chromevis/background
	@mkdir -p chromevis_deploy_fs_out/chromevis/injected
	@rsync -r --chmod=+rw $(CHROMEVIS_INJECTED_binary.js_FILES) chromevis_deploy_fs_out/chromevis/injected
	@rsync -r --chmod=+rw external/arrow.gif chromevis_deploy_fs_out/
	@rsync -r --chmod=+rw external/cross.gif chromevis_deploy_fs_out/
	@rsync -r --chmod=+rw external/hs.png chromevis_deploy_fs_out/
	@rsync -r --chmod=+rw external/hv.png chromevis_deploy_fs_out/
	@rsync -r --chmod=+rw external/jscolor.js chromevis_deploy_fs_out/
	@rsync -r --chmod=+rw external/keycode.js chromevis_deploy_fs_out/

chromevis_deploy_fs: chromevis_deploy_fs_out
chromevis_deploy_fs_FILES = $(chromevis_deploy_fs_out_FILES)
chromevis_deploy_crx_SRCS = $(chromevis_deploy_fs_FILES) private_keys/chromevis.pem external/package.sh
chromevis_deploy_crx_FILES = chromevis_deploy.crx
chromevis_deploy.crx: $(chromevis_deploy_crx_SRCS)
	@echo Generating file chromevis_deploy.crx
	@external/package.sh --key private_keys/chromevis.pem --src $(chromevis_deploy_fs_FILES) --crx $@


CHROMEVIS_manifest_uncompiled_manifest_gen_SRCS = chromevis/manifest.json
CHROMEVIS_manifest_uncompiled_manifest_gen_FILES = chromevis/manifest_uncompiled_manifest/manifest.json
chromevis/manifest_uncompiled_manifest/manifest.json: $(CHROMEVIS_manifest_uncompiled_manifest_gen_SRCS)
	@echo Generating file chromevis/manifest_uncompiled_manifest/manifest.json
	@mkdir -p $(dir chromevis/manifest_uncompiled_manifest/manifest.json)
	@cat $< >$@


CHROMEVIS_manifest_uncompiled_manifest/manifest.json_FILES = $(CHROMEVIS_manifest_uncompiled_manifest_gen_FILES)
chromevis_deploy_uncompiled_fs_out_SRCS = $(CHROMEVIS_manifest_uncompiled_manifest/manifest.json_FILES) $(CHROMEVIS_i18n_messages_filegroup_FILES) external/arrow.gif external/cross.gif external/hs.png external/hv.png external/jscolor.js external/keycode.js
chromevis_deploy_uncompiled_fs_out_FILES = chromevis_deploy_uncompiled_fs_out
chromevis_deploy_uncompiled_fs_out: $(chromevis_deploy_uncompiled_fs_out_SRCS)
	@echo Building Fileset chromevis_deploy_uncompiled_fs_out
	@mkdir -p $(chromevis_deploy_uncompiled_fs_out_FILES)
	@rsync -r --chmod=+rw $(CHROMEVIS_manifest_uncompiled_manifest/manifest.json_FILES) chromevis_deploy_uncompiled_fs_out/
	@mkdir -p chromevis_deploy_uncompiled_fs_out/_locales/en
	@rsync -r --chmod=+rw $(CHROMEVIS_i18n_messages_filegroup_FILES) chromevis_deploy_uncompiled_fs_out/_locales/en
	@rsync -r --chmod=+rw external/arrow.gif chromevis_deploy_uncompiled_fs_out/
	@rsync -r --chmod=+rw external/cross.gif chromevis_deploy_uncompiled_fs_out/
	@rsync -r --chmod=+rw external/hs.png chromevis_deploy_uncompiled_fs_out/
	@rsync -r --chmod=+rw external/hv.png chromevis_deploy_uncompiled_fs_out/
	@rsync -r --chmod=+rw external/jscolor.js chromevis_deploy_uncompiled_fs_out/
	@rsync -r --chmod=+rw external/keycode.js chromevis_deploy_uncompiled_fs_out/

chromevis_deploy_uncompiled_fs: chromevis_deploy_uncompiled_fs_out
chromevis_deploy_uncompiled_fs_FILES = $(chromevis_deploy_uncompiled_fs_out_FILES)
chromevis: host/testing/test_messages.js chromevis_deploy_uncompiled_fs deps.js
	@echo Building unpacked Chrome extension for chromevis
	@cp -a chromevis_deploy_uncompiled_fs_out/* .

CHROMESHADES_manifestmanifest_gen_SRCS = chromeshades/manifest.json
CHROMESHADES_manifestmanifest_gen_FILES = chromeshades/manifest_compiled_manifest/manifest.json
chromeshades/manifest_compiled_manifest/manifest.json: $(CHROMESHADES_manifestmanifest_gen_SRCS)
	@echo Generating file chromeshades/manifest_compiled_manifest/manifest.json
	@mkdir -p $(dir chromeshades/manifest_compiled_manifest/manifest.json)
	@cat $< | sed -e 's/loader.js/LOADER.JS/' | grep -vE '^ *"[^ ]*.js"' | sed -e 's/LOADER.JS/binary.js/' >$@


CHROMESHADES_manifest_compiled_manifest/manifest.json_FILES = $(CHROMESHADES_manifestmanifest_gen_FILES)
CHROMESHADES_png_files_FILES = $(wildcard chromeshades/*.png)
CHROMESHADES_png_files: $(CHROMESHADES_png_files_FILES)

CHROMESHADES_BACKGROUND_toggle_DEPS = $(CLOSURE_base_FILES)
CHROMESHADES_BACKGROUND_toggle_SRCS = chromeshades/background/toggle.js
CHROMESHADES_BACKGROUND_toggle_FILES = $(CHROMESHADES_BACKGROUND_toggle_DEPS) $(CHROMESHADES_BACKGROUND_toggle_SRCS)

CHROMESHADES_BACKGROUND_background_DEPS = $(CLOSURE_base_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMESHADES_BACKGROUND_toggle_FILES)
CHROMESHADES_BACKGROUND_background_SRCS = chromeshades/background/background.js
CHROMESHADES_BACKGROUND_background_FILES = $(CHROMESHADES_BACKGROUND_background_DEPS) $(CHROMESHADES_BACKGROUND_background_SRCS)

CHROMESHADES_BACKGROUND_loader_DEPS = $(CLOSURE_base_FILES) $(CHROMESHADES_BACKGROUND_background_FILES)
CHROMESHADES_BACKGROUND_loader_SRCS = chromeshades/background/loader.js
CHROMESHADES_BACKGROUND_loader_FILES = $(CHROMESHADES_BACKGROUND_loader_DEPS) $(CHROMESHADES_BACKGROUND_loader_SRCS)

CHROMESHADES_BACKGROUND_binary_DEPS = $(CHROMESHADES_BACKGROUND_loader_FILES)
chromeshades/background/binary.js_FILES = chromeshades/background/binary.js
chromeshades/background/binary.js: $(CHROMESHADES_BACKGROUND_binary_DEPS)
	@echo Building Javascript binary chromeshades/background/binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeshades/background/binary.js


CHROMESHADES_BACKGROUND_binary.js_FILES = chromeshades/background/binary.js
CHROMESHADES_BACKGROUND_html_files_FILES = $(wildcard chromeshades/background/*.html)
CHROMESHADES_BACKGROUND_html_files: $(CHROMESHADES_BACKGROUND_html_files_FILES)

ACCESSERRORS_accesserrors_DEPS = $(CLOSURE_base_FILES)
ACCESSERRORS_accesserrors_SRCS = accesserrors/accesserrors.js
ACCESSERRORS_accesserrors_FILES = $(ACCESSERRORS_accesserrors_DEPS) $(ACCESSERRORS_accesserrors_SRCS)

CHROMESHADES_DEVTOOLS_loader_DEPS = $(CLOSURE_base_FILES) $(ACCESSERRORS_accesserrors_FILES)
CHROMESHADES_DEVTOOLS_loader_SRCS = chromeshades/devtools/loader.js
CHROMESHADES_DEVTOOLS_loader_FILES = $(CHROMESHADES_DEVTOOLS_loader_DEPS) $(CHROMESHADES_DEVTOOLS_loader_SRCS)

CHROMESHADES_DEVTOOLS_binary_DEPS = $(CHROMESHADES_DEVTOOLS_loader_FILES)
chromeshades/devtools/binary.js_FILES = chromeshades/devtools/binary.js
chromeshades/devtools/binary.js: $(CHROMESHADES_DEVTOOLS_binary_DEPS)
	@echo Building Javascript binary chromeshades/devtools/binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeshades/devtools/binary.js


CHROMESHADES_DEVTOOLS_binary.js_FILES = chromeshades/devtools/binary.js
CHROMESHADES_DEVTOOLS_html_files_FILES = $(wildcard chromeshades/devtools/*.html)
CHROMESHADES_DEVTOOLS_html_files: $(CHROMESHADES_DEVTOOLS_html_files_FILES)

CHROMESHADES_INJECTED_accesserrors_injected_DEPS = $(CLOSURE_base_FILES) $(ACCESSERRORS_accesserrors_FILES)
CHROMESHADES_INJECTED_accesserrors_injected_SRCS = chromeshades/injected/accesserrors_injected.js
CHROMESHADES_INJECTED_accesserrors_injected_FILES = $(CHROMESHADES_INJECTED_accesserrors_injected_DEPS) $(CHROMESHADES_INJECTED_accesserrors_injected_SRCS)

CHROMESHADES_INJECTED_accesserrors_binary_DEPS = $(CHROMESHADES_INJECTED_accesserrors_injected_FILES)
chromeshades/injected/accesserrors_binary.js_FILES = chromeshades/injected/accesserrors_binary.js
chromeshades/injected/accesserrors_binary.js: $(CHROMESHADES_INJECTED_accesserrors_binary_DEPS)
	@echo Building Javascript binary chromeshades/injected/accesserrors_binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeshades/injected/accesserrors_binary.js


CHROMESHADES_INJECTED_accesserrors_binary.js_FILES = chromeshades/injected/accesserrors_binary.js
CHROMESHADES_INJECTED_base_modifier_DEPS = $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_interframe_FILES) $(HOST_CHROME_extension_bridge_FILES)
CHROMESHADES_INJECTED_base_modifier_SRCS = chromeshades/injected/base_modifier.js
CHROMESHADES_INJECTED_base_modifier_FILES = $(CHROMESHADES_INJECTED_base_modifier_DEPS) $(CHROMESHADES_INJECTED_base_modifier_SRCS)

CHROMESHADES_INJECTED_shades_modifier_DEPS = $(CLOSURE_base_FILES) $(COMMON_xpath_util_FILES)
CHROMESHADES_INJECTED_shades_modifier_SRCS = chromeshades/injected/shades_modifier.js
CHROMESHADES_INJECTED_shades_modifier_FILES = $(CHROMESHADES_INJECTED_shades_modifier_DEPS) $(CHROMESHADES_INJECTED_shades_modifier_SRCS)

CHROMESHADES_INJECTED_loader_DEPS = $(CLOSURE_base_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMESHADES_INJECTED_base_modifier_FILES) $(CHROMESHADES_INJECTED_shades_modifier_FILES)
CHROMESHADES_INJECTED_loader_SRCS = chromeshades/injected/loader.js
CHROMESHADES_INJECTED_loader_FILES = $(CHROMESHADES_INJECTED_loader_DEPS) $(CHROMESHADES_INJECTED_loader_SRCS)

CHROMESHADES_INJECTED_binary_DEPS = $(CHROMESHADES_INJECTED_loader_FILES)
chromeshades/injected/binary.js_FILES = chromeshades/injected/binary.js
chromeshades/injected/binary.js: $(CHROMESHADES_INJECTED_binary_DEPS)
	@echo Building Javascript binary chromeshades/injected/binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file chromeshades/injected/binary.js


CHROMESHADES_INJECTED_binary.js_FILES = chromeshades/injected/binary.js
chromeshades_deploy_fs_out_SRCS = $(CHROMESHADES_manifest_compiled_manifest/manifest.json_FILES) closure/closure_preinit.js chromeshades/chromeshades.css $(CHROMESHADES_png_files_FILES) $(CHROMESHADES_BACKGROUND_binary.js_FILES) $(CHROMESHADES_BACKGROUND_html_files_FILES) chromeshades/background/selector.js $(CHROMESHADES_DEVTOOLS_binary.js_FILES) $(CHROMESHADES_DEVTOOLS_html_files_FILES) $(CHROMESHADES_INJECTED_accesserrors_binary.js_FILES) $(CHROMESHADES_INJECTED_binary.js_FILES)
chromeshades_deploy_fs_out_FILES = chromeshades_deploy_fs_out
chromeshades_deploy_fs_out: $(chromeshades_deploy_fs_out_SRCS)
	@echo Building Fileset chromeshades_deploy_fs_out
	@mkdir -p $(chromeshades_deploy_fs_out_FILES)
	@rsync -r --chmod=+rw $(CHROMESHADES_manifest_compiled_manifest/manifest.json_FILES) chromeshades_deploy_fs_out/
	@rsync -r --chmod=+rw closure/closure_preinit.js chromeshades_deploy_fs_out/
	@mkdir -p chromeshades_deploy_fs_out/chromeshades
	@rsync -r --chmod=+rw chromeshades/chromeshades.css chromeshades_deploy_fs_out/chromeshades
	@mkdir -p chromeshades_deploy_fs_out/chromeshades
	@rsync -r --chmod=+rw $(CHROMESHADES_png_files_FILES) chromeshades_deploy_fs_out/chromeshades
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/background
	@rsync -r --chmod=+rw $(CHROMESHADES_BACKGROUND_binary.js_FILES) chromeshades_deploy_fs_out/chromeshades/background
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/background
	@rsync -r --chmod=+rw $(CHROMESHADES_BACKGROUND_html_files_FILES) chromeshades_deploy_fs_out/chromeshades/background
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/background
	@rsync -r --chmod=+rw chromeshades/background/selector.js chromeshades_deploy_fs_out/chromeshades/background
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/devtools
	@rsync -r --chmod=+rw $(CHROMESHADES_DEVTOOLS_binary.js_FILES) chromeshades_deploy_fs_out/chromeshades/devtools
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/devtools
	@rsync -r --chmod=+rw $(CHROMESHADES_DEVTOOLS_html_files_FILES) chromeshades_deploy_fs_out/chromeshades/devtools
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/injected
	@rsync -r --chmod=+rw $(CHROMESHADES_INJECTED_accesserrors_binary.js_FILES) chromeshades_deploy_fs_out/chromeshades/injected
	@mkdir -p chromeshades_deploy_fs_out/chromeshades/injected
	@rsync -r --chmod=+rw $(CHROMESHADES_INJECTED_binary.js_FILES) chromeshades_deploy_fs_out/chromeshades/injected

chromeshades_deploy_fs: chromeshades_deploy_fs_out
chromeshades_deploy_fs_FILES = $(chromeshades_deploy_fs_out_FILES)
chromeshades_deploy_crx_SRCS = $(chromeshades_deploy_fs_FILES) private_keys/chromeshades.pem external/package.sh
chromeshades_deploy_crx_FILES = chromeshades_deploy.crx
chromeshades_deploy.crx: $(chromeshades_deploy_crx_SRCS)
	@echo Generating file chromeshades_deploy.crx
	@external/package.sh --key private_keys/chromeshades.pem --src $(chromeshades_deploy_fs_FILES) --crx $@


CHROMESHADES_manifest_uncompiled_manifest_gen_SRCS = chromeshades/manifest.json
CHROMESHADES_manifest_uncompiled_manifest_gen_FILES = chromeshades/manifest_uncompiled_manifest/manifest.json
chromeshades/manifest_uncompiled_manifest/manifest.json: $(CHROMESHADES_manifest_uncompiled_manifest_gen_SRCS)
	@echo Generating file chromeshades/manifest_uncompiled_manifest/manifest.json
	@mkdir -p $(dir chromeshades/manifest_uncompiled_manifest/manifest.json)
	@cat $< >$@


CHROMESHADES_manifest_uncompiled_manifest/manifest.json_FILES = $(CHROMESHADES_manifest_uncompiled_manifest_gen_FILES)
chromeshades_deploy_uncompiled_fs_out_SRCS = $(CHROMESHADES_manifest_uncompiled_manifest/manifest.json_FILES)
chromeshades_deploy_uncompiled_fs_out_FILES = chromeshades_deploy_uncompiled_fs_out
chromeshades_deploy_uncompiled_fs_out: $(chromeshades_deploy_uncompiled_fs_out_SRCS)
	@echo Building Fileset chromeshades_deploy_uncompiled_fs_out
	@mkdir -p $(chromeshades_deploy_uncompiled_fs_out_FILES)
	@rsync -r --chmod=+rw $(CHROMESHADES_manifest_uncompiled_manifest/manifest.json_FILES) chromeshades_deploy_uncompiled_fs_out/

chromeshades_deploy_uncompiled_fs: chromeshades_deploy_uncompiled_fs_out
chromeshades_deploy_uncompiled_fs_FILES = $(chromeshades_deploy_uncompiled_fs_out_FILES)
chromeshades: host/testing/test_messages.js chromeshades_deploy_uncompiled_fs deps.js
	@echo Building unpacked Chrome extension for chromeshades
	@cp -a chromeshades_deploy_uncompiled_fs_out/* .

CARETBROWSING_manifestmanifest_gen_SRCS = caretbrowsing/manifest.json
CARETBROWSING_manifestmanifest_gen_FILES = caretbrowsing/manifest_compiled_manifest/manifest.json
caretbrowsing/manifest_compiled_manifest/manifest.json: $(CARETBROWSING_manifestmanifest_gen_SRCS)
	@echo Generating file caretbrowsing/manifest_compiled_manifest/manifest.json
	@mkdir -p $(dir caretbrowsing/manifest_compiled_manifest/manifest.json)
	@cat $< | sed -e 's/loader.js/LOADER.JS/' | grep -vE '^ *"[^ ]*.js"' | sed -e 's/LOADER.JS/binary.js/' >$@


CARETBROWSING_manifest_compiled_manifest/manifest.json_FILES = $(CARETBROWSING_manifestmanifest_gen_FILES)
CARETBROWSING_png_files_FILES = $(wildcard caretbrowsing/*.png)
CARETBROWSING_png_files: $(CARETBROWSING_png_files_FILES)

CARETBROWSING_INJECTED_caretbrowsing_DEPS = $(CLOSURE_base_FILES) $(COMMON_cursor_FILES) $(COMMON_dom_util_FILES) $(COMMON_traverse_util_FILES)
CARETBROWSING_INJECTED_caretbrowsing_SRCS = caretbrowsing/injected/caretbrowsing.js
CARETBROWSING_INJECTED_caretbrowsing_FILES = $(CARETBROWSING_INJECTED_caretbrowsing_DEPS) $(CARETBROWSING_INJECTED_caretbrowsing_SRCS)

CARETBROWSING_INJECTED_loader_DEPS = $(CLOSURE_base_FILES) $(CARETBROWSING_INJECTED_caretbrowsing_FILES)
CARETBROWSING_INJECTED_loader_SRCS = caretbrowsing/injected/loader.js
CARETBROWSING_INJECTED_loader_FILES = $(CARETBROWSING_INJECTED_loader_DEPS) $(CARETBROWSING_INJECTED_loader_SRCS)

CARETBROWSING_INJECTED_binary_DEPS = $(CARETBROWSING_INJECTED_loader_FILES)
caretbrowsing/injected/binary.js_FILES = caretbrowsing/injected/binary.js
caretbrowsing/injected/binary.js: $(CARETBROWSING_INJECTED_binary_DEPS)
	@echo Building Javascript binary caretbrowsing/injected/binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file caretbrowsing/injected/binary.js


CARETBROWSING_INJECTED_binary.js_FILES = caretbrowsing/injected/binary.js
caretbrowsing_deploy_fs_out_SRCS = $(CARETBROWSING_manifest_compiled_manifest/manifest.json_FILES) closure/closure_preinit.js $(CARETBROWSING_png_files_FILES) caretbrowsing/background/background.html caretbrowsing/background/background.js $(CARETBROWSING_INJECTED_binary.js_FILES)
caretbrowsing_deploy_fs_out_FILES = caretbrowsing_deploy_fs_out
caretbrowsing_deploy_fs_out: $(caretbrowsing_deploy_fs_out_SRCS)
	@echo Building Fileset caretbrowsing_deploy_fs_out
	@mkdir -p $(caretbrowsing_deploy_fs_out_FILES)
	@rsync -r --chmod=+rw $(CARETBROWSING_manifest_compiled_manifest/manifest.json_FILES) caretbrowsing_deploy_fs_out/
	@rsync -r --chmod=+rw closure/closure_preinit.js caretbrowsing_deploy_fs_out/
	@mkdir -p caretbrowsing_deploy_fs_out/caretbrowsing
	@rsync -r --chmod=+rw $(CARETBROWSING_png_files_FILES) caretbrowsing_deploy_fs_out/caretbrowsing
	@mkdir -p caretbrowsing_deploy_fs_out/caretbrowsing/background
	@rsync -r --chmod=+rw caretbrowsing/background/background.html caretbrowsing_deploy_fs_out/caretbrowsing/background
	@mkdir -p caretbrowsing_deploy_fs_out/caretbrowsing/background
	@rsync -r --chmod=+rw caretbrowsing/background/background.js caretbrowsing_deploy_fs_out/caretbrowsing/background
	@mkdir -p caretbrowsing_deploy_fs_out/caretbrowsing/injected
	@rsync -r --chmod=+rw $(CARETBROWSING_INJECTED_binary.js_FILES) caretbrowsing_deploy_fs_out/caretbrowsing/injected

caretbrowsing_deploy_fs: caretbrowsing_deploy_fs_out
caretbrowsing_deploy_fs_FILES = $(caretbrowsing_deploy_fs_out_FILES)
caretbrowsing_deploy_crx_SRCS = $(caretbrowsing_deploy_fs_FILES) private_keys/caretbrowsing.pem external/package.sh
caretbrowsing_deploy_crx_FILES = caretbrowsing_deploy.crx
caretbrowsing_deploy.crx: $(caretbrowsing_deploy_crx_SRCS)
	@echo Generating file caretbrowsing_deploy.crx
	@external/package.sh --key private_keys/caretbrowsing.pem --src $(caretbrowsing_deploy_fs_FILES) --crx $@


CARETBROWSING_manifest_uncompiled_manifest_gen_SRCS = caretbrowsing/manifest.json
CARETBROWSING_manifest_uncompiled_manifest_gen_FILES = caretbrowsing/manifest_uncompiled_manifest/manifest.json
caretbrowsing/manifest_uncompiled_manifest/manifest.json: $(CARETBROWSING_manifest_uncompiled_manifest_gen_SRCS)
	@echo Generating file caretbrowsing/manifest_uncompiled_manifest/manifest.json
	@mkdir -p $(dir caretbrowsing/manifest_uncompiled_manifest/manifest.json)
	@cat $< >$@


CARETBROWSING_manifest_uncompiled_manifest/manifest.json_FILES = $(CARETBROWSING_manifest_uncompiled_manifest_gen_FILES)
caretbrowsing_deploy_uncompiled_fs_out_SRCS = $(CARETBROWSING_manifest_uncompiled_manifest/manifest.json_FILES)
caretbrowsing_deploy_uncompiled_fs_out_FILES = caretbrowsing_deploy_uncompiled_fs_out
caretbrowsing_deploy_uncompiled_fs_out: $(caretbrowsing_deploy_uncompiled_fs_out_SRCS)
	@echo Building Fileset caretbrowsing_deploy_uncompiled_fs_out
	@mkdir -p $(caretbrowsing_deploy_uncompiled_fs_out_FILES)
	@rsync -r --chmod=+rw $(CARETBROWSING_manifest_uncompiled_manifest/manifest.json_FILES) caretbrowsing_deploy_uncompiled_fs_out/

caretbrowsing_deploy_uncompiled_fs: caretbrowsing_deploy_uncompiled_fs_out
caretbrowsing_deploy_uncompiled_fs_FILES = $(caretbrowsing_deploy_uncompiled_fs_out_FILES)
caretbrowsing: host/testing/test_messages.js caretbrowsing_deploy_uncompiled_fs deps.js
	@echo Building unpacked Chrome extension for caretbrowsing
	@cp -a caretbrowsing_deploy_uncompiled_fs_out/* .

CVOXEXT_manifestmanifest_gen_SRCS = cvoxext/manifest.json
CVOXEXT_manifestmanifest_gen_FILES = cvoxext/manifest_compiled_manifest/manifest.json
cvoxext/manifest_compiled_manifest/manifest.json: $(CVOXEXT_manifestmanifest_gen_SRCS)
	@echo Generating file cvoxext/manifest_compiled_manifest/manifest.json
	@mkdir -p $(dir cvoxext/manifest_compiled_manifest/manifest.json)
	@cat $< | sed -e 's/loader.js/LOADER.JS/' | grep -vE '^ *"[^ ]*.js"' | sed -e 's/LOADER.JS/binary.js/' >$@


CVOXEXT_manifest_compiled_manifest/manifest.json_FILES = $(CVOXEXT_manifestmanifest_gen_FILES)
CVOXEXT_loader_SRCS = cvoxext/loader.js
CVOXEXT_loader_FILES = $(CVOXEXT_loader_SRCS)

CVOXEXT_binary_DEPS = $(CVOXEXT_loader_FILES)
cvoxext/binary.js_FILES = cvoxext/binary.js
cvoxext/binary.js: $(CVOXEXT_binary_DEPS)
	@echo Building Javascript binary cvoxext/binary.js
	@$(CLOSURE_COMPILER) --js $^ --js_output_file cvoxext/binary.js


CVOXEXT_binary.js_FILES = cvoxext/binary.js
cvoxext_deploy_fs_out_SRCS = $(CVOXEXT_manifest_compiled_manifest/manifest.json_FILES) $(CVOXEXT_binary.js_FILES) cvoxext/common/extension.js cvoxext/common/listeners.js cvoxext/common/main.js cvoxext/common/speakable.js cvoxext/common/speakable_manager.js cvoxext/common/speakable_parser.js cvoxext/common/traverse_manager.js cvoxext/common/util.js cvoxext/extensions/books.js cvoxext/extensions/calculator.js cvoxext/extensions/calendar.js cvoxext/extensions/drive.js cvoxext/extensions/finance.js cvoxext/extensions/finance_stock_screener.js cvoxext/extensions/gmail.js cvoxext/extensions/news.js cvoxext/extensions/plus.js external/sprintf-0.7-beta1.js
cvoxext_deploy_fs_out_FILES = cvoxext_deploy_fs_out
cvoxext_deploy_fs_out: $(cvoxext_deploy_fs_out_SRCS)
	@echo Building Fileset cvoxext_deploy_fs_out
	@mkdir -p $(cvoxext_deploy_fs_out_FILES)
	@rsync -r --chmod=+rw $(CVOXEXT_manifest_compiled_manifest/manifest.json_FILES) cvoxext_deploy_fs_out/
	@mkdir -p cvoxext_deploy_fs_out/cvoxext
	@rsync -r --chmod=+rw $(CVOXEXT_binary.js_FILES) cvoxext_deploy_fs_out/cvoxext
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/extension.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/listeners.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/main.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/speakable.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/speakable_manager.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/speakable_parser.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/traverse_manager.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw cvoxext/common/util.js cvoxext_deploy_fs_out/cvoxext/common
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/books.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/calculator.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/calendar.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/drive.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/finance.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/finance_stock_screener.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/gmail.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/news.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/extensions
	@rsync -r --chmod=+rw cvoxext/extensions/plus.js cvoxext_deploy_fs_out/cvoxext/extensions
	@mkdir -p cvoxext_deploy_fs_out/cvoxext/common
	@rsync -r --chmod=+rw external/sprintf-0.7-beta1.js cvoxext_deploy_fs_out/cvoxext/common

cvoxext_deploy_fs: cvoxext_deploy_fs_out
cvoxext_deploy_fs_FILES = $(cvoxext_deploy_fs_out_FILES)
cvoxext_deploy_crx_SRCS = $(cvoxext_deploy_fs_FILES) private_keys/cvoxext.pem external/package.sh
cvoxext_deploy_crx_FILES = cvoxext_deploy.crx
cvoxext_deploy.crx: $(cvoxext_deploy_crx_SRCS)
	@echo Generating file cvoxext_deploy.crx
	@external/package.sh --key private_keys/cvoxext.pem --src $(cvoxext_deploy_fs_FILES) --crx $@


CVOXEXT_manifest_uncompiled_manifest_gen_SRCS = cvoxext/manifest.json
CVOXEXT_manifest_uncompiled_manifest_gen_FILES = cvoxext/manifest_uncompiled_manifest/manifest.json
cvoxext/manifest_uncompiled_manifest/manifest.json: $(CVOXEXT_manifest_uncompiled_manifest_gen_SRCS)
	@echo Generating file cvoxext/manifest_uncompiled_manifest/manifest.json
	@mkdir -p $(dir cvoxext/manifest_uncompiled_manifest/manifest.json)
	@cat $< >$@


CVOXEXT_manifest_uncompiled_manifest/manifest.json_FILES = $(CVOXEXT_manifest_uncompiled_manifest_gen_FILES)
cvoxext_deploy_uncompiled_fs_out_SRCS = $(CVOXEXT_manifest_uncompiled_manifest/manifest.json_FILES) external/sprintf-0.7-beta1.js
cvoxext_deploy_uncompiled_fs_out_FILES = cvoxext_deploy_uncompiled_fs_out
cvoxext_deploy_uncompiled_fs_out: $(cvoxext_deploy_uncompiled_fs_out_SRCS)
	@echo Building Fileset cvoxext_deploy_uncompiled_fs_out
	@mkdir -p $(cvoxext_deploy_uncompiled_fs_out_FILES)
	@rsync -r --chmod=+rw $(CVOXEXT_manifest_uncompiled_manifest/manifest.json_FILES) cvoxext_deploy_uncompiled_fs_out/
	@mkdir -p cvoxext_deploy_uncompiled_fs_out/cvoxext/common
	@rsync -r --chmod=+rw external/sprintf-0.7-beta1.js cvoxext_deploy_uncompiled_fs_out/cvoxext/common

cvoxext_deploy_uncompiled_fs: cvoxext_deploy_uncompiled_fs_out
cvoxext_deploy_uncompiled_fs_FILES = $(cvoxext_deploy_uncompiled_fs_out_FILES)
cvoxext: host/testing/test_messages.js cvoxext_deploy_uncompiled_fs deps.js
	@echo Building unpacked Chrome extension for cvoxext
	@cp -a cvoxext_deploy_uncompiled_fs_out/* .

clean:
	rm -rf chromevox/messages/i18n_messages_localized__en.js chromevox/messages/_locales/en/messages.json host/testing/test_messages.js chromeVoxChromePageScript.js chromeVoxKbExplorerScript.js chromeVoxTestsScript.js chromeVoxChromeBackgroundScript.js chromeVoxChromeOptionsScript.js androidVoxDev.js clankVoxDev.js chromeshades/injected/binary.js chromeshades/injected/accesserrors_binary.js chromeVoxChromePageScript.js chromeVoxKbExplorerScript.js chromeVoxTestsScript.js chromeVoxChromeBackgroundScript.js chromeVoxChromeOptionsScript.js androidVoxDev.js clankVoxDev.js chromevox/manifest_compiled_manifest/manifest.json chromevox/manifest_uncompiled_manifest/manifest.json chromevox_deploy_fs_out chromevox_deploy_fs chromevox_deploy_uncompiled_fs_out chromevox_deploy_uncompiled_fs chromevox_deploy.crx chromevis/background/background.js chromevis/injected/binary.js chromevis/i18n_messages_localized__en.js chromevis/_locales/en/messages.json chromevis/manifest_compiled_manifest/manifest.json chromevis/manifest_uncompiled_manifest/manifest.json chromevis_deploy_fs_out chromevis_deploy_fs chromevis_deploy_uncompiled_fs_out chromevis_deploy_uncompiled_fs chromevis_deploy.crx caretbrowsing/manifest_compiled_manifest/manifest.json caretbrowsing/manifest_uncompiled_manifest/manifest.json caretbrowsing/injected/binary.js caretbrowsing_deploy_fs_out caretbrowsing_deploy_fs caretbrowsing_deploy_uncompiled_fs_out caretbrowsing_deploy_uncompiled_fs caretbrowsing_deploy.crx chromeshades/manifest_compiled_manifest/manifest.json chromeshades/manifest_uncompiled_manifest/manifest.json chromeshades/background/binary.js chromeshades/devtools/binary.js chromeshades_deploy_fs_out chromeshades_deploy_fs chromeshades_deploy_uncompiled_fs_out chromeshades_deploy_uncompiled_fs chromeshades_deploy.crx cvoxext/manifest_compiled_manifest/manifest.json cvoxext/manifest_uncompiled_manifest/manifest.json cvoxext/binary.js cvoxext_deploy_fs_out cvoxext_deploy_fs cvoxext_deploy_uncompiled_fs_out cvoxext_deploy_uncompiled_fs cvoxext_deploy.crx chromevox_deploy_fs_out chromevox_deploy_fs chromevox_deploy_uncompiled_fs_out chromevox_deploy_uncompiled_fs chromevox_deploy.crx chromevis_deploy_fs_out chromevis_deploy_fs chromevis_deploy_uncompiled_fs_out chromevis_deploy_uncompiled_fs chromevis_deploy.crx caretbrowsing_deploy_fs_out caretbrowsing_deploy_fs caretbrowsing_deploy_uncompiled_fs_out caretbrowsing_deploy_uncompiled_fs caretbrowsing_deploy.crx chromeshades_deploy_fs_out chromeshades_deploy_fs chromeshades_deploy_uncompiled_fs_out chromeshades_deploy_uncompiled_fs chromeshades_deploy.crx cvoxext_deploy_fs_out cvoxext_deploy_fs cvoxext_deploy_uncompiled_fs_out cvoxext_deploy_uncompiled_fs cvoxext_deploy.crx

all: chromevox cvoxext chromeshades_deploy.crx androidVoxDev.js chromevox_deploy.crx caretbrowsing chromeshades chromevis caretbrowsing_deploy.crx chromevis_deploy.crx clankVoxDev.js cvoxext_deploy.crx

