

export default function GameOverMessage({ onPlayAgain }) {
  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "20px",
        padding: "20px",
        backgroundColor: "#d4edda",
        borderRadius: "15px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#155724", marginBottom: "15px" }}>
        🎉 Congratulations! You matched all items! 🎉
      </h2>
      <button
        onClick={onPlayAgain}
        style={{
          padding: "12px 25px",
          backgroundColor: "#28a745",
          color: "white",
          fontWeight: "bold",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "background-color 0.3s, transform 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#218838")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#28a745")}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Play Again
      </button>
    </div>
  );
}
