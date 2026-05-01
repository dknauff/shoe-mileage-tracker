import { formatDateMMDDYY } from "../../utils/formatting";

const inputStyle = {
  flex: 1,
  padding: "8px 10px",
  fontSize: 14,
  borderRadius: 8,
  border: "1px solid #444",
  background: "#fff",
  color: "#000",
  height: 36,
  boxSizing: "border-box",
  fontFamily: "'Oswald', system-ui, sans-serif",
};

const labelStyle = {
  minWidth: "60px",
  fontSize: 14,
  color: "#fff",
  fontWeight: 600,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function RunRow({
  shoeIndex,
  logIndex,
  log,
  isEditing,
  editLogData,
  onEditLogDataChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRequestDelete,
}) {
  if (isEditing) {
    return (
      <>
        <tr>
          <td colSpan={4} style={{ padding: "8px 0" }}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
              onMouseDown={(e) => e.stopPropagation()}
              onSelect={(e) => e.stopPropagation()}
            >
              {[
                { label: "Date:", field: "date", type: "date" },
                { label: "Miles:", field: "miles", type: "number" },
                { label: "Run Type:", field: "runType", type: "text" },
                { label: "Location:", field: "location", type: "text" },
              ].map(({ label, field, type }) => (
                <div key={field} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    value={editLogData[field]}
                    onChange={(e) => onEditLogDataChange({ ...editLogData, [field]: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onSelect={(e) => e.stopPropagation()}
                    min={type === "number" ? "0" : undefined}
                    step={type === "number" ? "0.01" : undefined}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={5} style={{ textAlign: "center", padding: "4px 0 0 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onSaveEdit(); }}
                  style={{
                    padding: "8px 20px",
                    background: "#1abc9c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    letterSpacing: 1,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}
                  style={{
                    padding: "8px 20px",
                    background: "#313a3e",
                    color: "#b8f6e4",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    letterSpacing: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRequestDelete(shoeIndex, logIndex); }}
                style={{
                  color: "#fff",
                  background: "#c0392b",
                  border: "none",
                  borderRadius: "50%",
                  padding: 4,
                  cursor: "pointer",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
                title="Delete run"
              >
                ×
              </button>
            </div>
          </td>
        </tr>
      </>
    );
  }

  return (
    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <td style={{ padding: "8px", textAlign: "left" }}>{formatDateMMDDYY(log.date)}</td>
      <td style={{ padding: "8px", textAlign: "center" }}>{log.miles.toFixed(2)}</td>
      <td style={{ padding: "8px", textAlign: "center" }}>{log.zone || "-"}</td>
      <td style={{ padding: "8px" }}>{log.location || "-"}</td>
      <td style={{ padding: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onStartEdit(shoeIndex, logIndex); }}
          style={{
            padding: "6px 16px",
            background: "#f5f5f5",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          Edit
        </button>
      </td>
    </tr>
  );
}
