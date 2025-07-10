import { useState } from "react";

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

  // Add a shoe
  function addShoe() {
    if (!brand || !name || !color || !firstRunDate || !expectedLifecycle) {
      alert("Fill in all fields.");
      return;
    }
    const newShoe = {
      brand,
      name,
      color,
      firstRunDate,
      miles: 0,
      expectedLifecycle: parseFloat(expectedLifecycle),
    };
    setShoes([...shoes, newShoe]);
    setBrand("");
    setName("");
    setColor("");
    setFirstRunDate(() => new Date().toISOString().split("T")[0]);
    setExpectedLifecycle("");
    setSelectIndex(shoes.length);
    setShowAddShoeForm(false);
  }

  // mileage handler
  function addMiles() {
    // strict equality operator (checks for equal to null and if type is null)
    if (selectedIndex === null) {
      alert("Select a shoe first.");
      return;
    }

    const parsed = parseFloat(milesInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert("You can't run negative miles.");
      return;
    }

    const updatedShoes = shoes.map((shoe, index) => {
      if (index === selectedIndex) {
        const updatedLogs = shoe.logs ? [...shoe.logs] : [];
        updatedLogs.push({
          miles: parsed,
          date: runDate,
          location: runLocation,
        });

        return {
          ...shoe,
          miles: shoe.miles + parsed,
          logs: updatedLogs,
        };
      }
      return shoe;
    });

    setShoes(updatedShoes);
    setMilesInput("");
    setRunDate(new Date().toISOString().split("T")[0]); // Reset to today
    setRunLocation("");
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
  function saveEditLog() {
    const { shoeIndex, logIndex } = editingLog;
    const parsedMiles = parseFloat(editLogData.miles);
    if (isNaN(parsedMiles) || parsedMiles <= 0) {
      alert("Miles must be a positive number.");
      return;
    }
    const updatedShoes = shoes.map((shoe, sIdx) => {
      if (sIdx === shoeIndex) {
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
        return {
          ...shoe,
          miles: shoe.miles - oldMiles + parsedMiles,
          logs: updatedLogs,
        };
      }
      return shoe;
    });
    setShoes(updatedShoes);
    cancelEditLog();
  }

  // Handler to delete a log
  function deleteLog(shoeIndex, logIndex) {
    if (!window.confirm("Are you sure you want to delete this run?")) return;
    const updatedShoes = shoes.map((shoe, sIdx) => {
      if (sIdx === shoeIndex) {
        const removedMiles = shoe.logs[logIndex].miles;
        const updatedLogs = shoe.logs.filter((_, lIdx) => lIdx !== logIndex);
        return {
          ...shoe,
          miles: shoe.miles - removedMiles,
          logs: updatedLogs,
        };
      }
      return shoe;
    });
    setShoes(updatedShoes);
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
  function confirmDelete() {
    if (confirmModal.type === "run") {
      const { shoeIndex, logIndex } = confirmModal;
      const updatedShoes = shoes.map((shoe, sIdx) => {
        if (sIdx === shoeIndex) {
          const removedMiles = shoe.logs[logIndex].miles;
          const updatedLogs = shoe.logs.filter((_, lIdx) => lIdx !== logIndex);
          return {
            ...shoe,
            miles: shoe.miles - removedMiles,
            logs: updatedLogs,
          };
        }
        return shoe;
      });
      setShoes(updatedShoes);
      if (
        editingLog.shoeIndex === shoeIndex &&
        editingLog.logIndex === logIndex
      ) {
        cancelEditLog();
      }
    } else if (confirmModal.type === "shoe") {
      const { shoeIndex } = confirmModal;
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
      <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
        <h1 style={{ textAlign: "center" }}>Shoe Mileage Tracker</h1>

        {/* Add Shoe Form - Shows at top when no shoes, bottom when shoes exist */}
        {shoes.length === 0 ? (
          <>
            <h2>Add Your First Shoe</h2>
            <input
              placeholder="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={{ width: "100%", marginBottom: 6, padding: 6 }}
            />
            <input
              placeholder="Shoe Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginBottom: 6, padding: 6 }}
            />
            <input
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: "100%", marginBottom: 6, padding: 6 }}
            />
            <input
              type="date"
              placeholder="First Run Date"
              value={firstRunDate}
              onChange={(e) => setFirstRunDate(e.target.value)}
              style={{ width: "100%", marginBottom: 12, padding: 6 }}
            />
            <input
              type="number"
              placeholder="Expected Lifecycle (miles)"
              value={expectedLifecycle}
              onChange={(e) => setExpectedLifecycle(e.target.value)}
              min="0"
              step="0.1"
              style={{ width: "100%", marginBottom: 12, padding: 6 }}
            />
            <button
              onClick={addShoe}
              style={{ padding: "8px 12px", marginBottom: 20 }}
            >
              Add Shoe
            </button>
          </>
        ) : (
          <>
            {/* Lists all shoes */}
            <ul style={{ paddingLeft: 0, listStyle: "none" }}>
              {shoes.map((shoe, index) => (
                <li
                  key={index}
                  onClick={() => setSelectIndex(index)}
                  style={{
                    padding: 10,
                    marginBottom: 6,
                    cursor: "pointer",
                    backgroundColor:
                      selectedIndex === index ? "#145A32" : "#3A3B3C",
                    borderRadius: 6,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>
                        {shoe.brand} {shoe.name}
                      </strong>{" "}
                      - {shoe.color} <br />
                      First Run: {shoe.firstRunDate} <br />
                      Total Mileage: {shoe.miles.toFixed(2)} /{" "}
                      {shoe.expectedLifecycle} miles <br />
                      Life Remaining:{" "}
                      {Math.max(
                        0,
                        100 - (shoe.miles / shoe.expectedLifecycle) * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedHistoryIndex(
                            expandedHistoryIndex === index ? null : index
                          );
                        }}
                        style={{
                          padding: "4px 8px",
                          fontSize: "0.9em",
                          backgroundColor: "transparent",
                          border: "1px solid #fff",
                          color: "#fff",
                          cursor: "pointer",
                          borderRadius: "4px",
                        }}
                      >
                        {expandedHistoryIndex === index
                          ? "Hide History"
                          : "Show History"}
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
                          borderRadius: 3,
                          padding: "2px 8px",
                          cursor: "pointer",
                          fontSize: "1.2em",
                          lineHeight: 1,
                        }}
                        title="Delete shoe"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  {expandedHistoryIndex === index && shoe.logs && (
                    <div
                      style={{
                        marginTop: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px",
                        padding: "10px",
                      }}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
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
              <>
                <h2>
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
                    width: "80px",
                    display: "block",
                    padding: 8,
                    marginBottom: 10,
                  }}
                />
                <input
                  type="date"
                  value={runDate}
                  style={{ display: "block", padding: 8, marginBottom: 10 }}
                  onChange={(e) => setRunDate(e.target.value)}
                />
                <input
                  type="text"
                  value={runLocation}
                  onChange={(e) => setRunLocation(e.target.value)}
                  placeholder="Where did you run?"
                  style={{ display: "block", padding: 8, marginBottom: 10 }}
                />
                <button
                  onClick={addMiles}
                  style={{
                    padding: "8px 12px",
                    outline: "none",
                    boarder: "none",
                  }}
                >
                  Add Miles
                </button>
              </>
            )}

            {/* Add Shoe Form - Only shown when shoes exist */}
            <button
              onClick={() => setShowAddShoeForm((prev) => !prev)}
              style={{
                marginBottom: 10,
                padding: "6px 10px",
                outline: "none",
                boarder: "none",
              }}
            >
              {showAddShoeForm ? "Close" : "Add New Shoe"}
            </button>

            {showAddShoeForm && (
              <>
                <h2>Add New Shoe</h2>
                <input
                  placeholder="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  style={{
                    width: "40%",
                    display: "block",
                    marginBottom: 6,
                    padding: 6,
                  }}
                />
                <input
                  placeholder="Shoe Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "40%",
                    display: "block",
                    marginBottom: 6,
                    padding: 6,
                  }}
                />
                <input
                  placeholder="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: "40%",
                    display: "block",
                    marginBottom: 6,
                    padding: 6,
                  }}
                />
                <input
                  type="date"
                  placeholder="First Run Date"
                  value={firstRunDate}
                  onChange={(e) => setFirstRunDate(e.target.value)}
                  style={{
                    width: "40%",
                    display: "block",
                    marginBottom: 12,
                    padding: 6,
                  }}
                />
                <input
                  type="number"
                  placeholder="Expected Lifecycle (MI)"
                  value={expectedLifecycle}
                  onChange={(e) => setExpectedLifecycle(e.target.value)}
                  min="0"
                  step="0.1"
                  style={{ width: "40%", marginBottom: 12, padding: 6 }}
                />
                <button
                  onClick={addShoe}
                  style={{ padding: "8px 12px", marginBottom: 20 }}
                >
                  Add Shoe
                </button>
              </>
            )}
          </>
        )}
      </div>

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
    </>
  );
}

export default App;
