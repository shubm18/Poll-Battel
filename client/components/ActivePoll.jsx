// ActivePoll.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePoll } from "../context/PollContext";

const Confetti = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#a3cef1,_transparent_80%)] animate-pulse" />
  </div>
);

const ActivePoll = () => {
  const {
    roomCode,
    pollStatus,
    isHost,
    submitVote,
    leaveRoom,
    resetPollState,
  } = usePoll();

  const {
    active: pollActive,
    ended: pollEnded,
    question,
    options,
    userVote,
    voteResults,
    winningOption,
    timeRemaining,
  } = pollStatus;

  const [showConfetti, setShowConfetti] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (pollEnded && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowChart(true), 700);
    }
  }, [pollEnded, showConfetti]);

  const handleVote = (index) => {
    if (userVote === null && pollActive) {
      submitVote(index);
    }
  };

  const adjustedTime = pollEnded ? 0 : timeRemaining;
  const progressPercent = (adjustedTime / 60) * 100;

  const chartData = options.map((option, i) => ({
    name: option,
    votes: voteResults[i] || 0,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-cyan-100 to-teal-50 px-6 py-10 relative overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl p-6 sm:p-10 space-y-8 z-10 border border-gray-200">
        <header className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
            {pollEnded ? "Poll Results" : "Live Poll"}
          </h2>
          <span className="text-sm font-mono text-slate-600">
            Room: <strong className="text-indigo-600 font-bold">{roomCode}</strong>
          </span>
        </header>

        <section className="text-center">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-800">{question}</h3>
        </section>

        {!pollEnded ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
              {options.map((option, i) => {
                const isSelected = userVote === i;
                const isDisabled = userVote !== null || !pollActive;
                return (
                  <button
                    key={i}
                    onClick={() => handleVote(i)}
                    disabled={isDisabled}
                    className={`transition transform flex flex-col justify-center items-center text-center rounded-xl shadow-xl px-5 py-5 text-lg font-semibold 
                      ${isSelected ? "bg-indigo-700 text-white ring-4 ring-indigo-500 scale-105" : "bg-white text-gray-800 border border-gray-300 hover:bg-indigo-50 hover:shadow-2xl"}
                      ${isDisabled ? "opacity-80 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
                    `}
                  >
                    <span className="font-semibold">{option}</span>
                    <span className="text-indigo-700 font-bold mt-2 text-sm bg-indigo-100 px-3 py-1 rounded-full shadow-md">
                      {voteResults[i] || 0} votes
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-full h-3 sm:h-4 mt-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-600 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs sm:text-sm text-right text-gray-600 mt-1 font-mono">
              ⏳ <span className="text-indigo-600 font-semibold">{adjustedTime}s</span> remaining
            </p>
          </>
        ) : (
          <>
            {winningOption && (
              <div className="text-center text-2xl font-bold text-indigo-700 mt-6">
                🎉 <span className="animate-pulse">{winningOption}</span> won the poll!
              </div>
            )}
            {showChart && (
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={14} />
                    <YAxis allowDecimals={false} fontSize={14} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f0f9ff",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="votes"
                      fill="#6366f1"
                      radius={[10, 10, 0, 0]}
                      barSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-6 pt-6">
          {pollEnded && (
            <button
              onClick={resetPollState}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
            >
              {isHost ? "Start New Poll" : "Go Back to Lobby"}
            </button>
          )}
          <button
            onClick={leaveRoom}
            className="flex-1 py-4 border border-gray-300 bg-white text-red-600 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivePoll;
