import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from './assets/logo.png';

const API_URL = process.env.REACT_APP_API_URL;

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f3f4f6",
    padding: "1rem",
  },
  form: {
     background: "#556B2F",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "100%",
    maxWidth: "350px",
    alignItems: "center",
  },
  logo: {
    height: "80px",
    width: "auto",
    objectFit: "contain",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "1rem",
    textAlign: "center",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "100%",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#ffffff",
    color: "#556B2F", 
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
};

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      if (res.status === 200 && res.data.user) {
        const user = res.data.user;

        console.log("Logged in user:", user); // ✅ Debug

        // Store values locally
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("employee_id", user.employee_id);
        localStorage.setItem("user", JSON.stringify(user));

        setError("");

        // ✅ Let App.js handle redirection
        onLoginSuccess(user);
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleLogin}>
        {/* Logo */}
        <img src={logo} alt="Logo" style={styles.logo} />

      
        <input
          type="text"
          placeholder="Username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button style={styles.button} type="submit">
          Login
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
