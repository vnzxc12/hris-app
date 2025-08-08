import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import Sidebar from './Sidebar';
import { DateTime } from 'luxon';

const TimeTrackerPage = () => {
  const { user } = useContext(AuthContext);
  const [hasTimedIn, setHasTimedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(
    DateTime.now().setZone('Asia/Manila')
  );

  // Live PH clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(DateTime.now().setZone('Asia/Manila'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/time-logs/status/${user.employee_id}`
        );
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
      const now = DateTime.now().setZone('Asia/Manila').toISO();

      await axios.post(url, {
        employee_id: user.employee_id,
        timestamp: now,
      });

      toast.success(`Time ${type === 'in' ? 'In' : 'Out'} successful`);
      setHasTimedIn(type === 'in');
    } catch (err) {
      console.error(`Time ${type} failed`, err);
      toast.error(err?.response?.data?.error || `Failed to time ${type}`);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-8 max-w-2xl mx-auto flex-1">
        <h1 className="text-3xl font-bold mb-6 text-[#5DBB63]">Time Tracker</h1>

        <div className="bg-white rounded-xl shadow-md p-6 text-center mb-6">
          <p className="text-gray-600 text-md">Current Time in Manila:</p>
          <div className="font-mono text-4xl text-[#333] tracking-wider mt-2">
            {currentTime.toFormat('hh:mm:ss a')}
          </div>
          <div className="text-gray-500 text-sm mt-1">
            {currentTime.toFormat('cccc, LLLL dd, yyyy')}
          </div>
        </div>

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
