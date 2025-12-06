import React, { useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const PreviewPanel = ({ poster, layout, isGenerating, formData }) => {
  const iframeRef = useRef(null);
  const [renderedImage, setRenderedImage] = React.useState(null);

  // Calculate dimensions based on ratio
  const getDimensions = () => {
    const ratio = formData?.ratio || '1:1';
    switch (ratio) {
      case '1:1':
        return { width: 1080, height: 1080 };
      case '9:16':
        return { width: 1080, height: 1920 };
      case '16:9':
        return { width: 1920, height: 1080 };
      default:
        return { width: 1080, height: 1080 };
    }
  };

  const dimensions = getDimensions();
  const aspectRatio = dimensions.height / dimensions.width;

  // Download function for HTML posters
  const handleDownload = async () => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const canvas = await html2canvas(iframeDoc.body, {
        width: dimensions.width,
        height: dimensions.height,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      const link = document.createElement('a');
      link.download = `poster-${Date.now()}.png`;
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

  // NEW: If Gemini gave us HTML → show in iframe with correct dimensions
  if (layout?.type === "html") {
    return (
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Preview</h5>
            <button 
              className="btn btn-success btn-sm"
              onClick={handleDownload}
            >
              📥 Download PNG
            </button>
          </div>
          
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '600px',
              margin: '0 auto',
              aspectRatio: `${dimensions.width}/${dimensions.height}`,
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={layout.content}
              title="AI Poster"
              style={{ 
                width: dimensions.width,
                height: dimensions.height,
                border: 'none',
                transform: 'scale(0.556)', // Scale to fit 600px max width
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              sandbox="allow-scripts"
            />
          </div>
          
          <div className="text-center mt-3">
            <small className="text-muted">
              Dimensions: {dimensions.width} × {dimensions.height}px ({formData?.ratio})
            </small>
          </div>
        </div>
      </div>
    );
  }

  // OLD: Fallback to canvas PNG
  if (poster) {
    return (
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title mb-3">Preview</h5>
          <img 
            src={poster} 
            alt="Poster" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }} 
          />
          <div className="text-center mt-3">
            <a 
              href={poster} 
              download={`poster-${Date.now()}.png`}
              className="btn btn-success"
            >
              📥 Download
            </a>
          </div>
        </div>
      </div>
    );
  }

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
};

export default PreviewPanel;