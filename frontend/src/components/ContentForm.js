import React from 'react';

function ContentForm({ formData, setFormData }) {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div>
      <div className="mb-3">
        <label className="form-label fw-semibold">Headline</label>
        <input
          type="text"
          className="form-control"
          value={formData.headline}
          onChange={(e) => handleChange('headline', e.target.value)}
          placeholder="NEW LOOK"
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Subheadline</label>
        <input
          type="text"
          className="form-control"
          value={formData.subheadline}
          onChange={(e) => handleChange('subheadline', e.target.value)}
          placeholder="SAME AWARD WINNING TASTE"
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Description</label>
        <input
          type="text"
          className="form-control"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Available in all major retailers"
        />
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label fw-semibold">Price</label>
          <input
            type="text"
            className="form-control"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            placeholder="£4.99"
          />
        </div>

        <div className="col-6 mb-3">
          <label className="form-label fw-semibold">Offer</label>
          <input
            type="text"
            className="form-control"
            value={formData.offer}
            onChange={(e) => handleChange('offer', e.target.value)}
            placeholder="Special Offer"
          />
        </div>
      </div>
    </div>
  );
}

export default ContentForm;