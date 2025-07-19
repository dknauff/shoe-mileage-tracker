import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function EmailLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        padding: 0,
        width: "100vw",
        minHeight: "100vh",
        background: "#222",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#292929",
          borderRadius: 12,
          boxShadow: "0 2px 16px #0008",
          padding: 32,
          minWidth: 320,
          maxWidth: 400,
          width: "90vw",
        }}
      >
        <h1
          style={{
            fontSize: 28,
            margin: "0 0 24px 0",
            textAlign: "center",
            letterSpacing: 1,
            color: "#1abc9c",
          }}
        >
          Shoe Tracker
        </h1>
        <h2
          style={{
            fontSize: 20,
            margin: "0 0 24px 0",
            textAlign: "center",
            color: "#fff",
          }}
        >
          Sign In
        </h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              display: "block",
              marginBottom: 16,
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #444",
              background: "#181818",
              color: "#fff",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              display: "block",
              marginBottom: 20,
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #444",
              background: "#181818",
              color: "#fff",
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px 0",
              fontSize: 18,
              background: "#1abc9c",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px #1abc9c33",
              transition: "background-color 0.2s",
            }}
          >
            Sign In
          </button>
          {error && (
            <p
              style={{
                color: "#e74c3c",
                fontSize: 14,
                margin: "16px 0 0 0",
                textAlign: "center",
                padding: "8px 12px",
                background: "rgba(231, 76, 60, 0.1)",
                borderRadius: 6,
                border: "1px solid rgba(231, 76, 60, 0.3)",
              }}
            >
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
