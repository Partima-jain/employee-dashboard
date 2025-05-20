import React, { useState, useContext } from "react";
import OutstandingReport from "./OutstandingReport";
import PaymentReport from "./PaymentReport";
import EmployeeModal from "./EmployeeModal";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [refreshOutstanding, setRefreshOutstanding] = useState(false);

  const handleModalClose = () => setShowModal(false);
  const handleModalOpen = () => setShowModal(true);

  // trigger outstanding report refresh after modal submit
  const onModalSubmit = () => {
    setRefreshOutstanding((prev) => !prev);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={logout}>Logout</button>
      <OutstandingReport key={refreshOutstanding} onOpenModal={handleModalOpen} />
      <PaymentReport />
      {showModal && <EmployeeModal onClose={handleModalClose} onSubmit={onModalSubmit} />}
    </div>
  );
};

export default Dashboard;
