// frontend/src/App.js
// import necessary libraries and components
import React, { useState, useRef } from 'react';
import ImageUpload from './components/ImageUpload';
import ContentForm from './components/ContentForm';
import DesignControls from './components/DesignControls';
import PreviewPanel from './components/PreviewPanel';
import CompliancePanel from './components/CompliancePanel';
import { uploadImage, uploadLogo, analyzeImage, generateLayout } from './services/api';

// Main App Component
function App() {

  // State variables
  const [formData, setFormData] = useState({
    headline: '',
    subheadline: '',
    description: '',
    price: '',
    offer: '',
    primaryColor: '#FFD700',
    secondaryColor: '#000000ff',
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
  const [complianceResult, setComplianceResult] = useState(null);
  const [productType, setProductType] = useState(null);

  // Handler for image selection and upload
  const handleImageSelect = async (file) => {
    setImageFile(file);
    setStatus('Uploading product image...');
    try {
      const result = await uploadImage(file);
      setUploadedImage(result);
      setStatus('Product image uploaded! Background removed.');
      setStatus('AI analyzing image...');
      const analysisResp = await analyzeImage(result.nobg_filename);
      console.log("Analysis response:", analysisResp);

      setProductType(
        analysisResp.product_type ||
        analysisResp.analysis?.product_type ||
        "Unknown product"
      );
      setStatus('Analysis complete!');
    } catch (error) {
      setStatus('Upload failed: ' + error.message);
    }
  };

  // Handler for logo selection and upload
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

  // Handler for background image upload
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

  // Handler to generate poster using AI
  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert("Upload product image first");
      return;
    }

    setIsGenerating(true);
    setStatus("AI is studying your product...");

    try {
      const analysisResp = await analyzeImage(uploadedImage.nobg_filename);
      const productAnalysis = analysisResp.analysis;

      setStatus("Designing poster...");

      const payloadForAI = {
        ...formData,
        product_analysis: productAnalysis,
        image_filename: uploadedImage.nobg_filename,
        logo_filename: uploadedLogo?.nobg_filename || null
      };

       // Show sequential status updates for each ratio
      setTimeout(() => setStatus("Generating poster for 1:1 ratio..."), 1000);
      setTimeout(() => setStatus("Generating poster for 9:16 ratio..."), 31000);
      setTimeout(() => setStatus("Generating poster for 1.9:1 ratio..."), 61000);

      const layoutResp = await generateLayout(payloadForAI);

      if (layoutResp.compliance) {
        setComplianceResult(layoutResp.compliance);
      } else {
        setComplianceResult(null);
      }

      if (!layoutResp.success) {
        setStatus(`❌ ${layoutResp.error}`);
        setLayouts(null);
        return;
      }

      setLayouts(layoutResp);
      setSelectedRatio("1:1");
      setRenderTrigger((t) => t + 1);
      setStatus("🎉 Poster generated! Choose a ratio to preview.");
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.message || err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Supported aspect ratios
  const ratios = ['1:1', '9:16', '1.9:1'];

  // Get layout based on selected ratio
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
      {/* Background */}
      <div style={{
        background: '#F8F9FA',
        minHeight: '100vh'
      }}>
        {/* Top Navigation Bar */}
        <nav style={{
          background: '#1E3A5F',
          borderBottom: '4px solid #FDB913',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 1.5rem' }}>
            <div className="d-flex align-items-center justify-content-between" style={{ padding: '0.875rem 0' }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#FDB913',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '24px',
                  color: '#1E3A5F'
                }}>
                  R
                </div>
                <div>
                  <h1 className="m-0" style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    letterSpacing: '-0.5px'
                  }}>
                    Retail Media Creative Builder Using Generative AI
                  </h1>
                  <p className="m-0" style={{
                    fontSize: '0.8125rem',
                    color: '#B8C5D6'
                  }}>
                    AI-Powered Marketing Design Platform
                  </p>
                </div>
              </div>
              <div style={{
                background: 'rgba(253, 185, 19, 0.15)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                color: '#FDB913',
                fontSize: '0.8125rem',
                fontWeight: '600',
                border: '1px solid rgba(253, 185, 19, 0.3)'
              }}>
                AI Enabled
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            
            {/* LEFT SIDEBAR - Collapsible Controls */}
            <div style={{ 
              width: '320px', 
              flexShrink: 0,
              maxHeight: 'calc(100vh - 140px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '0.5rem'
            }}>
              
              {/* Assets Section */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">Assets</h3>
                
                {/* Product Image Upload */}
                <div className="compact-card">
                  <div className="compact-header">
                    <span>Product</span>
                    <span className="badge-required">Required</span>
                  </div>
                  <div className="compact-body">
                    {productType && (
                      <div className="info-tag">
                        ✓ {productType}
                      </div>
                    )}
                    <ImageUpload onImageSelect={handleImageSelect} label="Upload product" />
                    
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="compact-card">
                  <div className="compact-header">
                    <span>Logo</span>
                    <span className="badge-optional">Optional</span>
                  </div>
                  <div className="compact-body">
                    <ImageUpload onImageSelect={handleLogoSelect} label="Upload logo" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">Content</h3>
                <div className="compact-card">
                  <div className="compact-body">
                    <ContentForm formData={formData} setFormData={setFormData} />
                  </div>
                </div>
              </div>

              {/* Design Section */}
              <div className="sidebar-section">
                <h3 className="sidebar-title">Design</h3>
                <div className="compact-card">
                  <div className="compact-body">
                    <DesignControls
                      formData={formData}
                      setFormData={setFormData}
                      onBgImageSelect={handleBgImageUpload}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* CENTER - Preview Panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Header with Generate Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                gap: '1rem'
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1E3A5F',
                    margin: 0
                  }}>
                    Preview
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    margin: 0
                  }}>
                    Your generated poster
                  </p>
                </div>

                {/* Status Message */}
                {status && (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    background: '#EFF6FF',
                    border: '2px solid #DBEAFE',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    maxWidth: '400px'
                  }}>
                    <div style={{ fontSize: '1.125rem', flexShrink: 0 }}>ℹ️</div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: '#1E3A5F', 
                      lineHeight: 1.4,
                      fontWeight: '500'
                    }}>
                      {status}
                    </div>
                  </div>
                )}

                <button
                  style={{
                    background: '#FDB913',
                    color: '#000000',
                    border: 'none',
                    padding: '0.875rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '8px',
                    cursor: uploadedImage ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: uploadedImage ? '0 4px 12px rgba(253, 185, 19, 0.3)' : 'none',
                    opacity: uploadedImage ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    flexShrink: 0
                  }}
                  onClick={handleGenerate}
                  disabled={isGenerating || !uploadedImage}
                  onMouseOver={(e) => {
                    if (uploadedImage) {
                      e.currentTarget.style.background = '#E5A711';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (uploadedImage) {
                      e.currentTarget.style.background = '#FDB913';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🚀</span>
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </button>
              </div>

              {/* Ratio Selector after image generated */}
              {layouts && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    background: '#F3F4F6',
                    padding: '0.375rem',
                    borderRadius: '8px'
                  }}>
                    {ratios.map((r) => (
                      <button
                        key={r}
                        style={{
                          padding: '0.625rem 1.5rem',
                          background: selectedRatio === r ? '#1E3A5F' : 'transparent',
                          color: selectedRatio === r ? '#FFFFFF' : '#6B7280',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minWidth: '80px'
                        }}
                        onClick={() => setSelectedRatio(r)}
                        onMouseOver={(e) => {
                          if (selectedRatio !== r) {
                            e.currentTarget.style.background = '#E5E7EB';
                            e.currentTarget.style.color = '#1E3A5F';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedRatio !== r) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#6B7280';
                          }
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Container */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '10px',
                border: '2px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                minHeight: '70vh'
              }}>
                {layouts ? (
                  <PreviewPanel
                    layout={getLayoutByRatio(selectedRatio)}
                    selectedRatio={selectedRatio}
                    isGenerating={isGenerating}
                  />
                ) : complianceResult ? (
                  <CompliancePanel compliance={complianceResult} />
                ) : (
                  <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.4 }}>📸</div>
                    <h4 style={{
                      color: '#1E3A5F',
                      fontWeight: '700',
                      fontSize: '1.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      Ready to Create
                    </h4>
                    <p style={{
                      color: '#6B7280',
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}>
                      Upload your product image and configure settings to generate your professional retail poster
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '2rem',
                      marginTop: '2.5rem'
                    }}>
                      {[
                        { num: '1', text: 'Upload Product' },
                        { num: '2', text: 'Customize Content' },
                        { num: '3', text: 'Generate Poster' }
                      ].map((step) => (
                        <div key={step.num} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#FDB913',
                            color: '#000000',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '1.25rem'
                          }}>
                            {step.num}
                          </div>
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#6B7280',
                            fontWeight: '600'
                          }}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .sidebar-section {
          margin-bottom: 1.25rem;
        }

        .sidebar-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1E3A5F;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.75rem 0;
        }

        .compact-card {
          background: #FFFFFF;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          overflow: hidden;
        }

        .compact-header {
          background: #F9FAFB;
          padding: 0.625rem 0.875rem;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #1E3A5F;
        }

        .compact-body {
          padding: 0.875rem;
        }

        .compact-body:has(.upload-zone-pro.has-preview) {
          padding: 0;
        }

        .badge-required {
          background: #1E3A5F;
          color: #FFFFFF;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-optional {
          background: #E5E7EB;
          color: #6B7280;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-tag {
          margin-top: 0.625rem;
          padding: 0.5rem 0.75rem;
          background: #EFF6FF;
          border-left: 3px solid #1E3A5F;
          border-radius: 4px;
          color: #1E3A5F;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-compact {
          background: #FFFFFF;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          gap: 0.625rem;
          align-items: flex-start;
        }
      `}</style>
    </>
  );
}

export default App;