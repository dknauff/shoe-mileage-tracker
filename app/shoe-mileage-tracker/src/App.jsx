import { useState } from "react";

function App() {
  // array of shoe objects
  const [shoes, setShoes] = useState([]);
  const [selectedIndex, setSelectIndex] = useState(null);

  // state variables to hold inputs for new shoe form
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [firstRunDate, setFirstRunDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  // state for logging runs
  const [milesInput, setMilesInput] = useState("");
  const [runDate, setRunDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [runLocation, setRunLocation] = useState("");
  const [showAddShoeForm, setShowAddShoeForm] = useState(true);

  // Add a shoe
  function addShoe() {
    if (!brand || !name || !color || !firstRunDate) {
      alert("Fill in all fields.");
      return;
    }
    const newShoe = {
      brand,
      name,
      color,
      firstRunDate,
      miles: 0,
    };
    setShoes([...shoes, newShoe]); // spread operator -> makes a new array that includes all existing shoes
    setBrand("");
    setName("");
    setColor("");
    setFirstRunDate(() => new Date().toISOString().split("T")[0]);
    setSelectIndex(shoes.length); // <-- Auto-select newly added shoe
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

  return (
    <>
      <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
        <h1>Shoe Mileage Tracker</h1>

        {/* Lists all shoes */}
        <h2>Shoes</h2>
        {shoes.length === 0 && <p>No shoes in inventory.</p>}
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {shoes.map((shoe, index) => (
            <li
              key={index}
              onClick={() => setSelectIndex(index)} // select shoe on click
              style={{
                padding: 10,
                marginBottom: 6,
                cursor: "pointer",
                backgroundColor:
                  selectedIndex === index ? "#145A32" : "#3A3B3C", // highlights selected shoe
                borderRadius: 6,
              }}
            >
              <strong>
                {shoe.brand} {shoe.name}
              </strong>{" "}
              - {shoe.color} <br />
              First Run: {shoe.firstRunDate} <br />
              Mileage: {shoe.miles.toFixed(2)}
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
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
            <input
              type="date"
              value={runDate}
              onChange={(e) => setRunDate(e.target.value)}
            />
            <input
              type="text"
              value={runLocation}
              onChange={(e) => setRunLocation(e.target.value)}
              placeholder="Where did you run?"
            />
            <button
              onClick={addMiles}
              style={{ padding: "8px 12px", outline: "none", boarder: "none" }}
            >
              Add Miles
            </button>
          </>
        )}

        {showAddShoeForm && (
          <>
            {/* Form for adding shoes */}
            <h2>Add New Shoe</h2>
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
            <button
              onClick={addShoe}
              style={{ padding: "8px 12px", marginBottom: 20 }}
            >
              Add Shoe
            </button>
          </>
        )}

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
      </div>
    </>
  );
}

export default App;
