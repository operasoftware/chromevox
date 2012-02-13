
# Copyright 2011 Google Inc. All Rights Reserved.
#
# AndroidVox requires the closure compiler and the rhino JS intepreter.
#
CLOSURE_ROOT=/usr/local/lib/closure

# The closure compiler is available at http://code.google.com/closure/compiler/
CLOSURE_COMPILER=java -jar $(CLOSURE_ROOT)/compiler.jar --manage_closure_dependencies

# The closure DepsWriter, available at
#     http://code.google.com/closure/library/docs/depswriter.html
DEPSWRITER = python $(CLOSURE_ROOT)/depswriter.py

# On Debian, rhino is available through apt-get.
RHINO = rhino

#######################################

# A function to return a unique set of file names.
uniq = $(if $(word 1, $(1)), $(call uniq2, $(1)), $(1))
uniq2 = $(firstword $(1)) $(call uniq, $(filter-out $(firstword $(1)), $(wordlist 2, $(words $(1)), $(1))))


CLOSURE_base_FILES = closure/base.js

AXSJAX_COMMON_PowerKey_DEPS = $(CLOSURE_base_FILES)
AXSJAX_COMMON_PowerKey_SRCS = external/PowerKey.js
AXSJAX_COMMON_PowerKey_FILES = $(AXSJAX_COMMON_PowerKey_DEPS) $(AXSJAX_COMMON_PowerKey_SRCS)

HOST_INTERFACE_abstract_host_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_host_SRCS = host/interface/abstract_host.js
HOST_INTERFACE_abstract_host_FILES = $(HOST_INTERFACE_abstract_host_DEPS) $(HOST_INTERFACE_abstract_host_SRCS)

HOST_INTERFACE_abstract_lens_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_lens_SRCS = host/interface/abstract_lens.js
HOST_INTERFACE_abstract_lens_FILES = $(HOST_INTERFACE_abstract_lens_DEPS) $(HOST_INTERFACE_abstract_lens_SRCS)

HOST_INTERFACE_abstract_msgs_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_msgs_SRCS = host/interface/abstract_msgs.js
HOST_INTERFACE_abstract_msgs_FILES = $(HOST_INTERFACE_abstract_msgs_DEPS) $(HOST_INTERFACE_abstract_msgs_SRCS)

HOST_INTERFACE_abstract_tts_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_lens_FILES))
HOST_INTERFACE_abstract_tts_SRCS = host/interface/abstract_tts.js
HOST_INTERFACE_abstract_tts_FILES = $(HOST_INTERFACE_abstract_tts_DEPS) $(HOST_INTERFACE_abstract_tts_SRCS)

COMMON_chromevox_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_abstract_lens_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_abstract_tts_FILES))
COMMON_chromevox_SRCS = common/chromevox.js
COMMON_chromevox_FILES = $(COMMON_chromevox_DEPS) $(COMMON_chromevox_SRCS)

HOST_INTERFACE_abstract_earcons_DEPS = $(CLOSURE_base_FILES)
HOST_INTERFACE_abstract_earcons_SRCS = host/interface/abstract_earcons.js
HOST_INTERFACE_abstract_earcons_FILES = $(HOST_INTERFACE_abstract_earcons_DEPS) $(HOST_INTERFACE_abstract_earcons_SRCS)

CHROMEVOX_INJECTED_TOOLS_choice_widget_DEPS = $(call uniq, $(AXSJAX_COMMON_PowerKey_FILES) $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_abstract_tts_FILES))
CHROMEVOX_INJECTED_TOOLS_choice_widget_SRCS = chromevox/injected/tools/choice_widget.js
CHROMEVOX_INJECTED_TOOLS_choice_widget_FILES = $(CHROMEVOX_INJECTED_TOOLS_choice_widget_DEPS) $(CHROMEVOX_INJECTED_TOOLS_choice_widget_SRCS)

COMMON_aria_util_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(COMMON_chromevox_FILES))
COMMON_aria_util_SRCS = common/aria_util.js
COMMON_aria_util_FILES = $(COMMON_aria_util_DEPS) $(COMMON_aria_util_SRCS)

COMMON_nav_description_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(COMMON_chromevox_FILES))
COMMON_nav_description_SRCS = common/nav_description.js
COMMON_nav_description_FILES = $(COMMON_nav_description_DEPS) $(COMMON_nav_description_SRCS)

COMMON_xpath_util_DEPS = $(CLOSURE_base_FILES)
COMMON_xpath_util_SRCS = common/xpath_util.js
COMMON_xpath_util_FILES = $(COMMON_xpath_util_DEPS) $(COMMON_xpath_util_SRCS)

COMMON_dom_util_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_nav_description_FILES) $(COMMON_xpath_util_FILES))
COMMON_dom_util_SRCS = common/dom_util.js
COMMON_dom_util_FILES = $(COMMON_dom_util_DEPS) $(COMMON_dom_util_SRCS)

COMMON_chromevox_json_DEPS = $(CLOSURE_base_FILES)
COMMON_chromevox_json_SRCS = common/chromevox_json.js
COMMON_chromevox_json_FILES = $(COMMON_chromevox_json_DEPS) $(COMMON_chromevox_json_SRCS)

COMMON_interframe_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_json_FILES))
COMMON_interframe_SRCS = common/interframe.js
COMMON_interframe_FILES = $(COMMON_interframe_DEPS) $(COMMON_interframe_SRCS)

COMMON_abstract_walker_DEPS = $(CLOSURE_base_FILES)
COMMON_abstract_walker_SRCS = common/abstract_walker.js
COMMON_abstract_walker_FILES = $(COMMON_abstract_walker_DEPS) $(COMMON_abstract_walker_SRCS)

COMMON_linear_dom_walker_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_abstract_walker_FILES) $(COMMON_dom_util_FILES) $(COMMON_xpath_util_FILES))
COMMON_linear_dom_walker_SRCS = common/linear_dom_walker.js
COMMON_linear_dom_walker_FILES = $(COMMON_linear_dom_walker_DEPS) $(COMMON_linear_dom_walker_SRCS)

