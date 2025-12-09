import React, { useState, useRef } from 'react';
import ImageUpload from './components/ImageUpload';
import ContentForm from './components/ContentForm';
import DesignControls from './components/DesignControls';
import PreviewPanel from './components/PreviewPanel';
import { uploadImage, uploadLogo, analyzeImage, generateLayout } from './services/api';

function App() {
  const [formData, setFormData] = useState({
    headline: 'NEW LOOK',
    subheadline: 'SAME AWARD WINNING TASTE',
    description: 'Available in all major retailers',
    price: '£4.99',
    offer: 'Special Offer',
    primaryColor: '#FFD700',
    secondaryColor: '#000000',
    accentColor: '#8B4513',
    backgroundMode: 'color',
    bgColor: '#87CEEB',
    backgroundImage: null
  });
  const [renderTrigger, setRenderTrigger] = useState(0);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [layouts, setLayouts] = useState(null);
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [poster, setPoster] = useState(null);
  const canvasRef = useRef(null);

  // -------------------------------
  // PRODUCT IMAGE UPLOAD
  // -------------------------------
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

  // -------------------------------
  // LOGO UPLOAD
  // -------------------------------
  const handleLogoSelect = async (file) => {
    setLogoFile(file);
    setStatus('Uploading brand logo...');
    try {
      const result = await uploadLogo(file);
      setUploadedLogo(result);
      setStatus('Brand logo uploaded!');
    } catch (error) {
      setStatus('Logo upload failed: ' + error.message);
    }
  };

  // -------------------------------
  // BACKGROUND IMAGE UPLOAD
  // -------------------------------
  const handleBgImageUpload = async (file) => {
    setBgFile(file);
    setStatus('Uploading background image...');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await fetch('http://localhost:5000/api/upload-bg', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      
      console.log("Background upload response:", data);
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          backgroundImage: data.nobg_filename,
          backgroundMode: "image"
        }));
        setStatus('Background uploaded successfully!');
      } else {
        setStatus('Background upload failed: ' + data.error);
      }
    } catch (err) {
      setStatus('Upload error: ' + err.message);
    }
  };

  // -------------------------------
  // GENERATE POSTER
  // -------------------------------
  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert("Upload product image first");
      return;
    }

    setIsGenerating(true);
    setStatus('AI is studying your product...');

    try {
      const analysisResp = await analyzeImage(uploadedImage.nobg_filename);
      const productAnalysis = analysisResp.analysis;

      setStatus('Designing poster...');

      const payloadForAI = {
        ...formData,
        backgroundImage: formData.backgroundImage,
        backgroundMode: formData.backgroundMode,
        product_analysis: productAnalysis
      };

      console.log("🔍 FINAL formData BEFORE generate:", payloadForAI);

      const layoutResp = await generateLayout(
        uploadedImage.nobg_filename,
        uploadedLogo?.nobg_filename || null,
        payloadForAI
      );

      setLayouts(layoutResp);
      setSelectedRatio('1:1');
      setRenderTrigger((t) => t + 1);
      setStatus('Poster generated! Choose a ratio to preview.');

    } catch (err) {
      console.error(err);
      setStatus('Error: ' + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  const ratios = ['1:1', '9:16', '1.9:1'];
  
  const getLayoutByRatio = (ratio) => {
    switch (ratio) {
      case '1:1': return layouts?.layout_1;
      case '9:16': return layouts?.layout_2;
      case '1.9:1': return layouts?.layout_3;
      default: return layouts?.layout_1;
    }
  };

  return (
    <>
      {/* Background Gradient */}
      <div
        className="min-vh-100"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'fixed',
          inset: 0,
          zIndex: -1
        }}
      />

      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-3 fw-bold text-white mb-3">
            AI Retail Poster Generator
          </h1>
          <p className="lead text-white opacity-90 fs-4">
            Professional retail posters in seconds • Powered by Gemini AI
          </p>
        </div>

        <div className="row g-5 align-items-start">
          {/* LEFT SIDE */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: '2rem' }}>
              {/* PRODUCT UPLOAD */}
              <div className="glass-card mb-4 p-4">
                <h5 className="fw-bold text-white mb-4">Product Image</h5>
                <ImageUpload onImageSelect={handleImageSelect} label="Drop your packshot here" />
              </div>

              {/* LOGO UPLOAD */}
              <div className="glass-card mb-4 p-4">
                <h5 className="fw-bold text-white mb-4">Brand Logo (Optional)</h5>
                <ImageUpload onImageSelect={handleLogoSelect} label="Upload logo" />
              </div>

              {/* CONTENT */}
              <div className="glass-card mb-4 p-4">
                <h5 className="fw-bold text-white mb-4">Content</h5>
                <ContentForm formData={formData} setFormData={setFormData} />
              </div>

              {/* DESIGN & BACKGROUND */}
              <div className="glass-card mb-4 p-4">
                <h5 className="fw-bold text-white mb-4">Design & Colors</h5>
                <DesignControls
                  formData={formData}
                  setFormData={setFormData}
                  onBgImageSelect={handleBgImageUpload}
                />
              </div>

              {/* GENERATE BTN */}
              <button
                className="btn btn-lg w-100 fw-bold shadow-lg"
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
                {isGenerating ? "AI is Creating..." : "Generate with AI"}
              </button>

              {/* STATUS */}
              {status && (
                <div className="mt-4 p-4 rounded-4 text-white text-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE PREVIEW */}
          <div className="col-lg-7 text-center">
            {layouts && uploadedImage ? (
              <>
                {/* RATIO SELECTION BUTTONS */}
                <div className="mb-3">
                  <div className="btn-group" role="group">
                    {ratios.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`btn ${selectedRatio === r ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => {
                          console.log('Button clicked, changing ratio to:', r);
                          setSelectedRatio(r);
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <PreviewPanel
                  key={selectedRatio}
                  layout={getLayoutByRatio(selectedRatio)}
                  selectedRatio={selectedRatio}
                  isGenerating={isGenerating}
                  formData={formData}
                />
              </>
            ) : (
              <div className="preview-placeholder">Upload an image to get started</div>
            )}
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
        }
        .preview-placeholder {
          width: 100%;
          max-width: 500px;
          height: 600px;
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }
      `}</style>
    </>
  );
}

export default App;