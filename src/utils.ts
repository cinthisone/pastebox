/**
 * Utility functions for path conversion and formatting
 * 
 * These functions convert between Windows and WSL (Windows Subsystem for Linux) path formats.
 * The WSL toggle button in the titlebar allows quick switching between formats.
 */

/**
 * Converts a Windows path to WSL format
 * Example: C:\Users\info\Downloads\image.png → /mnt/c/Users/info/Downloads/image.png
 * 
 * How it works:
 * 1. Replaces backslashes with forward slashes
 * 2. Converts drive letter (C:, D:, etc.) to /mnt/c, /mnt/d, etc.
 * 
 * @param windowsPath - The Windows path string
 * @returns The WSL formatted path
 */
export function convertToWslPath(windowsPath: string): string {
  // Replace backslashes with forward slashes
  let wslPath = windowsPath.replace(/\\/g, "/");

  // Handle drive letter (e.g., C: → /mnt/c)
  const driveMatch = wslPath.match(/^([a-zA-Z]):/);
  if (driveMatch) {
    const drive = driveMatch[1].toLowerCase();
    wslPath = wslPath.replace(/^[a-zA-Z]:/, `/mnt/${drive}`);
  }

  return wslPath;
}

/**
 * Formats a path for clipboard based on user preference
 * 
 * @param windowsPath - The original Windows path
 * @param useWslPath - Whether to convert to WSL format (controlled by titlebar toggle)
 * @returns The formatted path (either Windows or WSL format)
 */
export function formatPathForClipboard(
  windowsPath: string,
  useWslPath: boolean
): string {
  if (useWslPath) {
    return convertToWslPath(windowsPath);
  }
  return windowsPath;
}