COMMON_selection_util_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_xpath_util_FILES))
COMMON_selection_util_SRCS = common/selection_util.js
COMMON_selection_util_FILES = $(COMMON_selection_util_DEPS) $(COMMON_selection_util_SRCS)

COMMON_cursor_DEPS = $(CLOSURE_base_FILES)
COMMON_cursor_SRCS = common/cursor.js
COMMON_cursor_FILES = $(COMMON_cursor_DEPS) $(COMMON_cursor_SRCS)

COMMON_traverse_util_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_cursor_FILES))
COMMON_traverse_util_SRCS = common/traverse_util.js
COMMON_traverse_util_FILES = $(COMMON_traverse_util_DEPS) $(COMMON_traverse_util_SRCS)

COMMON_traverse_content_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_util_FILES))
COMMON_traverse_content_SRCS = common/traverse_content.js
COMMON_traverse_content_FILES = $(COMMON_traverse_content_DEPS) $(COMMON_traverse_content_SRCS)

COMMON_selection_walker_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_abstract_walker_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_content_FILES))
COMMON_selection_walker_SRCS = common/selection_walker.js
COMMON_selection_walker_FILES = $(COMMON_selection_walker_DEPS) $(COMMON_selection_walker_SRCS)

COMMON_table_util_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_xpath_util_FILES))
COMMON_table_util_SRCS = common/table_util.js
COMMON_table_util_FILES = $(COMMON_table_util_DEPS) $(COMMON_table_util_SRCS)

COMMON_traverse_table_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_selection_util_FILES) $(COMMON_table_util_FILES) $(COMMON_traverse_util_FILES))
COMMON_traverse_table_SRCS = common/traverse_table.js
COMMON_traverse_table_FILES = $(COMMON_traverse_table_DEPS) $(COMMON_traverse_table_SRCS)

COMMON_smart_dom_walker_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_dom_util_FILES) $(COMMON_linear_dom_walker_FILES) $(COMMON_traverse_table_FILES) $(COMMON_xpath_util_FILES))
COMMON_smart_dom_walker_SRCS = common/smart_dom_walker.js
COMMON_smart_dom_walker_FILES = $(COMMON_smart_dom_walker_DEPS) $(COMMON_smart_dom_walker_SRCS)

COMMON_walker_decorator_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_abstract_walker_FILES) $(COMMON_chromevox_json_FILES))
COMMON_walker_decorator_SRCS = common/walker_decorator.js
COMMON_walker_decorator_FILES = $(COMMON_walker_decorator_DEPS) $(COMMON_walker_decorator_SRCS)

CHROMEVOX_INJECTED_active_indicator_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_cursor_FILES))
CHROMEVOX_INJECTED_active_indicator_SRCS = chromevox/injected/active_indicator.js
CHROMEVOX_INJECTED_active_indicator_FILES = $(CHROMEVOX_INJECTED_active_indicator_DEPS) $(CHROMEVOX_INJECTED_active_indicator_SRCS)

CHROMEVOX_INJECTED_navigation_manager_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_TOOLS_choice_widget_FILES) $(COMMON_dom_util_FILES) $(COMMON_interframe_FILES) $(COMMON_linear_dom_walker_FILES) $(COMMON_nav_description_FILES) $(COMMON_selection_util_FILES) $(COMMON_selection_walker_FILES) $(COMMON_smart_dom_walker_FILES) $(COMMON_walker_decorator_FILES) $(CHROMEVOX_INJECTED_active_indicator_FILES))
CHROMEVOX_INJECTED_navigation_manager_SRCS = chromevox/injected/navigation_manager.js
CHROMEVOX_INJECTED_navigation_manager_FILES = $(CHROMEVOX_INJECTED_navigation_manager_DEPS) $(CHROMEVOX_INJECTED_navigation_manager_SRCS)

CHROMEVOX_INJECTED_api_implementation_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES))
CHROMEVOX_INJECTED_api_implementation_SRCS = chromevox/injected/api_implementation.js
CHROMEVOX_INJECTED_api_implementation_FILES = $(CHROMEVOX_INJECTED_api_implementation_DEPS) $(CHROMEVOX_INJECTED_api_implementation_SRCS)

CHROMEVOX_INJECTED_TOOLS_search_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_navigation_manager_FILES) $(COMMON_chromevox_FILES) $(COMMON_cursor_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_util_FILES) $(HOST_INTERFACE_abstract_earcons_FILES))
CHROMEVOX_INJECTED_TOOLS_search_SRCS = chromevox/injected/tools/search.js
CHROMEVOX_INJECTED_TOOLS_search_FILES = $(CHROMEVOX_INJECTED_TOOLS_search_DEPS) $(CHROMEVOX_INJECTED_TOOLS_search_SRCS)

HOST_INTERFACE_host_factory_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_abstract_tts_FILES))
HOST_INTERFACE_host_factory_SRCS = host/interface/host_factory.js
HOST_INTERFACE_host_factory_FILES = $(HOST_INTERFACE_host_factory_DEPS) $(HOST_INTERFACE_host_factory_SRCS)

COMMON_editable_text_area_shadow_DEPS = $(CLOSURE_base_FILES)
COMMON_editable_text_area_shadow_SRCS = common/editable_text_area_shadow.js
COMMON_editable_text_area_shadow_FILES = $(COMMON_editable_text_area_shadow_DEPS) $(COMMON_editable_text_area_shadow_SRCS)

COMMON_editable_text_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_editable_text_area_shadow_FILES))
COMMON_editable_text_SRCS = common/editable_text.js
COMMON_editable_text_FILES = $(COMMON_editable_text_DEPS) $(COMMON_editable_text_SRCS)

COMMON_key_util_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES))
COMMON_key_util_SRCS = common/key_util.js
COMMON_key_util_FILES = $(COMMON_key_util_DEPS) $(COMMON_key_util_SRCS)

CHROMEVOX_INJECTED_user_commands_DEPS = $(call uniq, $(CLOSURE_base_FILES)  $(CHROMEVOX_INJECTED_TOOLS_search_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_navigation_manager_FILES))
CHROMEVOX_INJECTED_user_commands_SRCS = chromevox/injected/user_commands.js
CHROMEVOX_INJECTED_user_commands_FILES = $(CHROMEVOX_INJECTED_user_commands_DEPS) $(CHROMEVOX_INJECTED_user_commands_SRCS)

