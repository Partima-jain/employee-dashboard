import React, { useContext } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const App = () => {
  const { user } = useContext(AuthContext);

  return <div>{user ? <Dashboard /> : <Login />}</div>;
};

const RootApp = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default RootApp;
