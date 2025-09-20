
import React from "react";

export default function FoodCard({ item, onClick, className, disabled }) {
  return (
    <button onClick={onClick} className={className} disabled={disabled}>
      <span style={{ fontSize: "24px", marginRight: "8px" }}>{item.emoji}</span>
      <span>{item.food}</span>
    </button>
  );
}
