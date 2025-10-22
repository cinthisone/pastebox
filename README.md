# PasteBox 📋

A lightweight Windows desktop app built with Tauri that lets you paste images from your clipboard, automatically save them to your Downloads folder, and drag them into other applications.

## Features

- ✨ **Clipboard Image Paste**: Press Ctrl+V to paste images from clipboard
- 💾 **Auto-Save**: Automatically saves images to your Downloads folder
- 📋 **Copy File Path**: File path is automatically copied to clipboard after saving
- 🎯 **Drag & Drop**: Drag saved images into other applications
- 🎨 **Clean UI**: Frameless, always-on-top window with modern design
- 🚀 **Fast**: Built with Tauri for minimal resource usage

## Screenshot

The app opens as a small floating window (300x350px) that stays on top of other windows. Simply paste an image and it will be saved automatically!

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust + Tauri
- **UI**: CSS with gradient background and animations

## Project Structure

```
pastebox/
├── src/                    # React frontend
│   ├── App.tsx            # Main app component
│   ├── App.css            # Styles
│   └── main.tsx           # Entry point
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # App entry
│   │   └── lib.rs         # Tauri commands
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
└── package.json           # Node dependencies
```

## Installation & Setup

### Prerequisites

1. **Node.js** (v18 or later)
2. **Rust** (latest stable)
3. **Windows Build Tools**

### Install Dependencies

```bash
npm install
```

## Running the App

**IMPORTANT**: When running the development server, you MUST use PowerShell and run:

```powershell
npm run tauri:dev
```

This is the correct command for this project. DO NOT use `npm run tauri dev` (won't work).

### Build for Production

To create a production build:

```powershell
npm run tauri build
```

The installer will be created in `src-tauri/target/release/bundle/`.

## How to Use

1. **Launch the app** using `npm run tauri:dev` in PowerShell
2. **Copy an image** to your clipboard (from screenshot tool, browser, etc.)
3. **Focus the PasteBox window** and press `Ctrl+V`
4. The image will:
   - Be displayed in the window
   - Saved to your Downloads folder as `pastebox-[timestamp].png`
   - Have its file path copied to your clipboard
5. **Drag the image** from PasteBox into another app (e.g., Discord, Slack, File Explorer)

## Key Files Explained

### `src-tauri/src/lib.rs`

Contains two main Rust commands:

- `save_image(image_data)`: Saves base64 image to Downloads folder, returns file path
- `copy_to_clipboard(text)`: Copies text to system clipboard

### `src/App.tsx`

React component that:

- Listens for paste events (Ctrl+V)
- Reads clipboard image data
- Sends to Rust backend for saving
- Displays preview and handles drag events

### `src-tauri/tauri.conf.json`

Configures the Tauri window:

- Size: 300x350px
- Frameless (no title bar)
- Always on top
- Centered on screen

## Keyboard Shortcuts

- `Ctrl+V`: Paste image from clipboard
- `Alt+F4` or click X: Close app

## Future Enhancements (Commented in Code)

Ideas for future development:

- Global shortcut (Ctrl+Shift+V) to open PasteBox from anywhere
- Cloud upload option (Imgur, S3, etc.)
- Image history/gallery
- Settings panel for customization
- Multiple output formats (JPG, WebP, etc.)

## Troubleshooting

### App doesn't start

Make sure you're using PowerShell and running:

```powershell
npm run tauri:dev
```

### Image doesn't paste

- Ensure you have an image in your clipboard (not text or files)
- Make sure the PasteBox window is focused when pressing Ctrl+V

### Build errors

Run these commands to clean and rebuild:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force src-tauri/target
npm install
npm run tauri:dev
```

## Development Notes

### Important: Always use PowerShell

This project is configured to run with:

```powershell
npm run tauri:dev
```

**Note**: The script name is `tauri:dev` (with colon), not `tauri dev` (with space).

### Package.json Scripts

Check `package.json` for available scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### Dependencies

**Frontend:**
- React 18
- TypeScript
- Vite
- @tauri-apps/api

**Backend (Rust):**
- tauri v2
- tauri-plugin-fs
- tauri-plugin-clipboard-manager
- base64
- chrono
- serde

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ using Tauri**
