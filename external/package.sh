#!/bin/bash
#
# Takes the fileset for a Chrome Extension, as produced by blaze,
# and packages them into a deployable zip, or a Chrome CRX file.
#
# Author: deboer@google.com (James deBoer)
#
# Forked from //java/com/google/android/apps/lilypad/extension/package.sh
# Author: hearnden@google.com (David Hearnden)

# On the slightest whisper of the mention of an error, terminate everything.
set -e

# Command used to print informational output.
ECHO=echo
# Sub directory the extensions will be copied to
EXTENSION="extension"

unset ZIP_FILE
unset CRX_FILE
unset SRC_DIR
unset WORK_DIR
unset KEY

# Prints usage information.
usage() {
  local prog=$(basename "$0")
  echo "usage: $prog <args> file(s)"
  echo "  --zip <file.zip>     Packages the extension into a ZIP file"
  echo "  --crx <file.crx>     Packages the extension into a CRX file"
  echo "  --src <dir>          Source fileset"
  echo "  --key <file>         The private key used to sign the package."
  echo "  --quiet              Suppress output messages"
  echo "  --help               Displays this help"
  echo
}

# Prints help, then exits.
help() {
  echo "Prepares a Chrome Extension into a deployable bundle."
  echo
  usage
  exit 0
}

# Prints an error, then exits.
error() {
  [[ -n "$*" ]] && echo "error: $*"
  exit 1
}

# Reads command-line arguments and reports errors.
process_args() {
  while [[ "$#" != 0 ]]
  do
    case "$1" in
      --crx) shift; [[ -z "$1" ]] && error "file expected" ; CRX_FILE="$1" ;;
      --zip) shift; [[ -z "$1" ]] && error "file expected" ; ZIP_FILE="$1" ;;
      --src) shift; [[ -z "$1" ]] && error "dir expected" ; SRC_DIR="$1" ;;
      --key) shift; [[ -z "$1" ]] && error "file expected" ; KEY="$1" ;;
      --help) help; exit 0 ;;
      --quiet) ECHO=true ;;
      *) error "unexpected argument: $1" ;;
    esac
    shift
  done

  if [[ -z "$SRC_DIR" ]]
  then
    error "missing argument: --src"
  fi
}

# Copies the fileset into a temporary area, and prepares them for bundling.
prepare_files() {
  "$ECHO" "preparing bundle"

  mkdir "$TEMP_DIR/$EXTENSION"
  cp -RL "$SRC_DIR"/* "$TEMP_DIR/$EXTENSION"
  chmod -R u+w "$TEMP_DIR"
}


# Bundles the prepared files into a .zip archive.
build_zip() {
  "$ECHO" "zipping to $ZIP_FILE"

  # The zip command does not support zipping from a particular directory; it
  # only supports zipping from the current directory.  And, of course, changing
  # directory to it breaks the path to the ZIP_FILE, because that is a relative
  # path.  So we have to output via an (absolute) tempfile.
  local temp_zip="$TEMP_DIR/extension.zip"
  cd "$TEMP_DIR"
  local zip_dir_name="$(basename ${ZIP_FILE%.*})"
  ln -s "$EXTENSION" "$zip_dir_name"
  zip -rq "$temp_zip" "$zip_dir_name"
  cd - >/dev/null
  mv "$temp_zip" "$ZIP_FILE"
}

byte_swap () {
  # Take "abcdefgh" and return it as "ghefcdab"
  echo "${1:6:2}${1:4:2}${1:2:2}${1:0:2}"
}

# Bundles the prepared files into a .crx archive. Mainly copied from
# http://code.google.com/chrome/extensions/crx.html
build_crx() {
  "$ECHO" "creating $CRX_FILE"
  local temp_crx="$TEMP_DIR/extension.crx"
  local key="`pwd`/$KEY"

  # The zip command does not support zipping from a particular directory; it
  # only supports zipping from the current directory.  And, of course, changing
  # directory to it breaks the path to the ZIP_FILE, because that is a relative
  # path.  So we have to output via an (absolute) tempfile.
  local temp_zip="$TEMP_DIR/extension.zip"
  cd "$TEMP_DIR/$EXTENSION"
  zip -x "$key" -rq "$temp_zip" .

  # signature
  local sig="$TEMP_DIR/extension.sig"
  openssl sha1 -sha1 -binary -sign "$key" < "$temp_zip" > "$sig"

  # public key
  local pub="$TEMP_DIR/extension.pub"
  openssl rsa -pubout -outform DER < "$key" > "$pub" 2>/dev/null

  local crmagic_hex="4372 3234" # Cr24
  local version_hex="0200 0000" # 2
  local pub_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$pub" | awk '{print $5}')))
  local sig_len_hex=$(byte_swap $(printf '%08x\n' $(ls -l "$sig" | awk '{print $5}')))
  (
    echo "$crmagic_hex $version_hex $pub_len_hex $sig_len_hex" | xxd -r -p
    cat "$pub" "$sig" "$temp_zip"
  ) > "$temp_crx"
  "$ECHO" "Wrote $temp_crx"

  cd - >/dev/null
  mv "$temp_crx" "$CRX_FILE"
}

main() {
  process_args "$@"

  TEMP_DIR=$(mktemp -d)
  trap "rm -rf '$TEMP_DIR'" EXIT

  prepare_files
  [[ -n "$ZIP_FILE" ]] && build_zip
  [[ -n "$CRX_FILE" ]] && build_crx

  trap - EXIT

  return 0
}

main "$@"
