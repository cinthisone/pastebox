import { useState, useEffect } from "react";
import { LazyStore } from "@tauri-apps/plugin-store";
import "./Settings.css";

// Shared store instance for settings
const settingsStore = new LazyStore("settings.json");

interface SettingsProps {
  onClose: (settings: { maxWidth: number | null; clipboardPrefix: string }) => void;
}

function Settings({ onClose }: SettingsProps) {
  const [maxWidth, setMaxWidth] = useState<string>("");
  const [clipboardPrefix, setClipboardPrefix] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Initialize - load existing settings from Tauri store
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedMaxWidth = await settingsStore.get<number>("maxWidth");
        if (savedMaxWidth !== null && savedMaxWidth !== undefined) {
          setMaxWidth(savedMaxWidth.toString());
        }
        const savedPrefix = await settingsStore.get<string>("clipboardPrefix");
        if (savedPrefix) {
          setClipboardPrefix(savedPrefix);
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    const width = maxWidth ? parseInt(maxWidth, 10) : null;

    if (width !== null && (isNaN(width) || width < 1)) {
      alert("Please enter a valid width greater than 0, or leave empty for no limit");
      return;
    }

    try {
      if (width !== null) {
        await settingsStore.set("maxWidth", width);
      } else {
        await settingsStore.delete("maxWidth");
      }

      if (clipboardPrefix.trim()) {
        await settingsStore.set("clipboardPrefix", clipboardPrefix);
      } else {
        await settingsStore.delete("clipboardPrefix");
      }

      await settingsStore.save();

      // Pass the saved values directly to avoid re-reading
      onClose({ maxWidth: width, clipboardPrefix: clipboardPrefix.trim() ? clipboardPrefix : "" });
    } catch (e) {
      console.error("Failed to save settings:", e);
      alert("Failed to save settings");
    }
  };

  const handleClear = async () => {
    setMaxWidth("");
    setClipboardPrefix("");
    try {
      await settingsStore.delete("maxWidth");
      await settingsStore.delete("clipboardPrefix");
      await settingsStore.save();
    } catch (e) {
      console.error("Failed to clear settings:", e);
    }
  };

  const handleClose = () => {
    // Close without saving - pass current values from store (loaded on mount)
    const width = maxWidth ? parseInt(maxWidth, 10) : null;
    onClose({ maxWidth: width, clipboardPrefix });
  };

  if (loading) {
    return (
      <div className="settings-overlay">
        <div className="settings-modal">
          <div className="settings-content">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="setting-item">
            <label htmlFor="maxWidth">Max Image Width (pixels)</label>
            <input
              id="maxWidth"
              type="number"
              min="1"
              placeholder="Leave empty for no limit"
              value={maxWidth}
              onChange={(e) => setMaxWidth(e.target.value)}
            />
            <small>Images wider than this will be resized before saving</small>
          </div>

          <div className="setting-item">
            <label htmlFor="clipboardPrefix">Clipboard Prefix</label>
            <input
              id="clipboardPrefix"
              type="text"
              placeholder="Text to add before the path"
              value={clipboardPrefix}
              onChange={(e) => setClipboardPrefix(e.target.value)}
            />
            <small>This text will be prepended to the copied path</small>
          </div>
        </div>

        <div className="settings-footer">
          <button className="button secondary" onClick={handleClear}>
            Clear
          </button>
          <button className="button primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
