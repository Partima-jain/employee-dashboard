// components/OutstandingReport.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeModal from './EmployeeModal';

const OutstandingReport = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/employees/outstanding-report');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching outstanding report:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModalClose = (refresh = false) => {
    setShowModal(false);
    if (refresh) fetchData();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Outstanding Report Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Insert Employee Data
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-2 px-4 border-b">Employee Name</th>
            <th className="py-2 px-4 border-b">Employee ID</th>
            <th className="py-2 px-4 border-b">Net Collection</th>
            <th className="py-2 px-4 border-b">Total Deposited</th>
            <th className="py-2 px-4 border-b">Difference</th>
            <th className="py-2 px-4 border-b">Most Recent Transaction</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{emp.name}</td>
              <td className="py-2 px-4 border-b">{emp.employeeId}</td>
              <td className="py-2 px-4 border-b">₹{emp.netCollection.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">₹{emp.totalDeposited.toFixed(2)}</td>
              <td className="py-2 px-4 border-b text-red-600">₹{(emp.netCollection - emp.totalDeposited).toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{new Date(emp.mostRecentTransaction).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <EmployeeModal onClose={handleModalClose} />}
    </div>
  );
};

export default OutstandingReport;
