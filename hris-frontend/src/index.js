import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import EmployeeDetails from "./EmployeeDetails"; // Create this next
import './index.css';

function Root() {
  const [user, setUser] = React.useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<Login onLoginSuccess={(user) => setUser(user)} />} />
        ) : (
          <>
            <Route path="/" element={<App user={user} />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Root />);
