import React from 'react';
import ImageUpload from './ImageUpload';

function DesignControls({ formData, setFormData, onBgImageSelect }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };


  return (
    <div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Brand Colors</label>
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small">Primary</label>
            <input
              type="color"
              className="form-control color-input"
              value={formData.primaryColor}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label small">Secondary</label>
            <input
              type="color"
              className="form-control color-input"
              value={formData.secondaryColor}
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label small">Accent</label>
            <input
              type="color"
              className="form-control color-input"
              value={formData.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
            />
          </div>

          {/* Background selector (new) */}
          <div className="col-6">
            <label className="form-label small">Background</label>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select"
                value={formData.backgroundMode || 'color'}
                onChange={(e) => handleChange('backgroundMode', e.target.value)}
              >
                <option value="color">Color</option>
                <option value="image">Image</option>
              </select>
            </div>

            {formData.backgroundMode === 'color' && (
              <div className="mt-2">
                <input
                  type="color"
                  className="form-control color-input"
                  value={formData.bgColor}
                  onChange={(e) => handleChange('bgColor', e.target.value)}
                />
              </div>
            )}

            {formData.backgroundMode === 'image' && (
              <div className="mt-2">
                {onBgImageSelect ? (
                  <ImageUpload
                    onImageSelect={(file) => {
                      // parent should handle upload and update formData.backgroundImage with filename
                      onBgImageSelect(file);
                      // optimistically set a placeholder name until upload response returns
                      handleChange('backgroundImage', file.name);
                    }}
                    label="Upload background"
                  />
                ) : (
                  <small className="text-muted">Background image upload not available</small>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignControls;