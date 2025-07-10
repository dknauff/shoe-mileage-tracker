import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

function App() {
  // array of shoe objects
  const [shoes, setShoes] = useState([]);
  const [selectedIndex, setSelectIndex] = useState(null);
  const [expandedHistoryIndex, setExpandedHistoryIndex] = useState(null);

  // state variables to hold inputs for new shoe form
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [firstRunDate, setFirstRunDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [expectedLifecycle, setExpectedLifecycle] = useState("");

  // state for logging runs
  const [milesInput, setMilesInput] = useState("");
  const [runDate, setRunDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [runLocation, setRunLocation] = useState("");
  const [showAddShoeForm, setShowAddShoeForm] = useState(true);

  // Add state for custom alert modal
  const [alertModal, setAlertModal] = useState({ open: false, message: "" });

  function showAlert(message) {
    setAlertModal({ open: true, message });
  }
  function closeAlert() {
    setAlertModal({ open: false, message: "" });
  }

  const shoesCollection = collection(db, "shoes");

  // Fetch shoes from Firestore on mount
  useEffect(() => {
    async function fetchShoes() {
      try {
        const snapshot = await getDocs(shoesCollection);
        const shoesData = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setShoes(shoesData);
        // Close add shoe form if there are shoes in the database
        if (shoesData.length > 0) {
          setShowAddShoeForm(false);
        } else {
          setShowAddShoeForm(true);
        }
      } catch (err) {
        console.error("Error fetching shoes:", err);
        showAlert(
          "Failed to fetch shoes from Firestore. See console for details."
        );
      }
    }
    fetchShoes();
  }, []);

  // Add a shoe
  async function addShoe() {
    if (!brand || !name || !color || !firstRunDate || !expectedLifecycle) {
      showAlert("Fill in all fields.");
      return;
    }
    const newShoe = {
      brand,
      name,
      color,
      firstRunDate,
      miles: 0,
      expectedLifecycle: parseFloat(expectedLifecycle),
      logs: [],
    };
    try {
      const docRef = await addDoc(shoesCollection, newShoe);
      setShoes([...shoes, { ...newShoe, id: docRef.id }]);
      setBrand("");
      setName("");
      setColor("");
      setFirstRunDate(() => new Date().toISOString().split("T")[0]);
      setExpectedLifecycle("");
      setSelectIndex(shoes.length);
      setShowAddShoeForm(false);
    } catch (err) {
      console.error("Error adding shoe:", err);
      showAlert("Failed to add shoe. See console for details.");
    }
  }

  // Update a shoe in Firestore
  async function updateShoeInFirestore(shoe, shoeIndex, updatedFields) {
    const shoeId = shoe.id;
    if (!shoeId) return;
    const shoeDoc = doc(db, "shoes", shoeId);
    try {
      await updateDoc(shoeDoc, updatedFields);
      // Update local state
      setShoes((prev) =>
        prev.map((s, idx) =>
          idx === shoeIndex ? { ...s, ...updatedFields } : s
        )
      );
    } catch (err) {
      console.error("Error updating shoe:", err);
      showAlert("Failed to update shoe. See console for details.");
    }
  }

  // mileage handler
  async function addMiles() {
    // strict equality operator (checks for equal to null and if type is null)
    if (selectedIndex === null) {
      showAlert("Select a shoe first.");
      return;
    }

    const parsed = parseFloat(milesInput);
    if (isNaN(parsed) || parsed <= 0) {
      showAlert("You can't run 0 or negative miles.");
      return;
    }

    const shoe = shoes[selectedIndex];
    const updatedLogs = shoe.logs ? [...shoe.logs] : [];
    updatedLogs.push({
      miles: parsed,
      date: runDate,
      location: runLocation,
    });
    const updatedShoe = {
      ...shoe,
      miles: shoe.miles + parsed,
      logs: updatedLogs,
    };
    try {
      await updateShoeInFirestore(shoe, selectedIndex, {
        miles: updatedShoe.miles,
        logs: updatedLogs,
      });
      setMilesInput("");
      setRunDate(new Date().toISOString().split("T")[0]); // Reset to today
      setRunLocation("");
    } catch (err) {
      console.error("Error adding miles:", err);
      showAlert("Failed to add miles. See console for details.");
    }
  }

  const selectedShoes = selectedIndex !== null ? shoes[selectedIndex] : null;

  const [editingLog, setEditingLog] = useState({
    shoeIndex: null,
    logIndex: null,
  });
  const [editLogData, setEditLogData] = useState({
    miles: "",
    date: "",
    location: "",
  });

  // Handler to start editing a log
  function startEditLog(shoeIndex, logIndex) {
    const log = shoes[shoeIndex].logs[logIndex];
    setEditingLog({ shoeIndex, logIndex });
    setEditLogData({
      miles: log.miles.toString(),
      date: log.date,
      location: log.location || "",
    });
  }

  // Handler to cancel editing
  function cancelEditLog() {
    setEditingLog({ shoeIndex: null, logIndex: null });
    setEditLogData({ miles: "", date: "", location: "" });
  }

  // Handler to save edited log
  async function saveEditLog() {
    const { shoeIndex, logIndex } = editingLog;
    const parsedMiles = parseFloat(editLogData.miles);
    if (isNaN(parsedMiles) || parsedMiles <= 0) {
      showAlert("Miles must be a positive number.");
      return;
    }
    const shoe = shoes[shoeIndex];
    const oldMiles = shoe.logs[logIndex].miles;
    const updatedLogs = shoe.logs.map((log, lIdx) =>
      lIdx === logIndex
        ? {
            ...log,
            miles: parsedMiles,
            date: editLogData.date,
            location: editLogData.location,
          }
        : log
    );
    const updatedShoe = {
      ...shoe,
      miles: shoe.miles - oldMiles + parsedMiles,
      logs: updatedLogs,
    };
    try {
      await updateShoeInFirestore(shoe, shoeIndex, {
        miles: updatedShoe.miles,
        logs: updatedLogs,
      });
      cancelEditLog();
    } catch (err) {
      console.error("Error editing run:", err);
      showAlert("Failed to edit run. See console for details.");
    }
  }

  // Handler to delete a log
  async function deleteLog(shoeIndex, logIndex) {
    if (!window.confirm("Are you sure you want to delete this run?")) return;
    const shoe = shoes[shoeIndex];
    const removedMiles = shoe.logs[logIndex].miles;
    const updatedLogs = shoe.logs.filter((_, lIdx) => lIdx !== logIndex);
    const updatedShoe = {
      ...shoe,
      miles: shoe.miles - removedMiles,
      logs: updatedLogs,
    };
    await updateShoeInFirestore(shoe, shoeIndex, {
      miles: updatedShoe.miles,
      logs: updatedLogs,
    });
    // If editing this log, cancel edit
    if (
      editingLog.shoeIndex === shoeIndex &&
      editingLog.logIndex === logIndex
    ) {
      cancelEditLog();
    }
  }

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: null, // 'run' or 'shoe'
    shoeIndex: null,
    logIndex: null, // only for run
  });

  // Handler to open modal for deleting a run
  function requestDeleteRun(shoeIndex, logIndex) {
    setConfirmModal({ open: true, type: "run", shoeIndex, logIndex });
  }
  // Handler to open modal for deleting a shoe
  function requestDeleteShoe(shoeIndex) {
    setConfirmModal({ open: true, type: "shoe", shoeIndex, logIndex: null });
  }
  // Handler to actually delete after confirmation
  async function confirmDelete() {
    try {
      if (confirmModal.type === "run") {
        const { shoeIndex, logIndex } = confirmModal;
        const shoe = shoes[shoeIndex];
        const removedMiles = shoe.logs[logIndex].miles;
        const updatedLogs = shoe.logs.filter((_, lIdx) => lIdx !== logIndex);
        const updatedShoe = {
          ...shoe,
          miles: shoe.miles - removedMiles,
          logs: updatedLogs,
        };
        await updateShoeInFirestore(shoe, shoeIndex, {
          miles: updatedShoe.miles,
          logs: updatedLogs,
        });
        if (
          editingLog.shoeIndex === shoeIndex &&
          editingLog.logIndex === logIndex
        ) {
          cancelEditLog();
        }
      } else if (confirmModal.type === "shoe") {
        const { shoeIndex } = confirmModal;
        const shoe = shoes[shoeIndex];
        if (shoe.id) {
          await deleteDoc(doc(db, "shoes", shoe.id));
        }
        const updatedShoes = shoes.filter((_, idx) => idx !== shoeIndex);
        setShoes(updatedShoes);
        // If the deleted shoe was selected, clear selection
        if (selectedIndex === shoeIndex) {
          setSelectIndex(null);
          setExpandedHistoryIndex(null);
        } else if (selectedIndex > shoeIndex) {
          setSelectIndex(selectedIndex - 1);
        }
      }
      setConfirmModal({
        open: false,
        type: null,
        shoeIndex: null,
        logIndex: null,
      });
    } catch (err) {
      console.error("Error deleting:", err);
      showAlert("Failed to delete. See console for details.");
      setConfirmModal({
        open: false,
        type: null,
        shoeIndex: null,
        logIndex: null,
      });
    }
  }
  function cancelDelete() {
    setConfirmModal({
      open: false,
      type: null,
      shoeIndex: null,
      logIndex: null,
    });
  }

  return (
    <>
      <div
        style={{
          padding: 0,
          width: "100vw",
          minHeight: "100vh",
          background: "#222",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            background: "#222",
            zIndex: 10,
            padding: "16px 0 8px 0",
            textAlign: "center",
            borderBottom: "1px solid #333",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 1 }}>
            Shoe Mileage Tracker
          </h1>
        </div>

        <div
          style={{
            padding: "16px 4vw 100px 4vw",
            boxSizing: "border-box",
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          {/* Add Shoe Form - Shows at top when no shoes, bottom when shoes exist */}
          {shoes.length === 0 ? (
            <>
              <h2 style={{ fontSize: 22, marginBottom: 12 }}>
                Add Your First Shoe
              </h2>
              {/* Beautified Add Shoe Form */}
              <div
                style={{
                  background: "#222",
                  borderRadius: 12,
                  boxShadow: "0 1px 4px #0002",
                  padding: 16,
                  marginTop: 8,
                  marginBottom: 24,
                }}
              >
                <input
                  placeholder="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={{
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
                  }}
                />
                <input
                  placeholder="Shoe Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
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
                  }}
                />
                <input
                  placeholder="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
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
                  }}
                />
                <input
                  type="date"
                  placeholder="First Run Date"
                  value={firstRunDate}
                  onChange={(e) => setFirstRunDate(e.target.value)}
                  style={{
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
                  }}
                />
                <input
                  type="number"
                  placeholder="Expected Lifecycle (MI)"
                  value={expectedLifecycle}
                  onChange={(e) => setExpectedLifecycle(e.target.value)}
                  min="0"
                  step="0.1"
                  style={{
                    width: "100%",
                    display: "block",
                    marginBottom: 16,
                    padding: 12,
                    fontSize: 18,
                    borderRadius: 8,
                    border: "1px solid #444",
                    background: "#181818",
                    color: "#fff",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={addShoe}
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
                    marginBottom: 0,
                    boxShadow: "0 2px 8px #1abc9c33",
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  >
                    ➕
                  </span>{" "}
                  Add Shoe
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Lists all shoes */}
              <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                {shoes.map((shoe, index) => (
                  <li
                    key={index}
                    onClick={() => setSelectIndex(index)}
                    style={{
                      marginBottom: 14,
                      borderRadius: 12,
                      background:
                        selectedIndex === index ? "#145A32" : "#292929",
                      boxShadow:
                        selectedIndex === index
                          ? "0 2px 8px #145A3240"
                          : "0 1px 4px #0002",
                      padding: 16,
                      cursor: "pointer",
                      position: "relative",
                      border:
                        selectedIndex === index
                          ? "2px solid #1abc9c"
                          : "1px solid #333",
                      transition: "background 0.2s, border 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 17 }}>
                        <strong style={{ fontSize: 18 }}>
                          {shoe.brand} {shoe.name}
                        </strong>{" "}
                        <span style={{ color: "#aaa", fontSize: 15 }}>
                          - {shoe.color}
                        </span>{" "}
                        <br />
                        <span style={{ fontSize: 14 }}>
                          First Run: {shoe.firstRunDate} <br />
                          <span style={{ color: "#1abc9c" }}>
                            {shoe.miles.toFixed(2)} / {shoe.expectedLifecycle}{" "}
                            mi
                          </span>
                          <br />
                          <span style={{ color: "#f1c40f" }}>
                            Life Remaining:{" "}
                            {Math.max(
                              0,
                              100 - (shoe.miles / shoe.expectedLifecycle) * 100
                            ).toFixed(1)}
                            %
                          </span>
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedHistoryIndex(
                              expandedHistoryIndex === index ? null : index
                            );
                          }}
                          style={{
                            padding: 8,
                            background: "none",
                            border: "none",
                            borderRadius: "50%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title={
                            expandedHistoryIndex === index
                              ? "Hide History"
                              : "Show History"
                          }
                        >
                          {/* Eye icon for show/hide history */}
                          {expandedHistoryIndex === index ? (
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1abc9c"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.27-3.11-11-8 1.21-3.06 3.6-5.5 6.58-6.71" />
                              <path d="M1 1l22 22" />
                              <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5 0-.61-.16-1.18-.44-1.67" />
                            </svg>
                          ) : (
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#1abc9c"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <ellipse cx="12" cy="12" rx="10" ry="6" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requestDeleteShoe(index);
                          }}
                          style={{
                            color: "#fff",
                            background: "#c0392b",
                            border: "none",
                            borderRadius: "50%",
                            padding: 8,
                            cursor: "pointer",
                            fontSize: "1.2em",
                            lineHeight: 1,
                            width: 36,
                            height: 36,
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

                    {/* History Table */}
                    {expandedHistoryIndex === index && shoe.logs && (
                      <div
                        style={{
                          marginTop: "10px",
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          borderRadius: "8px",
                          padding: "10px 4px 4px 4px",
                          overflowX: "auto",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 15,
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.2)",
                              }}
                            >
                              <th style={{ textAlign: "left", padding: "8px" }}>
                                Date
                              </th>
                              <th style={{ textAlign: "left", padding: "8px" }}>
                                Miles
                              </th>
                              <th style={{ textAlign: "left", padding: "8px" }}>
                                Location
                              </th>
                              <th
                                style={{ textAlign: "left", padding: "8px" }}
                              ></th>
                            </tr>
                          </thead>
                          <tbody>
                            {shoe.logs.map((log, logIndex) =>
                              editingLog.shoeIndex === index &&
                              editingLog.logIndex === logIndex ? (
                                <>
                                  <tr key={logIndex + "-edit"}>
                                    <td style={{ padding: "8px" }}>
                                      <input
                                        type="date"
                                        value={editLogData.date}
                                        onChange={(e) =>
                                          setEditLogData({
                                            ...editLogData,
                                            date: e.target.value,
                                          })
                                        }
                                        style={{ width: "100%" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px" }}>
                                      <input
                                        type="number"
                                        value={editLogData.miles}
                                        onChange={(e) =>
                                          setEditLogData({
                                            ...editLogData,
                                            miles: e.target.value,
                                          })
                                        }
                                        min="0"
                                        step="0.01"
                                        style={{ width: "80px" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px" }}>
                                      <input
                                        type="text"
                                        value={editLogData.location}
                                        onChange={(e) =>
                                          setEditLogData({
                                            ...editLogData,
                                            location: e.target.value,
                                          })
                                        }
                                        style={{ width: "100%" }}
                                      />
                                    </td>
                                    <td style={{ padding: "8px" }}></td>
                                  </tr>
                                  <tr key={logIndex + "-edit-actions"}>
                                    <td
                                      colSpan={4}
                                      style={{
                                        textAlign: "center",
                                        padding: "8px 0",
                                      }}
                                    >
                                      <button
                                        onClick={saveEditLog}
                                        style={{
                                          marginRight: 8,
                                          padding: "6px 16px",
                                        }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={cancelEditLog}
                                        style={{ padding: "6px 16px" }}
                                      >
                                        Cancel
                                      </button>
                                    </td>
                                  </tr>
                                </>
                              ) : (
                                <tr
                                  key={logIndex}
                                  style={{
                                    borderBottom:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                    "&:last-child": { borderBottom: "none" },
                                  }}
                                >
                                  <td style={{ padding: "8px" }}>{log.date}</td>
                                  <td style={{ padding: "8px" }}>
                                    {log.miles.toFixed(2)}
                                  </td>
                                  <td style={{ padding: "8px" }}>
                                    {log.location || "-"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "8px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        startEditLog(index, logIndex)
                                      }
                                      style={{ marginRight: 4 }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        requestDeleteRun(index, logIndex)
                                      }
                                      style={{
                                        color: "#fff",
                                        background: "#c0392b",
                                        border: "none",
                                        borderRadius: 3,
                                        padding: "2px 8px",
                                        cursor: "pointer",
                                      }}
                                      title="Delete run"
                                    >
                                      ×
                                    </button>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {/* Add miles for selected shoe */}
              {selectedShoes && (
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
                  <h2
                    style={{
                      fontSize: 20,
                      margin: "0 0 12px 0",
                      textAlign: "center",
                    }}
                  >
                    Add miles for {selectedShoes.brand} {selectedShoes.name}
                  </h2>
                  <input
                    type="number"
                    placeholder="Miles run"
                    value={milesInput}
                    onChange={(e) => setMilesInput(e.target.value)}
                    step="0.1"
                    min="0"
                    style={{
                      width: "100%",
                      display: "block",
                      padding: 12,
                      marginBottom: 12,
                      fontSize: 18,
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: "#181818",
                      color: "#fff",
                    }}
                  />
                  <input
                    type="date"
                    value={runDate}
                    style={{
                      width: "100%",
                      display: "block",
                      padding: 12,
                      marginBottom: 12,
                      fontSize: 18,
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: "#181818",
                      color: "#fff",
                    }}
                    onChange={(e) => setRunDate(e.target.value)}
                  />
                  <input
                    type="text"
                    value={runLocation}
                    onChange={(e) => setRunLocation(e.target.value)}
                    placeholder="Where did you run?"
                    style={{
                      width: "100%",
                      display: "block",
                      padding: 12,
                      marginBottom: 12,
                      fontSize: 18,
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: "#181818",
                      color: "#fff",
                    }}
                  />
                  <button
                    onClick={addMiles}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      fontSize: 20,
                      background: "#313a3e", // Muted dark blue-gray
                      color: "#b8f6e4", // Muted teal accent
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      marginTop: 8,
                      marginBottom: 0,
                      boxShadow: "0 2px 8px #2228",
                      letterSpacing: 1,
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    >
                      ➕
                    </span>{" "}
                    Add Miles
                  </button>
                </div>
              )}

              {/* Add Shoe Form - Only shown when shoes exist */}
              {showAddShoeForm && (
                <div
                  style={{
                    background: "#222",
                    borderRadius: 12,
                    boxShadow: "0 1px 4px #0002",
                    padding: 16,
                    marginTop: 18,
                    marginBottom: 80,
                    position: "relative",
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowAddShoeForm(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "none",
                      border: "none",
                      color: "#aaa",
                      fontSize: 26,
                      cursor: "pointer",
                      borderRadius: "50%",
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                    title="Close"
                    aria-label="Close add shoe form"
                  >
                    ×
                  </button>
                  <h2
                    style={{
                      fontSize: 20,
                      margin: "0 0 12px 0",
                      textAlign: "center",
                    }}
                  >
                    Add New Shoe
                  </h2>
                  <input
                    placeholder="Brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    style={{
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
                    }}
                  />
                  <input
                    placeholder="Shoe Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
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
                    }}
                  />
                  <input
                    placeholder="Color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
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
                    }}
                  />
                  <input
                    type="date"
                    placeholder="First Run Date"
                    value={firstRunDate}
                    onChange={(e) => setFirstRunDate(e.target.value)}
                    style={{
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
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Expected Lifecycle (MI)"
                    value={expectedLifecycle}
                    onChange={(e) => setExpectedLifecycle(e.target.value)}
                    min="0"
                    step="0.1"
                    style={{
                      width: "100%",
                      display: "block",
                      marginBottom: 16,
                      padding: 12,
                      fontSize: 18,
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: "#181818",
                      color: "#fff",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={addShoe}
                    style={{
                      width: "100%",
                      padding: "14px 0",
                      fontSize: 20,
                      background: "#313a3e", // Muted dark blue-gray
                      color: "#b8f6e4", // Muted teal accent
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      marginTop: 8,
                      marginBottom: 0,
                      boxShadow: "0 2px 8px #2228",
                      letterSpacing: 1,
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        marginRight: 8,
                        verticalAlign: "middle",
                      }}
                    >
                      ➕
                    </span>{" "}
                    Add Shoe
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Add Shoe Button */}
        {shoes.length > 0 && !showAddShoeForm && (
          <button
            onClick={() => setShowAddShoeForm(true)}
            style={{
              position: "fixed",
              right: 18,
              bottom: 18,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#313a3e", // Muted dark blue-gray
              color: "#b8f6e4", // Muted teal accent
              fontSize: 28,
              border: "none",
              boxShadow: "0 2px 8px #2228",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            title="Add New Shoe"
            aria-label="Add New Shoe"
          >
            <span
              style={{
                display: "block",
                width: 28,
                height: 28,
                lineHeight: "28px",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              +
            </span>
          </button>
        )}

        {/* Confirmation Modal */}
        {confirmModal.open && (
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
              zIndex: 1000,
            }}
            onClick={cancelDelete}
          >
            <div
              style={{
                background: "#222",
                color: "#fff",
                padding: 32,
                borderRadius: 8,
                minWidth: 300,
                boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0 }}>
                {confirmModal.type === "run" ? "Delete Run" : "Delete Shoe"}
              </h3>
              <p>
                {confirmModal.type === "run"
                  ? "Are you sure you want to delete this run? This cannot be undone."
                  : "Are you sure you want to delete this shoe and all its run history? This cannot be undone."}
              </p>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: "6px 16px",
                    background: "#888",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: "6px 16px",
                    background: "#c0392b",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Alert Modal */}
        {alertModal.open && (
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
            onClick={closeAlert}
          >
            <div
              style={{
                background: "#23272a",
                color: "#fff",
                padding: 28,
                borderRadius: 10,
                minWidth: 260,
                maxWidth: 320,
                boxShadow: "0 2px 16px #0008",
                position: "relative",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 18, marginBottom: 18 }}>
                {alertModal.message}
              </div>
              <button
                onClick={closeAlert}
                style={{
                  padding: "10px 32px",
                  fontSize: 18,
                  background: "#313a3e",
                  color: "#b8f6e4",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  boxShadow: "0 1px 4px #2228",
                  letterSpacing: 1,
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
