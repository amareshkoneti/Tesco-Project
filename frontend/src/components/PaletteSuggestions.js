import React, { useEffect, useState } from "react";
import { getFrequentPalettes } from "../services/api";

function PaletteSuggestions({ onApply }) {
  const [palettes, setPalettes] = useState([]);

  const normalizeHex = (hex) => {
    if (!hex) return "#000000";
      return hex.length === 9 ? hex.slice(0, 7) : hex;
    };


  useEffect(() => {
    getFrequentPalettes()
      .then(setPalettes)
      .catch(() => {});
  }, []);

  if (!palettes.length) return null;

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">
        Suggested Palettes
      </label>

      <div className="d-flex flex-wrap gap-2">
        {palettes.map((p, i) => (
          <div
            key={i}
            onClick={() => onApply(p)}
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              border: "1px solid #ccc",
              borderRadius: 6,
              cursor: "pointer"
            }}
            title="Apply palette"
          >
            <Swatch color={normalizeHex(p.primary_color)} />
            <Swatch color={normalizeHex(p.secondary_color)} />
            <Swatch color={normalizeHex(p.accent_color)} />
            <Swatch color={normalizeHex(p.bg_color)} />
          </div>
        ))}
      </div>
    </div>
  );
}

const Swatch = ({ color }) => (
  <div
    style={{
      width: 18,
      height: 18,
      backgroundColor: color,
      borderRadius: 4,
      border: "1px solid #aaa"
    }}
  />
);

export default PaletteSuggestions;
