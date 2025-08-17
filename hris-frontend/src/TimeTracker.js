//timetracker.js

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

const TimeTracker = () => {
  const { user } = useContext(AuthContext);
  const [activeSession, setActiveSession] = useState(false); // true if timed in but not yet out

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Backend should return whether employee has an open session (time-in without time-out)
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/time-logs/status/${user.id}`
        );
        setActiveSession(res.data.activeSession);
      } catch (error) {
        console.error('Error checking time-in status:', error);
      }
    };

    if (user) fetchStatus();
  }, [user]);

  const handleTime = async (type) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/time-logs`, {
        employee_id: user.id,
        type, // 'in' or 'out'
      });

      toast.success(`Time ${type === 'in' ? 'In' : 'Out'} recorded`);
      setActiveSession(type === 'in');
    } catch (error) {
      console.error(`Time ${type} failed:`, error);
      toast.error(`Failed to time ${type}`);
    }
  };

  return (
    <div className="bg-white/10 rounded-lg p-4 mt-4 text-center">
      <h2 className="text-sm font-semibold mb-2">Time Tracker</h2>
      <button
        onClick={() => handleTime(activeSession ? 'out' : 'in')}
        className="bg-white text-[#5DBB63] px-4 py-1 rounded font-semibold text-sm"
      >
        {activeSession ? 'Time Out' : 'Time In'}
      </button>
    </div>
  );
};

export default TimeTracker;
