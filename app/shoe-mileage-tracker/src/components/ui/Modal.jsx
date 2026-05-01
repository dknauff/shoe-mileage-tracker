export default function Modal({ open, onClose, children, zIndex = 1000 }) {
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
        zIndex,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#222",
          color: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 16px #0008",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
