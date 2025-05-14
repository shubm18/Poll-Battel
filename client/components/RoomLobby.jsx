import React, { useState } from "react";
import { usePoll } from "../context/PollContext";

const RoomLobby = () => {
  const {
    roomCode,
    isHost,
    roomUsers,
    leaveRoom,
    setCurrentView,
    pollStatus,
  } = usePoll();

  const [copied, setCopied] = useState(false);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  if (!roomCode) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex text-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 shadow-md p-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Players ({roomUsers.length})</h2>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {roomUsers.map((user, index) => (
            <div key={index} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-semibold">
                {getInitials(user.username)}
              </div>
              <span className="text-sm font-medium">{user.username}</span>
            </div>
          ))}
        </div>
        <button
          onClick={leaveRoom}
          className="mt-6 py-2 px-4 text-sm font-semibold bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all duration-200"
        >
          ← Leave Room
        </button>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">Room Lobby</h1>
              <p className="text-sm text-gray-500">Share the code to invite others</p>
            </div>
            {isHost && (
              <span className="px-3 py-1 text-xs font-semibold border border-indigo-500 text-indigo-500 rounded-md">
                Host
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
            <span className="font-mono text-lg font-semibold tracking-widest text-indigo-600">
              {roomCode}
            </span>
            <button
              onClick={copyRoomCode}
              className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {isHost ? (
            <button
              onClick={() => setCurrentView("create_poll")}
              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Create Poll
            </button>
          ) : (
            <p className="text-center text-sm italic text-gray-500">
              Waiting for host to start the poll...
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomLobby;
