import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeModal = ({ onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [collectionData, setCollectionData] = useState({});
  const [depositData, setDepositData] = useState({});
  const [date, setDate] = useState('');

  useEffect(() => {
    // Fetch employees from backend
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('/api/employees');
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedEmployees(value);
  };

  const handleInputChange = (e, type, empId) => {
    const value = parseFloat(e.target.value) || 0;

    if (type === 'collection') {
      setCollectionData((prev) => ({
        ...prev,
        [empId]: value,
      }));
    } else {
      setDepositData((prev) => ({
        ...prev,
        [empId]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!date) {
      alert('Please select a date');
      return;
    }

    const payload = selectedEmployees.map((empId) => ({
      employeeId: empId,
      date,
      collectionAmount: collectionData[empId] || 0,
      depositAmount: depositData[empId] || 0,
    }));

    try {
      await axios.post('/api/employees/transactions', { entries: payload });
      alert('Data inserted successfully');
      onClose(true); // Close modal and refresh data
    } catch (error) {
      console.error('Error inserting data:', error);
      alert('Error inserting data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full">
        <h2 className="text-xl font-semibold mb-4">Insert Employee Data</h2>

        <label className="block mb-2">Select Employees:</label>
        <select
          multiple
          className="w-full border p-2 mb-4"
          onChange={handleEmployeeSelect}
        >
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} ({emp.employeeId})
            </option>
          ))}
        </select>

        <label className="block mb-2">Select Date:</label>
        <input
          type="date"
          className="w-full border p-2 mb-4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {selectedEmployees.map((empId) => {
          const emp = employees.find((e) => e._id === empId);
          return (
            <div key={empId} className="mb-4 border-b pb-2">
              <p className="font-medium">
                {emp?.name} ({emp?.employeeId})
              </p>
              <div className="flex space-x-4 mt-2">
                <input
                  type="number"
                  placeholder="MM Collection"
                  className="border p-2 w-1/2"
                  onChange={(e) => handleInputChange(e, 'collection', empId)}
                />
                <input
                  type="number"
                  placeholder="Deposit Amount"
                  className="border p-2 w-1/2"
                  onChange={(e) => handleInputChange(e, 'deposit', empId)}
                />
              </div>
            </div>
          );
        })}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => onClose(false)}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;
