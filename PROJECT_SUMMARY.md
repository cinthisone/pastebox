# PasteBox - Project Summary

## What is PasteBox?

PasteBox is a Windows desktop application that allows users to:
1. Paste images from clipboard (Ctrl+V)
2. Automatically save them to Downloads folder
3. Preview the image in a small floating window
4. Copy the file path to clipboard automatically
5. Drag the image into other applications

## Project Structure

```
pastebox/
├── src/                           # Frontend (React + TypeScript)
│   ├── App.tsx                   # Main React component with paste logic
│   ├── App.css                   # Styling (gradient background, animations)
│   ├── main.tsx                  # React entry point
│   └── vite-env.d.ts            # TypeScript definitions
│
├── src-tauri/                    # Backend (Rust + Tauri)
│   ├── src/
│   │   ├── main.rs              # Rust entry point
│   │   └── lib.rs               # Tauri commands (save_image, copy_to_clipboard)
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri window configuration
│   └── build.rs                 # Build script
│
├── package.json                  # Node.js dependencies & scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── README.md                    # Main documentation
└── POWERSHELL_NOTES.md          # PowerShell run instructions

```

## Key Files & What They Do

### Frontend Files

#### `src/App.tsx` (122 lines)
The main React component that:
- Listens for paste events (Ctrl+V)
- Reads image from clipboard using FileReader API
- Converts image to base64
- Calls Rust backend to save image
- Displays image preview with drag functionality
- Shows toast notifications
- Has custom titlebar with close button

Key functions:
- `handlePaste()`: Detects paste event, reads clipboard image
- `handleDragStart()`: Allows dragging image with file path
- `showToast()`: Shows success/error messages

