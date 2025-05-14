// components/CreatePoll.jsx
import { useState } from 'react';
import { usePoll } from "../context/PollContext";

const CreatePoll = () => {
  const {
    roomCode,
    startPoll,
    leaveRoom,
    setCurrentView,
    pollstatus,
  } = usePoll();

  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');

  const handleStartPoll = () => {
    if (!question.trim()) return alert('Please enter a question.');
    if (!option1.trim() || !option2.trim()) return alert('Both options are required.');

    const success = startPoll(question, [option1, option2]);

    if (success) {
      setCurrentView('poll');
    }
  };

  if (!roomCode) {
    return (
      <div className="h-screen flex items-center justify-center text-xl text-gray-500">
        Loading room...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-16 space-y-6">
      <div className="mb-4 px-6 py-2 bg-indigo-700 text-white font-mono text-lg rounded-xl shadow-md tracking-widest text-center">
        Room Code: {roomCode}
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-10 space-y-6 border border-indigo-200">
        <h1 className="text-4xl font-bold text-center text-gray-800">Create a Poll</h1>
        <p className="text-center text-gray-500 text-sm">Set a question and two options to start polling</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poll Question</label>
          <input
            type="text"
            placeholder="e.g., cat vs dog "
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Option1</label>
          <input
            type="text"
            placeholder="Enter first option"
            value={option1}
            onChange={(e) => setOption1(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Option2</label>
          <input
            type="text"
            placeholder="Enter second option"
            value={option2}
            onChange={(e) => setOption2(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleStartPoll}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold rounded-lg transition-all shadow-md"
        >
          Start Poll
        </button>

        <div className="flex gap-4 pt-2">
          <button
            onClick={() => setCurrentView('lobby')}
            className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition"
          >
            Back
          </button>
          <button
            onClick={leaveRoom}
            className="w-full py-2 border border-red-300 rounded-lg hover:bg-red-100 text-red-600 transition"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePoll;
