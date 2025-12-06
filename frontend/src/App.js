import React, { useState, useRef } from 'react';
import ImageUpload from './components/ImageUpload';
import ContentForm from './components/ContentForm';
import DesignControls from './components/DesignControls';
import PreviewPanel from './components/PreviewPanel';
import PosterCanvas from './components/PosterCanvas';
import { uploadImage, uploadLogo, analyzeImage, generateLayout } from './services/api';

function App() {
  const [formData, setFormData] = useState({
    headline: 'NEW LOOK',
    subheadline: 'SAME AWARD WINNING TASTE',
    description: 'Available in all major retailers',
    price: '£4.99',
    offer: 'Special Offer',
    ratio: '1:1',
    primaryColor: '#FFD700',
    secondaryColor: '#000000',
    accentColor: '#8B4513',
    bgColor: '#87CEEB'
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [layout, setLayout] = useState(null);
  const [poster, setPoster] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  
  const canvasRef = useRef(null);

  const handleImageSelect = async (file) => {
    setImageFile(file);
    setStatus('Uploading product image...');
    
    try {
      const result = await uploadImage(file);
      setUploadedImage(result);
      setStatus('Product image uploaded! Background removed.');
      
      setStatus('AI analyzing image...');
      await analyzeImage(result.nobg_filename);
      setStatus('Analysis complete!');
    } catch (error) {
      setStatus('Upload failed: ' + error.message);
    }
  };

  const handleLogoSelect = async (file) => {
    setLogoFile(file);
    setStatus('Uploading brand logo...');
    
    try {
      const result = await uploadLogo(file);
      setUploadedLogo(result);
      setStatus('Brand logo uploaded! Background removed.');
    } catch (error) {
      setStatus('Logo upload failed: ' + error.message);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return alert("Upload image first");

    setIsGenerating(true);
    setStatus('AI is studying your product...');

    try {
      const analysisResp = await analyzeImage(uploadedImage.nobg_filename);
      const productAnalysis = analysisResp.analysis;

      setStatus('Designing unique poster...');

      const layoutResp = await generateLayout(
        uploadedImage.nobg_filename,
        uploadedLogo?.nobg_filename || null,
        {
          ...formData,
          product_analysis: productAnalysis
        },
        formData.ratio
      );

      setLayout(layoutResp.layout);
      setRenderTrigger(t => t + 1);
      setTimeout(() => {
        const dataUrl = canvasRef.current?.toDataURL('image/png');
        setPoster(dataUrl);
        setStatus('Poster ready! ✨');
      }, 1000);

    } catch (err) {
      setStatus('Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Background Gradient */}
      <div className="min-vh-100" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'fixed',
        inset: 0,
        zIndex: -1
      }} />

      <div className="container py-5">
        {/* Hero Header */}
        <div className="text-center mb-5">
          <h1 className="display-3 fw-bold text-white mb-3" style={{ 
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            letterSpacing: '-0.5px'
          }}>
            AI Retail Poster Generator
          </h1>
          <p className="lead text-white opacity-90 fs-4">
            Professional retail posters in seconds • Powered by Gemini AI
          </p>
        </div>

        <div className="row g-5 align-items-start">
          {/* Left Sidebar - Controls */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: '2rem' }}>
              {/* Product Image Upload */}
              <div className="glass-card mb-4">
                <div className="p-4">
                  <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                    <span className="fs-3">Product Image</span>
                  </h5>
                  <ImageUpload onImageSelect={handleImageSelect} label="Drop your packshot here" />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="glass-card mb-4">
                <div className="p-4">
                  <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                    <span className="fs-3">Brand Logo (Optional)</span>
                  </h5>
                  <ImageUpload onImageSelect={handleLogoSelect} label="Upload logo" />
                  <p className="text-white-50 small mt-3 mb-0">
                    Your logo will appear cleanly in the corner
                  </p>
                </div>
              </div>

              {/* Content Form */}
              <div className="glass-card mb-4">
                <div className="p-4">
                  <h5 className="fw-bold text-white mb-4">Content</h5>
                  <ContentForm formData={formData} setFormData={setFormData} />
                </div>
              </div>

              {/* Design Controls */}
              <div className="glass-card mb-4">
                <div className="p-4">
                  <h5 className="fw-bold text-white mb-4">Design & Colors</h5>
                  <DesignControls formData={formData} setFormData={setFormData} />
                </div>
              </div>

              {/* Generate Button */}
              <button
                className="btn btn-lg w-100 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-3"
                style={{
                  background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                  color: '#000',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '1.25rem',
                  borderRadius: '1rem',
                  height: '64px'
                }}
                onClick={handleGenerate}
                disabled={isGenerating || !uploadedImage}
              >
                {isGenerating ? (
                  <>
                    <div className="spinner-border text-dark" role="status" style={{ width: '1.5rem', height: '1.5rem' }} />
                    <span>AI is Creating Your Poster...</span>
                  </>
                ) : (
                  <>
                    <span>Generate with AI</span>
                  </>
                )}
              </button>

              {/* Status */}
              {status && (
                <div className="mt-4 p-4 rounded-4 text-white text-center fw-medium"
                     style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Poster Preview */}
          <div className="col-lg-7">
            <div className="text-center">
              {layout && uploadedImage ? (
                <div className="d-inline-block position-relative">
                  <div className="preview-container shadow-2xl">
                    <PosterCanvas
                      key={renderTrigger}
                      ref={canvasRef}
                      layout={layout}
                      formData={formData}
                      imageUrl={`http://localhost:5000/uploads/${uploadedImage.nobg_filename}`}
                      logoUrl={uploadedLogo ? `http://localhost:5000/uploads/${uploadedLogo.nobg_filename}` : null}
                      onRenderComplete={(canvas) => {
                        console.log('Canvas rendered:', canvas.width, 'x', canvas.height);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-white fs-5 fw-medium opacity-90">
                      Your AI-generated poster is ready!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="preview-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon mb-4">Poster Preview</div>
                    <p className="text-white-50 fs-5">
                      Upload a product image and click <strong>Generate with AI</strong><br />
                      to see your professional poster appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          transition: transform 0.2s;
        }
        .glass-card:hover {
          transform: translateY(-4px);
        }
        .preview-container {
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          background: white;
          display: inline-block;
        }
        .preview-placeholder {
          width: 100%;
          max-width: 500px;
          height: 600px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          backdrop-filter: blur(10px);
          border: 2px dashed rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .placeholder-content {
          text-align: center;
          padding: 2rem;
        }
        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.3;
        }
        .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
        }
      `}</style>
    </>
  );
}

export default App;