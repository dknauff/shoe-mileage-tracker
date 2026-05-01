import { useState, useRef, useEffect } from "react";
import { formatDateMMDDYY } from "../../utils/formatting";

const CalendarIcon = ({ stroke }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="14" height="12" rx="2" stroke={stroke} strokeWidth="1.5" fill="none" />
    <rect x="7" y="9" width="2" height="2" rx="0.5" fill={stroke} />
    <rect x="11" y="9" width="2" height="2" rx="0.5" fill={stroke} />
    <rect x="7" y="13" width="2" height="2" rx="0.5" fill={stroke} />
    <rect x="11" y="13" width="2" height="2" rx="0.5" fill={stroke} />
    <rect x="1" y="3" width="18" height="2" rx="1" fill={stroke} fillOpacity="0.2" />
  </svg>
);

// dark=true: dark button (used in AddRunForm)
// dark=false: light button (used in AddShoeForm modal)
export default function DatePicker({ value, onChange, dark = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const btnStyle = dark
    ? { background: "#181818", color: "#fff", border: "1px solid #444" }
    : { background: "#f5f5f5", color: "#222", border: "1px solid #e0e0e0" };

  return (
    <button
      ref={ref}
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 16px",
        fontSize: 16,
        cursor: "pointer",
        position: "relative",
        borderRadius: 8,
        ...btnStyle,
      }}
      onClick={() => setOpen((v) => !v)}
    >
      <span style={{ display: "inline-flex", alignItems: "center" }} aria-label="calendar">
        <CalendarIcon stroke={dark ? "#fff" : "#222"} />
      </span>
      {!open && formatDateMMDDYY(value)}
      {open && (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "110%",
            zIndex: 10,
            background: "#222",
            padding: 8,
            borderRadius: 8,
            boxShadow: "0 2px 8px #0008",
          }}
        >
          <input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(false);
            }}
            style={{
              background: "#181818",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: 6,
              fontSize: 16,
              padding: 6,
            }}
            autoFocus
          />
        </span>
      )}
    </button>
  );
}
