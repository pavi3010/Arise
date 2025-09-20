
import React from "react";

export default function NutrientCard({ item, onClick, className, disabled }) {
  return (
    <button onClick={onClick} className={className} disabled={disabled}>
      {item.nutrient}
    </button>
  );
}