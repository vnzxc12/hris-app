// src/TimeTracker.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

const TimeTracker = () => {
  const { user } = useContext(AuthContext);
  const [hasTimedIn, setHasTimedIn] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/time-logs/status/${user.id}`);
        setHasTimedIn(res.data.hasTimedIn);
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
        type: type, // 'in' or 'out'
      });
      toast.success(`Time ${type === 'in' ? 'In' : 'Out'} recorded`);
      if (type === 'in') setHasTimedIn(true);
      else setHasTimedIn(false);
    } catch (error) {
      console.error(`Time ${type} failed:`, error);
      toast.error(`Failed to time ${type}`);
    }
  };

  return (
    <div className="bg-white/10 rounded-lg p-4 mt-4 text-center">
      <h2 className="text-sm font-semibold mb-2">Time Tracker</h2>
      <button
        onClick={() => handleTime(hasTimedIn ? 'out' : 'in')}
        className="bg-white text-[#5DBB63] px-4 py-1 rounded font-semibold text-sm"
      >
        {hasTimedIn ? 'Time Out' : 'Time In'}
      </button>
    </div>
  );
};

export default TimeTracker;
