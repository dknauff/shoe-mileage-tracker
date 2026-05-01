import { useState } from "react";
import DatePicker from "../ui/DatePicker";

const inputStyle = {
  width: "100%",
  display: "block",
  padding: 12,
  marginBottom: 12,
  fontSize: 18,
  borderRadius: 8,
  border: "1px solid #444",
  background: "#181818",
  color: "#fff",
  fontFamily: "'Oswald', system-ui, sans-serif",
};

export default function AddRunForm({ shoe, onAdd }) {
  const [miles, setMiles] = useState("");
  const [runType, setRunType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  async function handleAdd() {
    const parsed = parseFloat(miles);
    const success = await onAdd({
      miles: parsed,
      date,
      location,
      zone: runType,
    });
    if (success) {
      setMiles("");
      setRunType("");
      setLocation("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }

  return (
    <div
      style={{
        marginTop: 18,
        marginBottom: 24,
        background: "#222",
        borderRadius: 12,
        boxShadow: "0 1px 4px #0002",
        padding: 16,
      }}
    >
      <h2 style={{ fontSize: 20, margin: "0 0 12px 0", textAlign: "center" }}>
        Add Miles - {shoe.brand} {shoe.name}
      </h2>
      <input
        type="number"
        placeholder="Miles run"
        value={miles}
        onChange={(e) => setMiles(e.target.value)}
        step="0.1"
        min="0"
        style={inputStyle}
      />
      <input
        type="text"
        value={runType}
        onChange={(e) => setRunType(e.target.value)}
        placeholder="Run Type"
        style={inputStyle}
      />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Where did you run?"
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
        <DatePicker value={date} onChange={setDate} dark={true} />
        <button onClick={handleAdd} style={{ flex: 0 }}>
          <span style={{ fontSize: 22, verticalAlign: "middle" }}>➕</span>
        </button>
      </div>
    </div>
  );
}
