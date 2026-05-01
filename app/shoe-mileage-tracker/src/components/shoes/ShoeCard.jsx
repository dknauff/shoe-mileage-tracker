import { formatDateMMDDYY } from "../../utils/formatting";
import { getShoeColorTheme, getLifeRemainingColor } from "../../utils/shoeColors";
import RunHistory from "../runs/RunHistory";

const EyeOpen = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="12" rx="10" ry="6" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1abc9c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.27-3.11-11-8 1.21-3.06 3.6-5.5 6.58-6.71" />
    <path d="M1 1l22 22" />
    <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5 0-.61-.16-1.18-.44-1.67" />
  </svg>
);

export default function ShoeCard({
  shoe,
  index,
  isSelected,
  historyExpanded,
  onSelect,
  onToggleHistory,
  onRequestDelete,
  editingLog,
  editLogData,
  onEditLogDataChange,
  onStartEditLog,
  onSaveEditLog,
  onCancelEditLog,
  onRequestDeleteRun,
}) {
  const theme = getShoeColorTheme(shoe.color);
  const lifeRemaining = Math.max(0, 100 - (shoe.miles / shoe.expectedLifecycle) * 100);

  return (
    <li
      onClick={() => onSelect(index)}
      style={{
        marginBottom: 14,
        borderRadius: 12,
        background: isSelected ? theme.bg : "#292929",
        boxShadow: isSelected
          ? `0 4px 12px ${theme.shadow}, 0 0 0 1px ${theme.border}`
          : "0 1px 4px #0002",
        padding: 16,
        cursor: "pointer",
        position: "relative",
        border: isSelected ? `2px solid ${theme.border}` : "1px solid #333",
        transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 17 }}>
          <strong style={{ fontSize: 18 }}>{shoe.brand} {shoe.name}</strong>
          <br />
          <span style={{ fontSize: 14 }}>
            First Run: {formatDateMMDDYY(shoe.firstRunDate)}
            <br />
            <span style={{ color: "#fff" }}>
              {shoe.miles.toFixed(2)} / {shoe.expectedLifecycle} Miles
            </span>
            <br />
            <span style={{ color: getLifeRemainingColor(lifeRemaining) }}>
              Life Remaining: {lifeRemaining.toFixed(1)}%
            </span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleHistory(index); }}
            style={{ padding: 8, background: "none", border: "none", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            title={historyExpanded ? "Hide History" : "Show History"}
          >
            {historyExpanded ? <EyeClosed /> : <EyeOpen />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRequestDelete(index); }}
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
            }}
            title="Delete shoe"
          >
            ×
          </button>
        </div>
      </div>

      {historyExpanded && (
        <RunHistory
          shoeIndex={index}
          shoe={shoe}
          editingLog={editingLog}
          editLogData={editLogData}
          onEditLogDataChange={onEditLogDataChange}
          onStartEditLog={onStartEditLog}
          onSaveEditLog={onSaveEditLog}
          onCancelEditLog={onCancelEditLog}
          onRequestDeleteRun={onRequestDeleteRun}
        />
      )}
    </li>
  );
}