CHROMEVOX_INJECTED_keyboard_handler_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_TOOLS_search_FILES) $(COMMON_chromevox_FILES) $(COMMON_key_util_FILES) $(CHROMEVOX_INJECTED_user_commands_FILES))
CHROMEVOX_INJECTED_keyboard_handler_SRCS = chromevox/injected/keyboard_handler.js
CHROMEVOX_INJECTED_keyboard_handler_FILES = $(CHROMEVOX_INJECTED_keyboard_handler_DEPS) $(CHROMEVOX_INJECTED_keyboard_handler_SRCS)

CHROMEVOX_INJECTED_live_regions_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(COMMON_nav_description_FILES))
CHROMEVOX_INJECTED_live_regions_SRCS = chromevox/injected/live_regions.js
CHROMEVOX_INJECTED_live_regions_FILES = $(CHROMEVOX_INJECTED_live_regions_DEPS) $(CHROMEVOX_INJECTED_live_regions_SRCS)

CHROMEVOX_INJECTED_event_watcher_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_aria_util_FILES) $(COMMON_chromevox_FILES) $(COMMON_dom_util_FILES) $(COMMON_editable_text_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(CHROMEVOX_INJECTED_live_regions_FILES) $(CHROMEVOX_INJECTED_user_commands_FILES))
CHROMEVOX_INJECTED_event_watcher_SRCS = chromevox/injected/event_watcher.js
CHROMEVOX_INJECTED_event_watcher_FILES = $(CHROMEVOX_INJECTED_event_watcher_DEPS) $(CHROMEVOX_INJECTED_event_watcher_SRCS)

CHROMEVOX_INJECTED_init_DEPS = $(call uniq, $(CLOSURE_base_FILES)  $(CHROMEVOX_INJECTED_TOOLS_search_FILES) $(COMMON_chromevox_FILES) $(COMMON_chromevox_json_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(CHROMEVOX_INJECTED_live_regions_FILES) $(CHROMEVOX_INJECTED_navigation_manager_FILES))
CHROMEVOX_INJECTED_init_SRCS = chromevox/injected/init.js
CHROMEVOX_INJECTED_init_FILES = $(CHROMEVOX_INJECTED_init_DEPS) $(CHROMEVOX_INJECTED_init_SRCS)

HOST_ANDROID_DEV_earcons_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_host_factory_FILES))
HOST_ANDROID_DEV_earcons_SRCS = host/android_dev/earcons.js
HOST_ANDROID_DEV_earcons_FILES = $(HOST_ANDROID_DEV_earcons_DEPS) $(HOST_ANDROID_DEV_earcons_SRCS)

HOST_ANDROID_DEV_host_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_host_factory_FILES))
HOST_ANDROID_DEV_host_SRCS = host/android_dev/host.js
HOST_ANDROID_DEV_host_FILES = $(HOST_ANDROID_DEV_host_DEPS) $(HOST_ANDROID_DEV_host_SRCS)

HOST_ANDROID_DEV_tts_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_host_factory_FILES))
HOST_ANDROID_DEV_tts_SRCS = host/android_dev/tts.js
HOST_ANDROID_DEV_tts_FILES = $(HOST_ANDROID_DEV_tts_DEPS) $(HOST_ANDROID_DEV_tts_SRCS)

CHROMEVOX_MESSAGES_messages_DEPS = $(CLOSURE_base_FILES)
CHROMEVOX_MESSAGES_messages_SRCS = chromevox/messages/messages.js
CHROMEVOX_MESSAGES_messages_FILES = $(CHROMEVOX_MESSAGES_messages_DEPS) $(CHROMEVOX_MESSAGES_messages_SRCS)

CLOSURE_JSON_json_FILES = external/closure_json.js

CHROME_extensions_i18n_DEPS = $(call uniq, $(CLOSURE_JSON_json_FILES) $(CLOSURE_base_FILES))
CHROME_extensions_i18n_SRCS = external/extensions_i18n.js
CHROME_extensions_i18n_FILES = $(CHROME_extensions_i18n_DEPS) $(CHROME_extensions_i18n_SRCS)

CHROMEVOX_MESSAGES_messages_wrapper_DEPS = $(call uniq, $(CHROME_extensions_i18n_FILES) $(CLOSURE_base_FILES))
CHROMEVOX_MESSAGES_messages_wrapper_SRCS = chromevox/messages/messages_wrapper.js
CHROMEVOX_MESSAGES_messages_wrapper_FILES = $(CHROMEVOX_MESSAGES_messages_wrapper_DEPS) $(CHROMEVOX_MESSAGES_messages_wrapper_SRCS)

CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_DEPS = $(call uniq, $(CHROMEVOX_MESSAGES_messages_FILES) $(CHROMEVOX_MESSAGES_messages_wrapper_FILES))
CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_FILES = $(CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_DEPS)

CHROMEVOX_MESSAGES_i18n_messages_localized__en_DEPS = $(CHROMEVOX_MESSAGES_i18n_messages_messages_jslib_FILES)
CHROMEVOX_MESSAGES_i18n_messages_localized__en_FILES = $(CHROMEVOX_MESSAGES_i18n_messages_localized__en_DEPS)
chromevox/messages/i18n_messages_localized__en.js: $(CHROMEVOX_MESSAGES_i18n_messages_localized__en_FILES)
	$(CLOSURE_COMPILER) --js $(CHROMEVOX_MESSAGES_i18n_messages_localized__en_FILES) --js_output_file chromevox/messages/i18n_messages_localized__en.js


CHROMEVOX_MESSAGES_messages_en.json_SRCS = chromevox/messages/i18n_messages_localized__en.js
CHROMEVOX_MESSAGES_messages_en.json_FILES = chromevox/messages/_locales/en/messages.json
chromevox/messages/_locales/en/messages.json: $(CHROMEVOX_MESSAGES_messages_en.json_SRCS)
	mkdir -p chromevox/messages/_locales/en
	$(RHINO) $(CHROMEVOX_MESSAGES_messages_en.json_SRCS) > $(CHROMEVOX_MESSAGES_messages_en.json_FILES)


