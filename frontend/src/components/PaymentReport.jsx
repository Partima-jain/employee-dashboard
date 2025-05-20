import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const PaymentReport = () => {
  const { token } = useContext(AuthContext);
  const [employeeId, setEmployeeId] = useState("");
  const [report, setReport] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await axios.get("http://localhost:5000/api/data/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    };
    fetchEmployees();
  }, [token]);

  const fetchReport = async () => {
    if (!employeeId) return;
    const res = await axios.get(`http://localhost:5000/api/data/payment-report/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setReport(res.data);
  };

  return (
    <div>
      <h2>Employee Payment Report Dashboard</h2>
      <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
        <option value="">Select employee</option>
        {employees.map((e) => (
          <option key={e.employeeId} value={e.employeeId}>
            {e.name} ({e.employeeId})
          </option>
        ))}
      </select>
      <button onClick={fetchReport} disabled={!employeeId} style={{ marginLeft: 10 }}>
        Fetch Report
      </button>

      {report.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: 20, width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Collection Amount</th>
              <th>Deposit Amount</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            {report.map((r, i) => (
              <tr key={i}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.employeeName}</td>
                <td>{r.employeeId}</td>
                <td>{r.collectionAmount}</td>
                <td>{r.depositAmount}</td>
                <td>{r.difference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentReport;
