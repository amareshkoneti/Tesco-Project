import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const PreviewPanel = ({ layout, selectedRatio, isGenerating }) => {
  const iframeRef = useRef(null);

  // Calculate dimensions based on selected ratio
  const getDimensions = () => {
    switch (selectedRatio) {
      case '1:1': return { width: 1080, height: 1080 };
      case '9:16': return { width: 1080, height: 1920 };
      case '1.9:1': return { width: 1200, height: 628 };
      default: return { width: 1080, height: 1080 };
    }
  };

  const dimensions = getDimensions();
  const maxPreviewWidth = 700;
  const scale = Math.min(maxPreviewWidth / dimensions.width, 1);
  const previewWidth = dimensions.width * scale;
  const previewHeight = dimensions.height * scale;

  // Debug log to see if dimensions are updating
  useEffect(() => {
    console.log('🎯 PreviewPanel mounted/updated');
    console.log('Selected Ratio:', selectedRatio);
    console.log('Dimensions:', dimensions);
    console.log('Scale:', scale);
    console.log('Preview Size:', previewWidth, 'x', previewHeight);
  }, [selectedRatio, dimensions.width, dimensions.height]);

  // Download function
  const handleDownload = async () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    await new Promise(res => setTimeout(res, 200));

    try {
      const canvas = await html2canvas(iframeDoc.body, {
        width: dimensions.width,
        height: dimensions.height,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const link = document.createElement('a');
      link.download = `poster-${selectedRatio}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  if (isGenerating) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">🎨 AI is creating your masterpiece...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!layout || layout.type !== 'html') {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</div>
            <p className="text-muted">Your poster will appear here</p>
            <p className="text-muted small">Upload an image and click Generate</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🖼️ Rendering preview with:', {
    selectedRatio,
    previewWidth,
    previewHeight,
    dimensions
  });

  return (
    <div className="card h-100">
      <div className="card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Preview ({selectedRatio})</h5>
          <button className="btn btn-success btn-sm" onClick={handleDownload}>
            Download PNG
          </button>
        </div>

        {/* Preview iframe */}
        <div
          key={selectedRatio}
          style={{
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
            margin: '0 auto',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            position: 'relative',
            backgroundColor: '#f0f0f0'
          }}
        >
          <iframe
            key={selectedRatio}
            ref={iframeRef}
            srcDoc={layout.content}
            title="AI Poster"
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

        {/* Footer */}
        <div className="text-center mt-3">
          <small className="text-muted">
            Dimensions: {dimensions.width} × {dimensions.height}px ({selectedRatio})
          </small>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;