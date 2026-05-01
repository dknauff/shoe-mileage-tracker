import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useAuth } from "./hooks/useAuth";
import { useShoes } from "./hooks/useShoes";
import EmailLogin from "./components/auth/EmailLogin";
import Header from "./components/layout/Header";
import ShoeList from "./components/shoes/ShoeList";
import AddShoeForm from "./components/shoes/AddShoeForm";
import AddRunForm from "./components/runs/AddRunForm";
import Modal from "./components/ui/Modal";

function App() {
  const { user, loading } = useAuth();
  const { shoes, loaded, error, clearError, addShoe, deleteShoe, addRun, editRun, deleteRun } = useShoes(user);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState(null);
  const [showAddShoeForm, setShowAddShoeForm] = useState(false);

  const [editingLog, setEditingLog] = useState({ shoeIndex: null, logIndex: null });
  const [editLogData, setEditLogData] = useState({ miles: "", date: "", location: "", runType: "" });

  const [alertModal, setAlertModal] = useState({ open: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, shoeIndex: null, logIndex: null });

  // Surface hook errors as alerts
  useEffect(() => {
    if (error) {
      setAlertModal({ open: true, message: error });
      clearError();
    }
  }, [error]);

  // Set initial form visibility once shoes have loaded
  useEffect(() => {
    if (loaded) setShowAddShoeForm(shoes.length === 0);
  }, [loaded]);

  if (loading) return null;
  if (!user) return <EmailLogin />;

  // --- Shoe handlers ---

  async function handleAddShoe(shoeData) {
    if (!shoeData.brand || !shoeData.name || !shoeData.color || !shoeData.firstRunDate || !shoeData.expectedLifecycle) {
      setAlertModal({ open: true, message: "Fill in all fields." });
      return;
    }
    const newIndex = shoes.length;
    const success = await addShoe({
      brand: shoeData.brand,
      name: shoeData.name,
      color: shoeData.color,
      firstRunDate: shoeData.firstRunDate,
      miles: 0,
      expectedLifecycle: parseFloat(shoeData.expectedLifecycle),
      logs: [],
    });
    if (success) {
      setSelectedIndex(newIndex);
      setShowAddShoeForm(false);
    }
  }

  function requestDeleteShoe(shoeIndex) {
    setConfirmModal({ open: true, type: "shoe", shoeIndex, logIndex: null });
  }

  // --- Run handlers ---

  async function handleAddRun(shoeIndex, runData) {
    const parsed = parseFloat(runData.miles);
    if (isNaN(parsed) || parsed <= 0) {
      setAlertModal({ open: true, message: "You can't run 0 or negative miles." });
      return false;
    }
    return addRun(shoeIndex, { ...runData, miles: parsed });
  }

  function startEditLog(shoeIndex, logIndex) {
    const log = shoes[shoeIndex].logs[logIndex];
    setEditingLog({ shoeIndex, logIndex });
    setEditLogData({ miles: log.miles.toString(), date: log.date, location: log.location || "", runType: log.zone || "" });
  }

  function cancelEditLog() {
    setEditingLog({ shoeIndex: null, logIndex: null });
    setEditLogData({ miles: "", date: "", location: "", runType: "" });
  }

  async function handleSaveEditLog() {
    const { shoeIndex, logIndex } = editingLog;
    const parsedMiles = parseFloat(editLogData.miles);
    if (isNaN(parsedMiles) || parsedMiles <= 0) {
      setAlertModal({ open: true, message: "Miles must be a positive number." });
      return;
    }
    const success = await editRun(shoeIndex, logIndex, {
      miles: parsedMiles,
      date: editLogData.date,
      location: editLogData.location,
      zone: editLogData.runType,
    });
    if (success) cancelEditLog();
  }

  function requestDeleteRun(shoeIndex, logIndex) {
    setConfirmModal({ open: true, type: "run", shoeIndex, logIndex });
  }

  // --- Confirm delete ---

  async function confirmDelete() {
    const { type, shoeIndex, logIndex } = confirmModal;
    setConfirmModal({ open: false, type: null, shoeIndex: null, logIndex: null });

    if (type === "run") {
      await deleteRun(shoeIndex, logIndex);
      if (editingLog.shoeIndex === shoeIndex && editingLog.logIndex === logIndex) {
        cancelEditLog();
      }
    } else if (type === "shoe") {
      await deleteShoe(shoeIndex);
      if (selectedIndex === shoeIndex) {
        setSelectedIndex(null);
        setExpandedHistoryIndex(null);
      } else if (selectedIndex > shoeIndex) {
        setSelectedIndex(selectedIndex - 1);
      }
    }
  }

  function cancelDelete() {
    setConfirmModal({ open: false, type: null, shoeIndex: null, logIndex: null });
  }

  // --- Render ---

  const selectedShoe = selectedIndex !== null ? shoes[selectedIndex] : null;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#222",
        color: "#fff",
        fontFamily: "'Oswald', system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <Header
        showAddButton={shoes.length > 0}
        addShoeOpen={showAddShoeForm}
        onToggleAddShoe={() => setShowAddShoeForm((v) => !v)}
        onSignOut={() => signOut(auth)}
      />

      <div style={{ padding: "16px 4vw 100px 4vw", boxSizing: "border-box", maxWidth: 600, margin: "0 auto" }}>
        {shoes.length === 0 ? (
          <AddShoeForm inline onAdd={handleAddShoe} />
        ) : (
          <>
            <ShoeList
              shoes={shoes}
              selectedIndex={selectedIndex}
              expandedHistoryIndex={expandedHistoryIndex}
              onSelectShoe={(index) => { setSelectedIndex(index); setExpandedHistoryIndex(null); }}
              onToggleHistory={(index) => setExpandedHistoryIndex(expandedHistoryIndex === index ? null : index)}
              onRequestDeleteShoe={requestDeleteShoe}
              editingLog={editingLog}
              editLogData={editLogData}
              onEditLogDataChange={setEditLogData}
              onStartEditLog={startEditLog}
              onSaveEditLog={handleSaveEditLog}
              onCancelEditLog={cancelEditLog}
              onRequestDeleteRun={requestDeleteRun}
            />

            {selectedShoe && (
              <AddRunForm
                shoe={selectedShoe}
                onAdd={(runData) => handleAddRun(selectedIndex, runData)}
              />
            )}

            <AddShoeForm
              open={showAddShoeForm}
              onClose={() => setShowAddShoeForm(false)}
              onAdd={handleAddShoe}
            />
          </>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "20px 0", color: "#666", fontSize: 14 }}>
        Version 1.4 - 7/19/25
      </div>

      {/* Confirm delete modal */}
      <Modal open={confirmModal.open} onClose={cancelDelete} zIndex={1000}>
        <div style={{ padding: 32, minWidth: 300 }}>
          <h3 style={{ marginTop: 0 }}>
            {confirmModal.type === "run" ? "Delete Run" : "Delete Shoe"}
          </h3>
          <p>
            {confirmModal.type === "run"
              ? "Are you sure you want to delete this run? This cannot be undone."
              : "Are you sure you want to delete this shoe and all its run history? This cannot be undone."}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={cancelDelete} style={{ padding: "6px 16px", background: "#888", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={confirmDelete} style={{ padding: "6px 16px", background: "#c0392b", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Alert modal */}
      <Modal open={alertModal.open} onClose={() => setAlertModal({ open: false, message: "" })} zIndex={2000}>
        <div style={{ padding: 28, minWidth: 260, maxWidth: 320, textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 18 }}>{alertModal.message}</div>
          <button
            onClick={() => setAlertModal({ open: false, message: "" })}
            style={{
              padding: "10px 32px",
              fontSize: 18,
              background: "#313a3e",
              color: "#b8f6e4",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
