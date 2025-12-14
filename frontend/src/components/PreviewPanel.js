// frontend/src/components/PreviewPanel.js
// Component to preview the generated poster and allow downloading as JPG

import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

// Props: layout (object), selectedRatio (string), isGenerating (boolean)
const PreviewPanel = ({ layout, selectedRatio, isGenerating }) => {

  // Ref for the iframe containing the preview
  const iframeRef = useRef(null);

  // Get dimensions based on selected ratio
  const getDimensions = () => {
    switch (selectedRatio) {
      case '1:1': return { width: 1080, height: 1080 };
      case '9:16': return { width: 1080, height: 1920 };
      case '1.9:1': return { width: 1200, height: 628};
      default: return { width: 1080, height: 1080 };
    }
  };

  // Calculate preview size and scale
  const dimensions = getDimensions();
  
  // Calculate scale to fit within available space
  const maxWidth = 900;
  const maxHeight = 800;
  const scaleX = maxWidth / dimensions.width;
  const scaleY = maxHeight / dimensions.height;
  const scale = Math.min(scaleX, scaleY, 1);
  
  const previewWidth = dimensions.width * scale;
  const previewHeight = dimensions.height * scale;

  // Log preview dimensions on ratio change
  useEffect(() => {
    console.log('Preview dimensions:', {
      ratio: selectedRatio,
      original: dimensions,
      scale: scale,
      preview: { width: previewWidth, height: previewHeight }
    });
  }, [selectedRatio]);


  // Handle download of the preview as JPG
  const handleDownload = async () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    await new Promise(res => setTimeout(res, 200));

    try {
      // Generate canvas from iframe content
      const canvas = await html2canvas(iframeDoc.body, {
        width: dimensions.width,
        height: dimensions.height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      // Compress to target size (~500KB)
      let quality = 0.9;
      let dataURL = canvas.toDataURL("image/jpeg", quality);

      const targetSize = 500 * 1024;
      while (dataURL.length > targetSize && quality > 0.2) {
        quality -= 0.1;
        dataURL = canvas.toDataURL("image/jpeg", quality);
      }

      // Trigger download
      const link = document.createElement("a");
      link.download = `poster-${selectedRatio}-${Date.now()}.jpg`;
      link.href = dataURL;
      link.click();

    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  // Render loading, no preview, or the preview panel
  if (isGenerating) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '5px solid #E5E7EB',
          borderTopColor: '#1E3A5F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }}></div>
        <p style={{
          color: '#6B7280',
          fontSize: '1.125rem',
          fontWeight: '500',
          margin: 0
        }}>
          🎨 AI is creating your masterpiece...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render no preview available message
  if (!layout || layout.type !== 'html') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        padding: '2rem',
        width: '100%'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.4 }}>🎨</div>
        <h5 style={{
          color: '#1E3A5F',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '0.75rem'
        }}>
          No Preview Available
        </h5>
        <p style={{
          color: '#6B7280',
          fontSize: '1rem',
          margin: 0,
          maxWidth: '400px'
        }}>
          Upload a product image and click "Generate with AI" to create your poster
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem'
    }}>
      {/* Download Button */}
      <button
        onClick={handleDownload}
        style={{
          background: '#1E3A5F',
          color: '#FFFFFF',
          border: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          boxShadow: '0 2px 8px rgba(30, 58, 95, 0.2)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#2C5282';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 58, 95, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#1E3A5F';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(30, 58, 95, 0.2)';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
        </svg>
        Download JPG
      </button>

      {/* Preview Frame */}
      <div style={{
        position: 'relative',
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        background: '#FFFFFF'
      }}>
        {/* Iframe for preview */}
        <iframe
          key={selectedRatio}
          ref={iframeRef}
          srcDoc={layout.content}
          title="AI Poster Preview"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            border: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'white'
          }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Info Footer */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div style={{
          padding: '0.5rem 1rem',
          background: '#F9FAFB',
          border: '2px solid #E5E7EB',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#6B7280',
          fontFamily: 'monospace'
        }}>
          {dimensions.width} × {dimensions.height}px
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          background: '#1E3A5F',
          border: '2px solid #1E3A5F',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: '700',
          color: '#FFFFFF'
        }}>
          {selectedRatio}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;