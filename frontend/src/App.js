import React, { useState, useRef } from 'react';
import ImageUpload from './components/ImageUpload';
import ContentForm from './components/ContentForm';
import DesignControls from './components/DesignControls';
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
    backgroundMode: 'color',
    bgColor: '#87CEEB',
    backgroundImage: null
  });

  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [bgFile, setBgFile] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [layout, setLayout] = useState(null);
  const [poster, setPoster] = useState(null);

  const [renderTrigger, setRenderTrigger] = useState(0);
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
          backgroundMode: "image"   // <-- CRITICAL FIX
        }));
        setStatus('Background uploaded successfully!');
      }
      else {
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
    // 1. Analyse product
    const analysisResp = await analyzeImage(uploadedImage.nobg_filename);
    const productAnalysis = analysisResp.analysis;

    setStatus('Designing poster...');

    // 2. THIS IS THE FINAL FIX – send backgroundImage with the exact key Gemini expects
    const payloadForAI = {
      ...formData,
      backgroundImage: formData.backgroundImage, // ensure never lost
      backgroundMode: formData.backgroundMode,
      product_analysis: productAnalysis
    };


    console.log("🔍 FINAL formData BEFORE generate:", JSON.stringify(formData, null, 2));
    // ↑ Open browser console → you’ll now see "backgroundImage": "2025…_mybg.jpg"

    const layoutResp = await generateLayout(
      uploadedImage.nobg_filename,
      uploadedLogo?.nobg_filename || null,
      payloadForAI,          // ← this object now contains backgroundImage
      formData.ratio
    );

    setLayout(layoutResp.layout);
    setRenderTrigger((t) => t + 1);

    // 3. Export canvas only after React-Konva has fully rendered
    setTimeout(() => {
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL({ pixelRatio: 2 }); // sharper PNG
        setPoster(dataUrl);
        setStatus('Poster ready – download below!');
      }
    }, 800);

  } catch (err) {
    console.error(err);
    setStatus('Error: ' + (err.message || err));
  } finally {
    setIsGenerating(false);
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
                disabled={isGenerating || !uploadedImage} // button enabled if product image uploaded
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
            {layout && uploadedImage ? (
              <div className="d-inline-block position-relative">
                <PosterCanvas
                  key={renderTrigger}
                  ref={canvasRef}
                  layout={layout}
                  formData={formData}
                  imageUrl={`http://localhost:5000/uploads/${uploadedImage.nobg_filename}`}
                  logoUrl={uploadedLogo ? `http://localhost:5000/uploads/${uploadedLogo.nobg_filename}` : null}
                  bgImageUrl={
                    formData.backgroundMode === "image" && formData.backgroundImage
                      ? `http://localhost:5000/uploads/${formData.backgroundImage}`
                      : null
                  }
                />
              </div>
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
