import { useState, useEffect } from "react";
import "./Settings.css";

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const [maxWidth, setMaxWidth] = useState<string>("");

  // Initialize - load existing settings from localStorage
  useEffect(() => {
    const savedMaxWidth = localStorage.getItem("maxWidth");
    if (savedMaxWidth) {
      setMaxWidth(savedMaxWidth);
    }
  }, []);

  const handleSave = () => {
    const width = maxWidth ? parseInt(maxWidth, 10) : null;

    if (width !== null && (isNaN(width) || width < 1)) {
      alert("Please enter a valid width greater than 0, or leave empty for no limit");
      return;
    }

    if (width !== null) {
      localStorage.setItem("maxWidth", width.toString());
    } else {
      localStorage.removeItem("maxWidth");
    }

    onClose();
  };

  const handleClear = () => {
    setMaxWidth("");
    localStorage.removeItem("maxWidth");
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
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