chromevox/messages/messages_en.json: chromevox/messages/_locales/en/messages.json
	cp chromevox/messages/_locales/en/messages.json chromevox/messages/messages_en.json

HOST_TESTING_test_messages_SRCS = $(call uniq, host/testing/test_messages.jsfragment chromevox/messages/messages_en.json)
HOST_TESTING_test_messages_FILES = host/testing/test_messages.js
host/testing/test_messages.js: $(HOST_TESTING_test_messages_SRCS)
	mkdir -p host/testing
	cat $(HOST_TESTING_test_messages_SRCS) >$(HOST_TESTING_test_messages_FILES)


HOST_TESTING_test_messages_lib_DEPS = $(CLOSURE_base_FILES)
HOST_TESTING_test_messages_lib_SRCS = host/testing/test_messages.js
HOST_TESTING_test_messages_lib_FILES = $(HOST_TESTING_test_messages_lib_DEPS) $(HOST_TESTING_test_messages_lib_SRCS)

HOST_TESTING_msgs_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_TESTING_test_messages_lib_FILES))
HOST_TESTING_msgs_SRCS = host/testing/msgs.js
HOST_TESTING_msgs_FILES = $(HOST_TESTING_msgs_DEPS) $(HOST_TESTING_msgs_SRCS)

ANDROID_INJECTED_loader_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_init_FILES) $(HOST_ANDROID_DEV_earcons_FILES) $(HOST_ANDROID_DEV_host_FILES) $(HOST_ANDROID_DEV_tts_FILES) $(HOST_TESTING_msgs_FILES))
ANDROID_INJECTED_loader_SRCS = android/injected/loader.js
ANDROID_INJECTED_loader_FILES = $(ANDROID_INJECTED_loader_DEPS) $(ANDROID_INJECTED_loader_SRCS)

androidVoxDev_DEPS = $(ANDROID_INJECTED_loader_FILES)
androidVoxDev_FILES = $(androidVoxDev_DEPS)
androidVoxDev.js: $(androidVoxDev_FILES)
	$(CLOSURE_COMPILER) --js $(androidVoxDev_FILES) --js_output_file androidVoxDev.js



HOST_CHROME_extension_bridge_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_json_FILES))
HOST_CHROME_extension_bridge_SRCS = host/chrome/extension_bridge.js
HOST_CHROME_extension_bridge_FILES = $(HOST_CHROME_extension_bridge_DEPS) $(HOST_CHROME_extension_bridge_SRCS)

HOST_CHROME_earcons_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_CHROME_extension_bridge_FILES))
HOST_CHROME_earcons_SRCS = host/chrome/earcons.js
HOST_CHROME_earcons_FILES = $(HOST_CHROME_earcons_DEPS) $(HOST_CHROME_earcons_SRCS)

COMMON_lens_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_lens_FILES) $(COMMON_selection_util_FILES) $(COMMON_traverse_util_FILES))
COMMON_lens_SRCS = common/lens.js
COMMON_lens_FILES = $(COMMON_lens_DEPS) $(COMMON_lens_SRCS)

HOST_CHROME_host_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(CHROMEVOX_INJECTED_api_implementation_FILES) $(CHROMEVOX_INJECTED_event_watcher_FILES) $(CHROMEVOX_INJECTED_keyboard_handler_FILES) $(COMMON_lens_FILES) $(HOST_INTERFACE_abstract_host_FILES) $(HOST_INTERFACE_host_factory_FILES) $(HOST_CHROME_extension_bridge_FILES))
HOST_CHROME_host_SRCS = host/chrome/host.js
HOST_CHROME_host_FILES = $(HOST_CHROME_host_DEPS) $(HOST_CHROME_host_SRCS)

HOST_CHROME_msgs_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_msgs_FILES) $(HOST_INTERFACE_host_factory_FILES))
HOST_CHROME_msgs_SRCS = host/chrome/msgs.js
HOST_CHROME_msgs_FILES = $(HOST_CHROME_msgs_DEPS) $(HOST_CHROME_msgs_SRCS)

HOST_CHROME_tts_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_tts_FILES) $(HOST_INTERFACE_host_factory_FILES))
HOST_CHROME_tts_SRCS = host/chrome/tts.js
HOST_CHROME_tts_FILES = $(HOST_CHROME_tts_DEPS) $(HOST_CHROME_tts_SRCS)

CHROMEVOX_INJECTED_loader_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_FILES) $(CHROMEVOX_INJECTED_init_FILES))
CHROMEVOX_INJECTED_loader_SRCS = chromevox/injected/loader.js
CHROMEVOX_INJECTED_loader_FILES = $(CHROMEVOX_INJECTED_loader_DEPS) $(CHROMEVOX_INJECTED_loader_SRCS)

chromeVoxChromePageScript_DEPS = $(CHROMEVOX_INJECTED_loader_FILES)
chromeVoxChromePageScript_FILES = $(chromeVoxChromePageScript_DEPS)
chromeVoxChromePageScript.js: $(chromeVoxChromePageScript_FILES)
	$(CLOSURE_COMPILER) --js $(chromeVoxChromePageScript_FILES) --js_output_file chromeVoxChromePageScript.js



HOST_CHROME_earcons_background_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_INTERFACE_abstract_earcons_FILES))
HOST_CHROME_earcons_background_SRCS = host/chrome/earcons_background.js
HOST_CHROME_earcons_background_FILES = $(HOST_CHROME_earcons_background_DEPS) $(HOST_CHROME_earcons_background_SRCS)

HOST_CHROME_tts_background_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_INTERFACE_abstract_tts_FILES))
HOST_CHROME_tts_background_SRCS = host/chrome/tts_background.js
HOST_CHROME_tts_background_FILES = $(HOST_CHROME_tts_background_DEPS) $(HOST_CHROME_tts_background_SRCS)

