# PowerShell Run Instructions

## IMPORTANT - ALWAYS USE THIS COMMAND

When compiling/running this Tauri app, you MUST use PowerShell and run:

```powershell
npm run tauri:dev
```

**DO NOT** use:
- ❌ `npm run tauri dev` (won't work - space instead of colon)
- ❌ `tauri dev` (missing npm run)

## Why PowerShell?

This project is configured for Windows development and requires PowerShell for proper execution of Tauri commands.

## Quick Commands

### Development (with hot reload)
```powershell
npm run tauri:dev
```

### Production Build
```powershell
npm run tauri:build
```

### Clean Build
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force src-tauri/target
npm install
npm run tauri:dev
```

## Note for Future Sessions

If you open a new Claude Code session or terminal:

1. Navigate to project directory
2. Open PowerShell (not cmd or bash)
3. Run: `npm run tauri:dev`

This file exists to ensure you never forget the correct command!
