import React from 'react';
import ImageUpload from './ImageUpload';
import PaletteSuggestions from "./PaletteSuggestions";

function DesignControls({ formData, setFormData, onBgImageSelect }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const normalizeHex = (hex) => {
    if (!hex) return "#000000";
    return hex.length === 9 ? hex.slice(0, 7) : hex;
  };

  const applyPalette = (palette) => {
    setFormData({
      ...formData,
      primaryColor: normalizeHex(palette.primary_color),
      secondaryColor: normalizeHex(palette.secondary_color),
      accentColor: normalizeHex(palette.accent_color),
      bgColor: normalizeHex(palette.bg_color),
    });
  };

  return (
    <>
      <div className="design-controls">
        {/* Palette Suggestions */}
        <div className="control-section">
          <PaletteSuggestions onApply={applyPalette} />
        </div>

        {/* Brand Colors */}
        <div className="control-section">
          <label className="section-label">Brand Colors</label>
          <div className="color-list">
            <div className="color-item">
              <label className="color-label">Primary</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  className="color-picker"
                  value={normalizeHex(formData.primaryColor)}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                />
                <span className="color-value">{normalizeHex(formData.primaryColor)}</span>
              </div>
            </div>

            <div className="color-item">
              <label className="color-label">Secondary</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  className="color-picker"
                  value={normalizeHex(formData.secondaryColor)}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                />
                <span className="color-value">{normalizeHex(formData.secondaryColor)}</span>
              </div>
            </div>

            <div className="color-item">
              <label className="color-label">Accent</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  className="color-picker"
                  value={normalizeHex(formData.accentColor)}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                />
                <span className="color-value">{normalizeHex(formData.accentColor)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="control-section">
          <label className="section-label">Background</label>
          
          <div className="bg-mode-selector">
            <button
              className={`mode-btn ${formData.backgroundMode === 'color' ? 'active' : ''}`}
              onClick={() => handleChange('backgroundMode', 'color')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2z"/>
              </svg>
              Color
            </button>
            <button
              className={`mode-btn ${formData.backgroundMode === 'image' ? 'active' : ''}`}
              onClick={() => handleChange('backgroundMode', 'image')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
              </svg>
              Image
            </button>
          </div>

          {formData.backgroundMode === 'color' && (
            <div className="bg-content">
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  className="color-picker"
                  value={normalizeHex(formData.bgColor)}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                />
                <span className="color-value">{normalizeHex(formData.bgColor)}</span>
              </div>
            </div>
          )}

          {formData.backgroundMode === 'image' && (
            <div className="bg-content">
              {onBgImageSelect ? (
                <div className="bg-upload-compact">
                  <ImageUpload
                    onImageSelect={(file) => {
                      onBgImageSelect(file);
                      handleChange('backgroundImage', file.name);
                    }}
                    label="Upload background"
                  />
                </div>
              ) : (
                <div className="bg-unavailable">
                  Background upload unavailable
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .design-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .control-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1E3A5F;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .color-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .color-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .color-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6B7280;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .color-picker-wrapper {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          background: #F9FAFB;
          border: 2px solid #E5E7EB;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          transition: border-color 0.2s ease;
        }

        .color-picker-wrapper:hover {
          border-color: #9CA3AF;
        }

        .color-picker-wrapper:focus-within {
          border-color: #1E3A5F;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
        }

        .color-picker {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: transparent;
          flex-shrink: 0;
        }

        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .color-picker::-webkit-color-swatch {
          border: 2px solid #E5E7EB;
          border-radius: 4px;
        }

        .color-value {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1E3A5F;
          font-family: monospace;
          text-transform: uppercase;
          flex: 1;
          min-width: 0;
        }

        .bg-mode-selector {
          display: flex;
          gap: 0.5rem;
          background: #F3F4F6;
          padding: 0.25rem;
          border-radius: 6px;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn:hover {
          background: #E5E7EB;
          color: #1E3A5F;
        }

        .mode-btn.active {
          background: #1E3A5F;
          color: #FFFFFF;
        }

        .mode-btn svg {
          width: 16px;
          height: 16px;
        }

        .bg-content {
          margin-top: 0.5rem;
        }

        .bg-upload-compact {
          /* The ImageUpload component will handle its own styling */
        }

        .bg-unavailable {
          padding: 1rem;
          background: #F9FAFB;
          border: 2px dashed #D1D5DB;
          border-radius: 6px;
          text-align: center;
          font-size: 0.8125rem;
          color: #6B7280;
        }
      `}</style>
    </>
  );
}

export default DesignControls;