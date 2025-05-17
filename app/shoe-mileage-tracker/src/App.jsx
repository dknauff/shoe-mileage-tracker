import { useState } from "react";

function App() {
  // state to hold total miles
  const [miles, setMiles] = useState(0);
  // state for input field
  const [input, setInput] = useState("");

  // mileage handler
  function addMiles() {
    const parsed = parseFloat(input);
    if (!isNaN(parsed) && parsed > 0) {
      setMiles((prev) => prev + parsed);
      setInput("");
    } else {
      alert("Invalid Entry.");
    }
  }

  return (
    <>
      <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
        <h1>Shoe Mileage Tracker</h1>
        <p>
          Total miles: <strong>{miles.toFixed(2)}</strong>
        </p>

        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Miles Run"
          step="0.01"
          style={{ padding: 8, width: "100", marginBottom: 10 }}
        />
        <button onClick={addMiles} style={{ padding: "8px 12px" }}>
          Add Miles
        </button>
      </div>
    </>
  );
}

export default App;