#### `src/App.css` (185 lines)
Styling for the app:
- Purple gradient background (#667eea to #764ba2)
- Custom titlebar styling (32px height, draggable)
- Image container with rounded corners and shadow
- Toast notification animation (slideUp)
- Floating placeholder icon animation
- Responsive image sizing (max 240px height)

### Backend Files

#### `src-tauri/src/lib.rs` (70 lines)
Rust backend with Tauri commands:

**`save_image(image_data: String) -> Result<String, String>`**
- Receives base64 image data from frontend
- Decodes base64 to bytes
- Generates filename: `pastebox-[timestamp].png`
- Gets Downloads directory path
- Writes image file to Downloads
- Returns full file path

**`copy_to_clipboard(text: String) -> Result<(), String>`**
- Copies text to system clipboard
- Used to copy file path after saving

**`run()`**
- Initializes Tauri app
- Registers plugins (fs, clipboard-manager, opener)
- Registers command handlers

#### `src-tauri/src/main.rs` (6 lines)
Simple entry point that calls `pastebox_lib::run()`

#### `src-tauri/Cargo.toml` (29 lines)
Rust dependencies:
- `tauri` v2 with clipboard-write-text feature
- `tauri-plugin-fs` - File system access
- `tauri-plugin-clipboard-manager` - Clipboard operations
- `base64` - Image encoding/decoding
- `chrono` - Timestamp generation
- `serde` + `serde_json` - Data serialization

#### `src-tauri/tauri.conf.json` (41 lines)
Tauri configuration:
- Product name: "PasteBox"
- Window size: 300x350px
- Frameless window (decorations: false)
- Always on top (alwaysOnTop: true)
- Centered on screen (center: true)
- Resizable: true
- Skip taskbar: false

### Configuration Files

#### `package.json`
NPM scripts:
- `npm run dev` - Runs Vite dev server
- `npm run tauri:dev` - **Main command to run app in PowerShell**
- `npm run tauri:build` - Build production app
- `npm run build` - Build frontend only

Dependencies:
- react ^19.1.0
- react-dom ^19.1.0
- @tauri-apps/api ^2
- @tauri-apps/plugin-opener ^2

Dev Dependencies:
- @tauri-apps/cli ^2
- typescript ~5.8.3
- vite ^7.0.4

#### `vite.config.ts`
Vite configuration for React with HMR (Hot Module Replacement)

#### `tsconfig.json`
TypeScript compiler options

## How It Works - Complete Workflow

1. **App Starts**
   - User runs `npm run tauri:dev` in PowerShell
   - Tauri creates 300x350px frameless window
   - Window appears centered, always on top
   - Shows "Paste an image (Ctrl+V)" placeholder

2. **User Copies Image**
   - User takes screenshot or copies image from browser
   - Image is now in system clipboard

3. **User Pastes (Ctrl+V)**
   - PasteBox window must have focus
   - JavaScript paste event fires in `App.tsx`
   - `handlePaste()` function executes:
     - Reads clipboard data items
     - Finds image item (PNG/JPEG)
     - Gets blob data
     - Converts blob to base64 using FileReader

4. **Image Gets Saved**
   - Frontend calls Rust: `invoke("save_image", { imageData: base64Data })`
   - Rust receives base64 string
   - Rust decodes base64 to bytes
   - Generates filename: `pastebox-20251021_143052.png`
   - Saves to: `C:\Users\[user]\Downloads\pastebox-[timestamp].png`
   - Returns full file path to frontend

5. **Path Gets Copied**
   - Frontend receives file path
   - Calls Rust: `invoke("copy_to_clipboard", { text: filePath })`
   - File path is now in clipboard (replacing the image)
   - Toast shows: "✅ Saved & path copied!"

6. **Image Preview Shows**
   - Frontend displays image using base64 data URL
   - Filename shown below image
   - Image has drag cursor

7. **User Drags Image**
   - User drags image from PasteBox to another app
   - `handleDragStart()` sets file path as drag data
   - Other app receives file path (can load the saved image)

## Important Notes

### PowerShell Requirement
Always run using PowerShell:
```powershell
npm run tauri:dev
```

This is documented in:
- README.md (multiple sections)
- POWERSHELL_NOTES.md (dedicated file)
- This PROJECT_SUMMARY.md

### File Naming Convention
Images are saved with timestamp format:
```
pastebox-YYYYMMDD_HHMMSS.png
Example: pastebox-20251021_143052.png
```

### Supported Image Formats
- Input: Any image in clipboard (PNG, JPEG, etc.)
- Output: Always saved as PNG

### Window Behavior
- Frameless (no standard Windows title bar)
- Custom titlebar with app name and close button
- Always on top of other windows
- Can be moved by dragging titlebar
- Resizable (can make bigger to see large images)

## Future Enhancements (Ideas)

Commented in code for future implementation:

1. **Global Shortcut**
   - Ctrl+Shift+V to open PasteBox from anywhere
   - Would require `tauri-plugin-global-shortcut`

2. **Cloud Upload**
   - Upload to Imgur/S3 instead of local save
   - Copy URL instead of file path
   - Useful for sharing images online

3. **Image History**
   - Show gallery of recent pastes
   - Click to re-copy path
   - Delete old images

4. **Settings Panel**
   - Choose save location (not just Downloads)
   - Choose output format (PNG, JPG, WebP)
   - Customize filename format
   - Toggle always-on-top

5. **Multiple Formats**
   - Save as JPG for smaller file size
   - Support WebP for modern apps
   - Quality slider for compressed formats

## Technical Architecture

### Frontend (React)
- Modern React 19 with hooks
- TypeScript for type safety
- Vite for fast development
- No state management library (simple useState)
- Direct Tauri API calls via `@tauri-apps/api`

### Backend (Rust)
- Tauri v2 framework
- Async command handlers
- Strong type safety
- Error handling with Result types
- Plugin architecture

### IPC (Inter-Process Communication)
- Frontend calls Rust via `invoke()`
- Commands registered in Tauri builder
- JSON serialization via serde
- Async/await for non-blocking operations

## Building & Distribution

### Development
```powershell
npm run tauri:dev
```
- Hot reload enabled
- Debug mode
- Console logging available

### Production Build
```powershell
npm run tauri:build
```
- Creates optimized bundle
- Generates installer in `src-tauri/target/release/bundle/`
- Includes Windows .msi installer
- Can create portable .exe

### Bundle Contents
- Compiled Rust binary
- Bundled web assets (HTML/CSS/JS)
- Icons for Windows
- App metadata

## Dependencies Overview

### Frontend Dependencies
- **react**: UI library
- **react-dom**: DOM rendering
- **@tauri-apps/api**: Tauri JavaScript API
- **@tauri-apps/plugin-opener**: Open URLs/files

### Rust Dependencies
- **tauri**: Core framework
- **tauri-plugin-fs**: File system operations
- **tauri-plugin-clipboard-manager**: Clipboard access
- **base64**: Image encoding
- **chrono**: Date/time for filenames
- **serde/serde_json**: Serialization

## File Sizes (Approximate)

- `src/App.tsx`: 122 lines, ~3KB
- `src/App.css`: 185 lines, ~4KB
- `src-tauri/src/lib.rs`: 70 lines, ~2KB
- `src-tauri/src/main.rs`: 6 lines, <1KB
- Total source code: ~10KB (excluding dependencies)

Production build size: ~15-20MB (includes Rust runtime + Chromium)

## Testing Checklist

- [ ] App launches successfully
- [ ] Window appears centered, frameless, always on top
- [ ] Paste placeholder shows when no image
- [ ] Ctrl+V pastes image from clipboard
- [ ] Image preview appears after paste
- [ ] File saved to Downloads folder with correct name
- [ ] File path copied to clipboard
- [ ] Toast notification shows success message
- [ ] Can drag image to other apps (e.g., Discord, Explorer)
- [ ] Close button works
- [ ] Window can be moved by dragging titlebar

## Known Limitations

1. **Focus Required**: Window must have focus for Ctrl+V to work
2. **Image Only**: Only works with clipboard images, not files
3. **PNG Only**: Always saves as PNG (even if source was JPG)
4. **No History**: Doesn't keep track of previous pastes
5. **No Global Shortcut**: Can't paste when app is not focused

## Troubleshooting

### App won't start
- Check: Using PowerShell (not cmd)
- Check: Running `npm run tauri:dev` (with colon)
- Solution: `npm install` to ensure dependencies

### Image doesn't paste
- Check: Window has focus
- Check: Clipboard contains image (not file path)
- Solution: Click window, copy image again

### Build errors
- Check: Rust installed and in PATH
- Check: Node.js v18+
- Solution: Run clean build (delete node_modules and target)

---

**Project Created**: October 21, 2025
**Technology Stack**: Tauri 2 + React 19 + TypeScript + Rust
**Total Development Time**: ~1 hour
**Lines of Code**: ~400 lines (excluding dependencies)
