# WSL Path Support Feature

## Overview
Added one-click WSL path toggle directly in the titlebar. Users can instantly switch between Windows and WSL path formats when copying file paths to the clipboard without opening the settings modal.

**UI:** Titlebar button shows 🪟 (Windows) or 🐧 (Penguin/WSL) depending on current mode.

## Changes Made

### 1. New Utility Module: `src/utils.ts`
Created utility functions for path conversion:

- **`convertToWslPath(windowsPath: string)`** 
  - Converts Windows path to WSL format
  - Replaces backslashes with forward slashes
  - Converts drive letter (C: → /mnt/c)
  - Example: `C:\Users\info\Downloads\image.png` → `/mnt/c/Users/info/Downloads/image.png`

- **`formatPathForClipboard(windowsPath: string, useWslPath: boolean)`**
  - Wrapper function that chooses format based on user preference
  - Returns WSL path if `useWslPath` is true, otherwise returns Windows path

### 2. Updated App Component: `src/App.tsx`

**New State:**
- `useWslPath: boolean` - Tracks user's path format preference

**New Titlebar Button:**
- Added WSL toggle button between title and settings button
- Shows 🪟 when Windows path mode is active
- Shows 🐧 when WSL path mode is active
- **One click to toggle** - instantly switches mode and saves to localStorage
- Tooltip shows "Switch to Windows path" or "Switch to WSL path"

**Updated Effects:**
- `useEffect` on mount now loads `useWslPath` from localStorage
- `useEffect` dependency array includes `useWslPath` to re-register event handlers

**Updated Paste Handler:**
- Formats the file path using `formatPathForClipboard()` before copying to clipboard
- Toast message indicates path format: "✅ Saved & WSL path copied!" or "✅ Saved & path copied!"

### 3. Updated Settings Component: `src/Settings.tsx`

**Simplified:**
- Removed `useWslPath` state and related handlers
- Settings modal now focuses only on image width resizing
- WSL toggle moved to titlebar for instant access

### 4. Updated Styles

**App.css - New WSL Toggle Button Styling:**
```css
.titlebar-button.wsl-toggle {
  font-size: 14px;
}

.titlebar-button.wsl-toggle:hover {
  background: rgba(102, 126, 234, 0.4);
}
```

**Settings.css - Removed:**
- Removed `.checkbox-label` and `.checkbox-input` classes (no longer needed)

## How It Works

### User Flow (Super Simple!)
1. **Click the toggle button** in titlebar (🪟 or 🐧)
2. **Paste an image** (Ctrl+V)
3. **Path is copied in chosen format**
   - Windows: `C:\Users\info\Downloads\pastebox-20251208_120000.png`
   - WSL: `/mnt/c/Users/info/Downloads/pastebox-20251208_120000.png`
4. **Toast shows:** "✅ Saved & WSL path copied!" (or regular path)

### Data Storage
- Preference is saved to browser `localStorage` with key `"useWslPath"`
- Value is stored as string: `"true"` or `"false"`
- Persists across app restarts

### Path Conversion Logic
The conversion handles:
- Backslash to forward slash conversion
- Drive letter conversion (C: → /mnt/c, D: → /mnt/d, etc.)
- Case-insensitive drive letter handling

## Titlebar Button Layout
```
[PasteBox]  [🪟/🐧 WSL Toggle] [⚙ Settings] [− Minimize] [× Close]
```

## Example Paths

| Original Windows Path | Converted WSL Path |
|---|---|
| `C:\Users\info\Downloads\image.png` | `/mnt/c/Users/info/Downloads/image.png` |
| `D:\Projects\screenshot.png` | `/mnt/d/Projects/screenshot.png` |
| `C:\Users\info\AppData\Local\file.png` | `/mnt/c/Users/info/AppData/Local/file.png` |

## Testing Checklist

- [ ] Titlebar shows toggle button (🪟 for Windows, 🐧 for WSL)
- [ ] Clicking toggle switches mode instantly
- [ ] Mode persists after app restart
- [ ] Tooltip shows correct switch message
- [ ] Pasting with Windows mode copies Windows path
- [ ] Pasting with WSL mode copies converted path
- [ ] Toast notification shows correct format
- [ ] Settings modal still works for image width resizing
- [ ] Dragging image still works with both modes

## Key Improvements

✅ **No Settings Modal Needed** - Toggle is in titlebar, instant access
✅ **Visual Feedback** - 🪟 vs 🐧 emoji makes mode immediately obvious
✅ **Zero Extra Clicks** - One-click toggle vs open settings, find checkbox, click, save
✅ **Tooltip Guidance** - Hover shows what clicking will do
✅ **Persistent** - Choice saved to localStorage

## Notes

- The drag-and-drop functionality still uses the original Windows path, which is correct since most applications handle Windows paths natively
- Only the clipboard copy operation respects the WSL preference
- The feature is purely client-side and doesn't require backend changes
- Settings modal is now cleaner with just the image width option