CHROMEVOX_BACKGROUND_accessibility_api_handler_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_editable_text_FILES) $(HOST_INTERFACE_abstract_earcons_FILES) $(HOST_INTERFACE_abstract_tts_FILES))
CHROMEVOX_BACKGROUND_accessibility_api_handler_SRCS = chromevox/background/accessibility_api_handler.js
CHROMEVOX_BACKGROUND_accessibility_api_handler_FILES = $(CHROMEVOX_BACKGROUND_accessibility_api_handler_DEPS) $(CHROMEVOX_BACKGROUND_accessibility_api_handler_SRCS)

CHROMEVOX_BACKGROUND_prefs_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_CHROME_extension_bridge_FILES))
CHROMEVOX_BACKGROUND_prefs_SRCS = chromevox/background/prefs.js
CHROMEVOX_BACKGROUND_prefs_FILES = $(CHROMEVOX_BACKGROUND_prefs_DEPS) $(CHROMEVOX_BACKGROUND_prefs_SRCS)

CHROMEVOX_BACKGROUND_background_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(COMMON_editable_text_FILES) $(HOST_CHROME_earcons_background_FILES) $(HOST_CHROME_extension_bridge_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_background_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_BACKGROUND_accessibility_api_handler_FILES) $(CHROMEVOX_BACKGROUND_prefs_FILES))
CHROMEVOX_BACKGROUND_background_SRCS = chromevox/background/background.js
CHROMEVOX_BACKGROUND_background_FILES = $(CHROMEVOX_BACKGROUND_background_DEPS) $(CHROMEVOX_BACKGROUND_background_SRCS)

CHROMEVOX_BACKGROUND_loader_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_CHROME_msgs_FILES) $(CHROMEVOX_BACKGROUND_background_FILES))
CHROMEVOX_BACKGROUND_loader_SRCS = chromevox/background/loader.js
CHROMEVOX_BACKGROUND_loader_FILES = $(CHROMEVOX_BACKGROUND_loader_DEPS) $(CHROMEVOX_BACKGROUND_loader_SRCS)

chromeVoxChromeBackgroundScript_DEPS = $(CHROMEVOX_BACKGROUND_loader_FILES)
chromeVoxChromeBackgroundScript_FILES = $(chromeVoxChromeBackgroundScript_DEPS)
chromeVoxChromeBackgroundScript.js: $(chromeVoxChromeBackgroundScript_FILES)
	$(CLOSURE_COMPILER) --js $(chromeVoxChromeBackgroundScript_FILES) --js_output_file chromeVoxChromeBackgroundScript.js



CHROMEVOX_BACKGROUND_options_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_chromevox_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_extension_bridge_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_msgs_FILES) $(HOST_CHROME_tts_FILES) $(HOST_INTERFACE_host_factory_FILES) $(CHROMEVOX_BACKGROUND_prefs_FILES))
CHROMEVOX_BACKGROUND_options_SRCS = chromevox/background/options.js
CHROMEVOX_BACKGROUND_options_FILES = $(CHROMEVOX_BACKGROUND_options_DEPS) $(CHROMEVOX_BACKGROUND_options_SRCS)

chromeVoxChromeOptionsScript_DEPS = $(CHROMEVOX_BACKGROUND_options_FILES)
chromeVoxChromeOptionsScript_FILES = $(chromeVoxChromeOptionsScript_DEPS)
chromeVoxChromeOptionsScript.js: $(chromeVoxChromeOptionsScript_FILES)
	$(CLOSURE_COMPILER) --js $(chromeVoxChromeOptionsScript_FILES) --js_output_file chromeVoxChromeOptionsScript.js



CHROMEVOX_BACKGROUND_kbexplorer_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_key_util_FILES))
CHROMEVOX_BACKGROUND_kbexplorer_SRCS = chromevox/background/kbexplorer.js
CHROMEVOX_BACKGROUND_kbexplorer_FILES = $(CHROMEVOX_BACKGROUND_kbexplorer_DEPS) $(CHROMEVOX_BACKGROUND_kbexplorer_SRCS)

chromeVoxKbExplorerScript_DEPS = $(CHROMEVOX_BACKGROUND_kbexplorer_FILES)
chromeVoxKbExplorerScript_FILES = $(chromeVoxKbExplorerScript_DEPS)
chromeVoxKbExplorerScript.js: $(chromeVoxKbExplorerScript_FILES)
	$(CLOSURE_COMPILER) --js $(chromeVoxKbExplorerScript_FILES) --js_output_file chromeVoxKbExplorerScript.js



CHROMESHADES_INJECTED_base_modifier_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_dom_util_FILES) $(COMMON_interframe_FILES) $(HOST_CHROME_extension_bridge_FILES))
CHROMESHADES_INJECTED_base_modifier_SRCS = chromeshades/injected/base_modifier.js
CHROMESHADES_INJECTED_base_modifier_FILES = $(CHROMESHADES_INJECTED_base_modifier_DEPS) $(CHROMESHADES_INJECTED_base_modifier_SRCS)

CHROMESHADES_INJECTED_shades_modifier_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_xpath_util_FILES))
CHROMESHADES_INJECTED_shades_modifier_SRCS = chromeshades/injected/shades_modifier.js
CHROMESHADES_INJECTED_shades_modifier_FILES = $(CHROMESHADES_INJECTED_shades_modifier_DEPS) $(CHROMESHADES_INJECTED_shades_modifier_SRCS)

CHROMESHADES_INJECTED_init_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMESHADES_INJECTED_base_modifier_FILES) $(CHROMESHADES_INJECTED_shades_modifier_FILES))
CHROMESHADES_INJECTED_init_SRCS = chromeshades/injected/init.js
CHROMESHADES_INJECTED_init_FILES = $(CHROMESHADES_INJECTED_init_DEPS) $(CHROMESHADES_INJECTED_init_SRCS)

chromeShadesInjected_DEPS = $(CHROMESHADES_INJECTED_init_FILES)
chromeShadesInjected_FILES = $(chromeShadesInjected_DEPS)
chromeShadesInjected.js: $(chromeShadesInjected_FILES)
	$(CLOSURE_COMPILER) --js $(chromeShadesInjected_FILES) --js_output_file chromeShadesInjected.js



