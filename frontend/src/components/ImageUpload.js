import React, { useState } from 'react';

function ImageUpload({ onImageSelect, label = "Upload Image" }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const uniqueId = `file-input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <div
        className={`upload-zone-pro ${isDragging ? 'dragging' : ''} ${preview ? 'has-preview' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => document.getElementById(uniqueId).click()}
      >
        <input
          id={uniqueId}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <h6 className="upload-label">{label}</h6>
            <p className="upload-hint">PNG, JPG, WEBP up to 32MB</p>
            <div className="upload-action">
              <span className="action-text">Click or drag file here</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .upload-zone-pro {
          background: #F9FAFB;
          border: 2px dashed #D1D5DB;
          border-radius: 10px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .upload-zone-pro:not(.has-preview) {
          padding: 2rem;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upload-zone-pro:hover {
          border-color: #1E3A5F;
          background: #F3F4F6;
        }

        .upload-zone-pro.dragging {
          border-color: #FDB913;
          background: #FFFBEB;
          border-style: solid;
        }

        .upload-zone-pro.has-preview {
          padding: 0;
          border-style: solid;
          border-color: #E5E7EB;
          height: auto;
          display: block;
        }

        .preview-container {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .upload-zone-pro:hover .preview-overlay {
          opacity: 1;
        }

        .overlay-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .overlay-text {
          color: #FFFFFF;
          font-size: 0.9375rem;
          font-weight: 600;
          margin: 0;
        }

        .upload-placeholder {
          width: 100%;
        }

        .upload-icon {
          color: #6B7280;
          margin-bottom: 1rem;
          transition: color 0.3s ease;
        }

        .upload-zone-pro:hover .upload-icon {
          color: #1E3A5F;
        }

        .upload-zone-pro.dragging .upload-icon {
          color: #FDB913;
        }

        .upload-label {
          font-size: 1rem;
          font-weight: 700;
          color: #1E3A5F;
          margin: 0 0 0.5rem 0;
        }

        .upload-hint {
          font-size: 0.8125rem;
          color: #6B7280;
          margin: 0 0 1.25rem 0;
        }

        .upload-action {
          display: inline-block;
          background: #1E3A5F;
          color: #FFFFFF;
          padding: 0.625rem 1.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .upload-zone-pro:hover .upload-action {
          background: #2C5282;
          transform: translateY(-1px);
        }

        .upload-zone-pro.dragging .upload-action {
          background: #FDB913;
          color: #000000;
        }

        .action-text {
          display: block;
        }
      `}</style>
    </>
  );
}

export default ImageUpload;