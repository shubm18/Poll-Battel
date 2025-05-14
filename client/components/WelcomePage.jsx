import React, { useState } from "react";
import { FaPlus, FaSignInAlt } from "react-icons/fa";
import { usePoll } from "../context/PollContext";

const WelcomePage = () => {
  const [name, setName] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const {
    createRoom,
    joinRoom,
    showToast,
    toastMessage,
    isConnected,
    isConnecting,
  } = usePoll();

  const handleCreateRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name before creating a room.");
      return;
    }
    createRoom(name.trim());
  };

  const handleJoinRoom = () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!roomCodeInput.trim()) {
      alert("Please enter a valid room code.");
      return;
    }
    joinRoom(roomCodeInput.trim(), name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-emerald-100 px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-2">
          🎯 Live Poll Battle
        </h1>
        <p className="text-center text-gray-500 text-base mb-8">
          Create or join a room to begin your live poll session.
        </p>

        {showToast && (
          <div
            className={`mb-4 text-sm rounded-lg px-4 py-3 ${
              toastMessage.variant === "error"
                ? "bg-red-100 text-red-800"
                : toastMessage.variant === "info"
                ? "bg-blue-100 text-blue-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <strong>{toastMessage.title}: </strong>
            {toastMessage.description}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-2 text-sm shadow-sm"
          />
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab("create")}
            className={`w-1/2 text-sm font-semibold py-2.5 rounded-xl border ${
              activeTab === "create"
                ? "bg-indigo-600 text-white shadow"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`w-1/2 text-sm font-semibold py-2.5 rounded-xl border ${
              activeTab === "join"
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Join Room
          </button>
        </div>

        {activeTab === "create" ? (
          <button
            onClick={handleCreateRoom}
            disabled={isConnecting || !isConnected}
            className={`w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-xl shadow-md ${
              isConnecting || !isConnected
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <FaPlus />
            {isConnecting ? "Connecting..." : "Create New Room"}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Room Code
              </label>
              <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="w-full rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 px-4 py-2 text-sm shadow-sm"
              />
            </div>
            <button
              onClick={handleJoinRoom}
              disabled={isConnecting || !isConnected}
              className={`w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-xl shadow-md ${
                isConnecting || !isConnected
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <FaSignInAlt />
              {isConnecting ? "Connecting..." : "Join Room"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