CHROMESHADES_BACKGROUND_toggle_DEPS = $(CLOSURE_base_FILES)
CHROMESHADES_BACKGROUND_toggle_SRCS = chromeshades/background/toggle.js
CHROMESHADES_BACKGROUND_toggle_FILES = $(CHROMESHADES_BACKGROUND_toggle_DEPS) $(CHROMESHADES_BACKGROUND_toggle_SRCS)

CHROMESHADES_BACKGROUND_background_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMESHADES_BACKGROUND_toggle_FILES))
CHROMESHADES_BACKGROUND_background_SRCS = chromeshades/background/background.js
CHROMESHADES_BACKGROUND_background_FILES = $(CHROMESHADES_BACKGROUND_background_DEPS) $(CHROMESHADES_BACKGROUND_background_SRCS)

chromeShadesBackground_DEPS = $(CHROMESHADES_BACKGROUND_background_FILES)
chromeShadesBackground_FILES = $(chromeShadesBackground_DEPS)
chromeShadesBackground.js: $(chromeShadesBackground_FILES)
	$(CLOSURE_COMPILER) --js $(chromeShadesBackground_FILES) --js_output_file chromeShadesBackground.js



COMMON_focus_util_DEPS = $(CLOSURE_base_FILES)
COMMON_focus_util_SRCS = common/focus_util.js
COMMON_focus_util_FILES = $(COMMON_focus_util_DEPS) $(COMMON_focus_util_SRCS)

CHROMEVIS_INJECTED_reader_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_lens_FILES) $(COMMON_traverse_content_FILES) $(HOST_CHROME_extension_bridge_FILES))
CHROMEVIS_INJECTED_reader_SRCS = chromevis/injected/reader.js
CHROMEVIS_INJECTED_reader_FILES = $(CHROMEVIS_INJECTED_reader_DEPS) $(CHROMEVIS_INJECTED_reader_SRCS)

CHROMEVIS_INJECTED_main_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(COMMON_focus_util_FILES) $(COMMON_lens_FILES) $(HOST_CHROME_extension_bridge_FILES) $(CHROMEVIS_INJECTED_reader_FILES))
CHROMEVIS_INJECTED_main_SRCS = chromevis/injected/main.js
CHROMEVIS_INJECTED_main_FILES = $(CHROMEVIS_INJECTED_main_DEPS) $(CHROMEVIS_INJECTED_main_SRCS)

CHROMEVIS_INJECTED_loader_DEPS = $(call uniq, $(CLOSURE_base_FILES) $(HOST_CHROME_earcons_FILES) $(HOST_CHROME_host_FILES) $(HOST_CHROME_tts_FILES) $(CHROMEVIS_INJECTED_main_FILES))
CHROMEVIS_INJECTED_loader_SRCS = chromevis/injected/loader.js
CHROMEVIS_INJECTED_loader_FILES = $(CHROMEVIS_INJECTED_loader_DEPS) $(CHROMEVIS_INJECTED_loader_SRCS)

CHROMEVIS_chromevisCompiled_DEPS = $(CHROMEVIS_INJECTED_loader_FILES)
CHROMEVIS_chromevisCompiled_FILES = $(CHROMEVIS_chromevisCompiled_DEPS)
chromevis/chromevisCompiled.js: $(CHROMEVIS_chromevisCompiled_FILES)
	$(CLOSURE_COMPILER) --js $(CHROMEVIS_chromevisCompiled_FILES) --js_output_file chromevis/chromevisCompiled.js



deps_SRCS = $(call uniq, $(androidVoxDev_FILES) $(chromeVoxChromePageScript_FILES) $(chromeVoxChromeBackgroundScript_FILES) $(chromeVoxChromeOptionsScript_FILES) $(chromeVoxKbExplorerScript_FILES) $(chromeShadesInjected_FILES) $(chromeShadesBackground_FILES) $(CHROMEVIS_chromevisCompiled_FILES))
deps.js: $(deps_SRCS)
	$(DEPSWRITER) --root_with_prefix=". ../" >deps.js


CHROMEVOX_manifest_cleanmanifest_gen_SRCS = chromevox/manifest.json
CHROMEVOX_manifest_cleanmanifest_gen_FILES = chromevox/manifest_clean_compiled_manifest/manifest.json
chromevox/manifest_clean_compiled_manifest/manifest.json: $(CHROMEVOX_manifest_cleanmanifest_gen_SRCS)
	mkdir -p chromevox/manifest_clean_compiled_manifest
	cat $< | sed -e 's/loader.js/LOADER.JS/' | grep -vE '^ *"[^ ]*.js"' | sed -e 's/LOADER.JS/binary.js/' >$@


CHROMEVOX_manifest_SRCS = chromevox/manifest_clean_compiled_manifest/manifest.json
CHROMEVOX_manifest_FILES = chromevox/manifest_compiled_manifest/manifest.json
chromevox/manifest_compiled_manifest/manifest.json: $(CHROMEVOX_manifest_SRCS)
	mkdir -p chromevox/manifest_compiled_manifest
	cat $< | sed -e 's/chromevox\/injected\/binary.js/chromeVoxChromePageScript.js/' >$@


CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES = chromevox/messages/_locales/en/messages.json
CHROMEVOX_MESSAGES_i18n_messages_filegroup: $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES)

CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES = $(wildcard chromevox/background/earcons/*.ogg)
CHROMEVOX_BACKGROUND_EARCONS_ogg_files: $(CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES)

CHROMEVOX_BACKGROUND_html_files_FILES = $(wildcard chromevox/background/*.html)
CHROMEVOX_BACKGROUND_html_files: $(CHROMEVOX_BACKGROUND_html_files_FILES)

CHROMEVOX_png_files_FILES = $(wildcard chromevox/*.png)
CHROMEVOX_png_files: $(CHROMEVOX_png_files_FILES)

chromevox_deploy_fs_SRCS = $(call uniq, chromevox/manifest_compiled_manifest/manifest.json $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES) chromeVoxChromeBackgroundScript.js chromeVoxChromeOptionsScript.js chromeVoxChromePageScript.js chromeVoxKbExplorerScript.js closure/closure_preinit.js $(CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES) chromevox/injected/api.js $(CHROMEVOX_BACKGROUND_html_files_FILES) $(CHROMEVOX_png_files_FILES))
chromevox_deploy_fs_FILES = chromevox_deploy_fs_out
chromevox_deploy_fs_out: $(chromevox_deploy_fs_SRCS)
	mkdir -p chromevox_deploy_fs_out
	cp chromevox/manifest_compiled_manifest/manifest.json chromevox_deploy_fs_out/
	mkdir -p chromevox_deploy_fs_out/_locales/en
	cp $(CHROMEVOX_MESSAGES_i18n_messages_filegroup_FILES) chromevox_deploy_fs_out/_locales/en
	cp chromeVoxChromeBackgroundScript.js chromevox_deploy_fs_out/
	cp chromeVoxChromeOptionsScript.js chromevox_deploy_fs_out/
	cp chromeVoxChromePageScript.js chromevox_deploy_fs_out/
	cp chromeVoxKbExplorerScript.js chromevox_deploy_fs_out/
	cp closure/closure_preinit.js chromevox_deploy_fs_out/
	mkdir -p chromevox_deploy_fs_out/chromevox/background/earcons
	cp $(CHROMEVOX_BACKGROUND_EARCONS_ogg_files_FILES) chromevox_deploy_fs_out/chromevox/background/earcons
	mkdir -p chromevox_deploy_fs_out/chromevox/injected
	cp chromevox/injected/api.js chromevox_deploy_fs_out/chromevox/injected
	mkdir -p chromevox_deploy_fs_out/chromevox/background
	cp $(CHROMEVOX_BACKGROUND_html_files_FILES) chromevox_deploy_fs_out/chromevox/background
	mkdir -p chromevox_deploy_fs_out/chromevox
	cp $(CHROMEVOX_png_files_FILES) chromevox_deploy_fs_out/chromevox

chromevox_deploy_fs: chromevox_deploy_fs_out

chromevox_deploy_crx_SRCS = $(call uniq, $(chromevox_deploy_fs_FILES) private_keys/chromevox.pem builddefs/package.sh)
chromevox_deploy_crx_FILES = $(chromevox_deploy.crx_FILES)
chromevox_deploy.crx: $(chromevox_deploy_crx_SRCS)
	builddefs/package.sh --key private_keys/chromevox.pem --src $(chromevox_deploy_fs_FILES) --crx $@


clean:
	rm -rf androidvox_out/ external/ chromevox/messages/i18n_messages_localized__en.js chromevox/messages/_locales/en/messages.json chromevox/messages/messages_en.json CHROMEVOX_MESSAGES_i18n_messages_filegroup host/testing/test_messages.js chromeVoxChromePageScript.js CHROMEVOX_BACKGROUND_html_files chromeVoxKbExplorerScript.js chromeVoxChromeBackgroundScript.js chromeVoxChromeOptionsScript.js androidVoxDev.js chromeShadesInjected.js chromeShadesBackground.js chromevis/chromevisCompiled.js deps.js chromeVoxChromePageScript.js chromeVoxKbExplorerScript.js chromeVoxChromeBackgroundScript.js chromeVoxChromeOptionsScript.js androidVoxDev.js chromeShadesInjected.js chromeShadesBackground.js deps.js CHROMEVOX_BACKGROUND_EARCONS_ogg_files CHROMEVOX_png_files chromevox/manifest_clean_compiled_manifest/manifest.json chromevox/manifest_compiled_manifest/manifest.json chromevox_deploy_fs_out chromevox_deploy_fs chromevox_deploy.crx chromevox_deploy_fs_out chromevox_deploy_fs chromevox_deploy.crx

chromevox: deps.js chromevox/manifest.json chromevox/messages/_locales/en/messages.json

	cp chromevox/manifest.json manifest.json

	cp -a chromevox/messages/_locales _locales


externs:
	mkdir external
	cp ../../../../READONLY/google3/javascript/closure/json/json.js external/closure_json.js
	cp ../../../../READONLY/google3/javascript/axsjax/common/PowerKey.js external/PowerKey.js
	cp ../../../../READONLY/google3/javascript/chrome/extensions_i18n.js external/extensions_i18n.js

copy_files: externs
	mkdir androidvox_out
	mkdir -p androidvox_out/
	mkdir -p androidvox_out/chromeshades/background
	mkdir -p androidvox_out/chromevox
	mkdir -p androidvox_out/private_keys
	mkdir -p androidvox_out/chromevox/background
	mkdir -p androidvox_out/chromevox/injected/tools
	mkdir -p androidvox_out/chromevis/injected
	mkdir -p androidvox_out/chromeshades/injected
	mkdir -p androidvox_out/host/android_dev
	mkdir -p androidvox_out/chromevox/injected
	mkdir -p androidvox_out/android/injected
	mkdir -p androidvox_out/closure
	mkdir -p androidvox_out/common
	mkdir -p androidvox_out/chromevox/background/earcons
	mkdir -p androidvox_out/host/chrome
	mkdir -p androidvox_out/chromevox/messages
	mkdir -p androidvox_out/host/testing
	mkdir -p androidvox_out/host/interface
	mkdir -p androidvox_out/builddefs
	mkdir -p androidvox_out/external
	cp host/interface/abstract_host.js androidvox_out/host/interface/abstract_host.js
	cp host/testing/test_messages.jsfragment androidvox_out/host/testing/test_messages.jsfragment
	cp chromevis/injected/main.js androidvox_out/chromevis/injected/main.js
	cp common/chromevox_json.js androidvox_out/common/chromevox_json.js
	cp common/selection_walker.js androidvox_out/common/selection_walker.js
	cp chromevox/messages/messages_wrapper.js androidvox_out/chromevox/messages/messages_wrapper.js
	cp common/abstract_walker.js androidvox_out/common/abstract_walker.js
	cp Makefile androidvox_out/Makefile
	cp common/selection_util.js androidvox_out/common/selection_util.js
	cp host/chrome/earcons_background.js androidvox_out/host/chrome/earcons_background.js
	cp host/interface/abstract_earcons.js androidvox_out/host/interface/abstract_earcons.js
	cp common/cursor.js androidvox_out/common/cursor.js
	cp chromevox/background/earcons/*.ogg androidvox_out/chromevox/background/earcons/
	cp chromevox/injected/api_implementation.js androidvox_out/chromevox/injected/api_implementation.js
	cp common/smart_dom_walker.js androidvox_out/common/smart_dom_walker.js
	cp common/walker_decorator.js androidvox_out/common/walker_decorator.js
	cp chromeshades/background/background.js androidvox_out/chromeshades/background/background.js
	cp chromevox/messages/messages.js androidvox_out/chromevox/messages/messages.js
	cp chromevox/injected/event_watcher.js androidvox_out/chromevox/injected/event_watcher.js
	cp host/chrome/earcons.js androidvox_out/host/chrome/earcons.js
	cp common/focus_util.js androidvox_out/common/focus_util.js
	cp external/extensions_i18n.js androidvox_out/external/extensions_i18n.js
	cp chromevox/injected/tools/search.js androidvox_out/chromevox/injected/tools/search.js
	cp host/android_dev/host.js androidvox_out/host/android_dev/host.js
	cp host/android_dev/earcons.js androidvox_out/host/android_dev/earcons.js
	cp external/closure_json.js androidvox_out/external/closure_json.js
	cp chromevox/injected/loader.js androidvox_out/chromevox/injected/loader.js
	cp host/interface/abstract_tts.js androidvox_out/host/interface/abstract_tts.js
	cp builddefs/package.sh androidvox_out/builddefs/package.sh
	cp private_keys/chromevox.pem androidvox_out/private_keys/chromevox.pem
	cp common/editable_text_area_shadow.js androidvox_out/common/editable_text_area_shadow.js
	cp README androidvox_out/README
	cp host/chrome/extension_bridge.js androidvox_out/host/chrome/extension_bridge.js
	cp chromeshades/injected/init.js androidvox_out/chromeshades/injected/init.js
	cp chromevox/injected/tools/choice_widget.js androidvox_out/chromevox/injected/tools/choice_widget.js
	cp chromevox/background/options.js androidvox_out/chromevox/background/options.js
	cp chromevox/injected/api.js androidvox_out/chromevox/injected/api.js
	cp chromevox/background/*.html androidvox_out/chromevox/background/
	cp chromevox/injected/navigation_manager.js androidvox_out/chromevox/injected/navigation_manager.js
	cp common/dom_util.js androidvox_out/common/dom_util.js
	cp common/lens.js androidvox_out/common/lens.js
	cp chromevox/manifest.json androidvox_out/chromevox/manifest.json
	cp chromevox/injected/active_indicator.js androidvox_out/chromevox/injected/active_indicator.js
	cp chromevox/background/accessibility_api_handler.js androidvox_out/chromevox/background/accessibility_api_handler.js
	cp chromevis/injected/reader.js androidvox_out/chromevis/injected/reader.js
	cp host/interface/host_factory.js androidvox_out/host/interface/host_factory.js
	cp chromevox/background/background.js androidvox_out/chromevox/background/background.js
	cp closure/closure_preinit.js androidvox_out/closure/closure_preinit.js
	cp common/linear_dom_walker.js androidvox_out/common/linear_dom_walker.js
	cp common/editable_text.js androidvox_out/common/editable_text.js
	cp common/xpath_util.js androidvox_out/common/xpath_util.js
	cp common/interframe.js androidvox_out/common/interframe.js
	cp chromevox/background/loader.js androidvox_out/chromevox/background/loader.js
	cp host/chrome/msgs.js androidvox_out/host/chrome/msgs.js
	cp host/interface/abstract_lens.js androidvox_out/host/interface/abstract_lens.js
	cp common/traverse_content.js androidvox_out/common/traverse_content.js
	cp common/table_util.js androidvox_out/common/table_util.js
	cp chromevox/injected/user_commands.js androidvox_out/chromevox/injected/user_commands.js
	cp host/chrome/tts_background.js androidvox_out/host/chrome/tts_background.js
	cp host/interface/abstract_msgs.js androidvox_out/host/interface/abstract_msgs.js
	cp common/chromevox.js androidvox_out/common/chromevox.js
	cp chromevox/injected/keyboard_handler.js androidvox_out/chromevox/injected/keyboard_handler.js
	cp chromevox/background/prefs.js androidvox_out/chromevox/background/prefs.js
	cp chromevox/injected/live_regions.js androidvox_out/chromevox/injected/live_regions.js
	cp common/traverse_table.js androidvox_out/common/traverse_table.js
	cp chromevox/background/kbexplorer.js androidvox_out/chromevox/background/kbexplorer.js
	cp closure/base.js androidvox_out/closure/base.js
	cp common/nav_description.js androidvox_out/common/nav_description.js
	cp host/testing/msgs.js androidvox_out/host/testing/msgs.js
	cp external/PowerKey.js androidvox_out/external/PowerKey.js
	cp common/aria_util.js androidvox_out/common/aria_util.js
	cp common/traverse_util.js androidvox_out/common/traverse_util.js
	cp chromevox/injected/init.js androidvox_out/chromevox/injected/init.js
	cp chromeshades/background/toggle.js androidvox_out/chromeshades/background/toggle.js
	cp chromeshades/injected/base_modifier.js androidvox_out/chromeshades/injected/base_modifier.js
	cp host/chrome/tts.js androidvox_out/host/chrome/tts.js
	cp common/key_util.js androidvox_out/common/key_util.js
	cp host/android_dev/tts.js androidvox_out/host/android_dev/tts.js
	cp host/chrome/host.js androidvox_out/host/chrome/host.js
	cp chromevox/*.png androidvox_out/chromevox/
	cp android/injected/loader.js androidvox_out/android/injected/loader.js
	cp chromevis/injected/loader.js androidvox_out/chromevis/injected/loader.js
	cp chromeshades/injected/shades_modifier.js androidvox_out/chromeshades/injected/shades_modifier.js

