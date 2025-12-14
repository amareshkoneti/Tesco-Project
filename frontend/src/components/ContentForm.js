import React from 'react';

function ContentForm({ formData, setFormData }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <>
      <div className="form-container">
        <div className="form-group">
          <label className="form-label-pro">Headline</label>
          <input
            type="text"
            className="form-input-pro"
            value={formData.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            placeholder="Product Name Here"
          />
        </div>

        <div className="form-group">
          <label className="form-label-pro">Subheadline</label>
          <input
            type="text"
            className="form-input-pro"
            value={formData.subheadline}
            onChange={(e) => handleChange('subheadline', e.target.value)}
            placeholder="Your Subheadline Here"
          />
        </div>

        <div className="form-group">
          <label className="form-label-pro">Description</label>
          <input
            type="text"
            className="form-input-pro"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Available in at Tesco"
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group-half">
            <label className="form-label-pro">Price</label>
            <input
              type="text"
              className="form-input-pro"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="£4.99"
            />
          </div>

          <div className="form-group form-group-half">
            <label className="form-label-pro">Offer</label>
            <input
              type="text"
              className="form-input-pro"
              value={formData.offer}
              onChange={(e) => handleChange('offer', e.target.value)}
              placeholder="£4.00"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-group-half {
          flex: 1;
        }

        .form-label-pro {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1E3A5F;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-input-pro {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          color: #1E3A5F;
          background: #FFFFFF;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .form-input-pro::placeholder {
          color: #9CA3AF;
          font-weight: 400;
        }

        .form-input-pro:focus {
          outline: none;
          border-color: #1E3A5F;
          background: #F9FAFB;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
        }

        .form-input-pro:hover:not(:focus) {
          border-color: #9CA3AF;
        }
      `}</style>
    </>
  );
}

export default ContentForm;