import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar'; // ✅ Sidebar added

const TimeTrackerPage = () => {
  const { user } = useContext(AuthContext);
  const [hasTimedIn, setHasTimedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log("🔍 Checking status for employee ID:", user?.employee_id);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/time-logs/status/${user.employee_id}`);
        setHasTimedIn(res.data.hasTimedIn);
      } catch (err) {
        console.error('Status fetch error:', err);
        toast.error('Failed to check time-in status');
      } finally {
        setLoading(false);
      }
    };

    if (user?.employee_id) {
      checkStatus();
    }
  }, [user]);

  const handleTime = async (type) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/time-logs/${type === 'in' ? 'time-in' : 'time-out'}`;
      console.log("🕒 Sending time log for employee ID:", user?.employee_id);
      await axios.post(url, { employee_id: user.employee_id });
      toast.success(`Time ${type === 'in' ? 'In' : 'Out'} successful`);
      setHasTimedIn(type === 'in');
    } catch (err) {
      console.error(`Time ${type} failed`, err);
      toast.error(err?.response?.data?.error || `Failed to time ${type}`);

    }
  };

  return (
    <div className="flex">
      <Sidebar /> {/* ✅ Sidebar rendered here */}

      <div className="p-8 max-w-2xl mx-auto flex-1">
        <h1 className="text-3xl font-bold mb-6 text-[#5DBB63]">Time Tracker</h1>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          {loading ? (
            <p className="text-gray-500">Checking status...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-4">
                {hasTimedIn
                  ? 'You have already timed in today.'
                  : 'You haven’t timed in yet today.'}
              </p>

              <button
                onClick={() => handleTime(hasTimedIn ? 'out' : 'in')}
                className={`px-6 py-3 text-white rounded-lg font-semibold text-lg ${
                  hasTimedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {hasTimedIn ? 'Time Out' : 'Time In'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTrackerPage;
