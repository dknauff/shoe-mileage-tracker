export default function Header({ showAddButton, addShoeOpen, onToggleAddShoe, onSignOut }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        background: "#222",
        zIndex: 10,
        padding: "16px 0 8px 0",
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 28,
          letterSpacing: 1,
          marginLeft: 28,
          flex: 1,
        }}
      >
        Shoe Mileage Tracker
      </h1>

      {showAddButton && (
        <button
          onClick={onToggleAddShoe}
          style={{
            background: "none",
            border: "none",
            color: "#1abc9c",
            fontSize: 32,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            lineHeight: 1,
            marginRight: 20,
          }}
          title={addShoeOpen ? "Close Add Shoe" : "Add New Shoe"}
          aria-label={addShoeOpen ? "Close Add Shoe" : "Add New Shoe"}
        >
          <span style={{ fontSize: 32, fontWeight: 700, display: "inline-block", lineHeight: 1, marginTop: -2 }}>
            {addShoeOpen ? "-" : "+"}
          </span>
        </button>
      )}

      <button
        onClick={onSignOut}
        style={{
          background: "none",
          border: "none",
          color: "#e74c3c",
          fontSize: 24,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 8,
          borderRadius: "50%",
          marginRight: 28,
        }}
        title="Sign Out"
        aria-label="Sign Out"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
