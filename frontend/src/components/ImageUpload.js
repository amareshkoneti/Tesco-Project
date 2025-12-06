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
    <div
      className={`upload-zone ${isDragging ? 'active' : ''}`}
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
        <div>
          <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '10px' }} />
          <p className="mt-3 mb-0 text-muted small">Click to change image</p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '48px' }}>📤</div>
          <h6 className="mt-3">{label}</h6>
          <small className="text-muted">PNG, JPG, WEBP up to 32MB</small>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;