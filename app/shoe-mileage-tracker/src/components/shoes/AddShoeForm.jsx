import { useState } from "react";
import DatePicker from "../ui/DatePicker";

const inputStyle = {
  width: "100%",
  display: "block",
  marginBottom: 10,
  padding: 12,
  fontSize: 18,
  borderRadius: 8,
  border: "1px solid #444",
  background: "#181818",
  color: "#fff",
  boxSizing: "border-box",
  fontFamily: "'Oswald', system-ui, sans-serif",
};

// inline=true: first-time setup form rendered in-page (no overlay)
// inline=false (default): modal overlay shown when user clicks "+"
export default function AddShoeForm({ inline = false, open, onClose, onAdd }) {
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [firstRunDate, setFirstRunDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expectedLifecycle, setExpectedLifecycle] = useState("");

  async function handleAdd() {
    await onAdd({ brand, name, color, firstRunDate, expectedLifecycle });
    setBrand("");
    setName("");
    setColor("");
    setFirstRunDate(new Date().toISOString().split("T")[0]);
    setExpectedLifecycle("");
  }

  const fields = (
    <>
      <input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} style={inputStyle} />
      <input placeholder="Shoe Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <input placeholder="Color" value={color} onChange={(e) => setColor(e.target.value)} style={inputStyle} />
      {inline && (
        <input
          type="date"
          value={firstRunDate}
          onChange={(e) => setFirstRunDate(e.target.value)}
          style={{ ...inputStyle, lineHeight: 1.2, height: 44 }}
        />
      )}
      <input
        type="number"
        placeholder="Expected Lifecycle (MI)"
        value={expectedLifecycle}
        onChange={(e) => setExpectedLifecycle(e.target.value)}
        min="0"
        step="0.1"
        style={{ ...inputStyle, marginBottom: inline ? 16 : 10 }}
      />
    </>
  );

  if (inline) {
    return (
      <>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Add Your First Shoe</h2>
        <div style={{ background: "#222", borderRadius: 12, boxShadow: "0 1px 4px #0002", padding: 16, marginTop: 8, marginBottom: 24 }}>
          {fields}
          <button
            onClick={handleAdd}
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 20,
              background: "#1abc9c",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              marginTop: 8,
              boxShadow: "0 2px 8px #1abc9c33",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 22, marginRight: 8, verticalAlign: "middle" }}>➕</span>
            Add Shoe
          </button>
        </div>
      </>
    );
  }

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#222",
          borderRadius: 12,
          boxShadow: "0 2px 16px #0008",
          padding: 24,
          minWidth: 280,
          maxWidth: 350,
          width: "90vw",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 20, margin: "0 0 18px 0", textAlign: "center" }}>Add New Shoe</h2>
        {fields}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, justifyContent: "flex-end", width: "100%" }}>
          <DatePicker value={firstRunDate} onChange={setFirstRunDate} dark={false} />
          <button
            onClick={handleAdd}
            className="add-shoe-btn"
            style={{ fontSize: 17, padding: "10px 0", minWidth: 110 }}
          >
            <span style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>➕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
