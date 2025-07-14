# File Concatenator Chrome Extension

## Description
A simple Chrome extension that allows users to select multiple files, concatenate their contents into a single `code.txt` file, and download it. Files are persisted across sessions using Chrome storage. Supports modern file pickers with fallback.

## Features
- Select files via native picker or fallback input.
- View and remove selected files.
- Generate and download concatenated `code.txt`.
- Duplicate file prevention (by name).
- Basic error handling and loading indicators.

## Installation
1. Download the extension files (manifest.json, popup.html, popup.js) into a folder.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right toggle).
4. Click "Load unpacked" and select the folder containing the files.
5. The extension icon will appear in your toolbar—click it to open the popup.

## Usage
- Click "Select Files" to add files.
- View selected files in the list; remove via 'X' button.
- Click "Generate code.txt" to download the concatenated file.
- Use "Clear Selection" to reset.

## Notes
- Requires Chrome permissions: storage, downloads.
- Tested on Chrome 100+.
- No external dependencies.

MIT License.
