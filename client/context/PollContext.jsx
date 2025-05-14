import React, { createContext, useContext, useState, useEffect } from "react";
import useWebSocket from "../hooks/useWebSocket";

const PollContext = createContext(null);
export const usePoll = () => useContext(PollContext);

export const PollProvider = ({ children }) => {
  const { isConnected, sendMessage, addMessageListener, connect } = useWebSocket();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [currentView, setCurrentView] = useState("welcome");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", variant: "" });
  const [pollStatus, setPollStatus] = useState({
    active: false,
    ended: false,
    question: "",
    options: ["", ""],
    userVote: null,
    voteResults: { 0: 0, 1: 0 },
    timeRemaining: 60,
    winningOption: null,
    startTime: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  
  useEffect(() => {
    setIsConnecting(true);
    connect();
    const timer = setTimeout(() => setIsConnecting(false), 3000);
    return () => clearTimeout(timer);
  }, [connect]);


  useEffect(() => {
    const savedUsername = localStorage.getItem("pollBattle_username");
    const savedRoomCode = localStorage.getItem("pollBattle_roomCode");
    const savedUserVote = localStorage.getItem("pollBattle_userVote");
    if (savedUsername) setUsername(savedUsername);
    if (savedRoomCode) setRoomCode(savedRoomCode);
    if (savedUserVote) {
      setPollStatus((prev) => ({ ...prev, userVote: JSON.parse(savedUserVote) }));
    }
  }, []);


  useEffect(() => {
    if (!isConnected) return;

    const handleMessage = (data) => {
      switch (data.type) {
        case "room_created":
          setRoomCode(data.payload.roomCode);
          localStorage.setItem("pollBattle_roomCode", data.payload.roomCode);
          setIsHost(true);
          setRoomUsers([{ username }]);
          setCurrentView("lobby");
          break;

        case "room_joined":
          setRoomCode(data.payload.roomCode);
          localStorage.setItem("pollBattle_roomCode", data.payload.roomCode);
          setRoomUsers(data.payload.users);

          const poll = data.payload.poll;
          if (poll && poll.active) {
            const { question, options, startTime, results } = poll;
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(60 - elapsed, 0);
            setPollStatus({
              active: true,
              ended: false,
              question,
              options,
              userVote: null,
              voteResults: results || { 0: 0, 1: 0 },
              timeRemaining: remaining,
              startTime,
              winningOption: null,
            });
            setCurrentView("poll");
          } else {
            setCurrentView("lobby");
          }
          break;

        case "poll_started":
          const { question, options, startTime } = data.payload;
          setPollStatus({
            active: true,
            ended: false,
            question,
            options,
            userVote: null,
            voteResults: { 0: 0, 1: 0 },
            timeRemaining: 60,
            startTime,
            winningOption: null,
          });
          setCurrentView("poll");
          break;

        case "vote_update":
          setPollStatus((prev) => ({ ...prev, voteResults: data.payload.results }));
          break;

        case "poll_ended":
          setPollStatus((prev) => ({
            ...prev,
            active: false,
            ended: true,
            voteResults: data.payload.results,
            winningOption: data.payload.winner,
          }));
          break;

        case "error":
          showToastMessage("Error", data.payload.message, "error");
          break;

        default:
          console.warn("Unhandled message type:", data.type);
      }
    };

    const unsubscribe = addMessageListener(handleMessage);
    return () => unsubscribe();
  }, [isConnected, addMessageListener, username]);

  
  useEffect(() => {
    if (!pollStatus.active || !pollStatus.startTime) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pollStatus.startTime) / 1000);
      const remaining = Math.max(60 - elapsed, 0);
      setPollStatus((prev) => ({ ...prev, timeRemaining: remaining }));

      if (remaining === 0) {
        endPoll();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pollStatus.active, pollStatus.startTime]);

  const showToastMessage = (title, description, variant = "info") => {
    setToastMessage({ title, description, variant });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const waitForConnection = (action, errorMessage) => {
    if (!isConnected) {
      showToastMessage("Connecting", "Please wait, connecting to server...", "info");
      const interval = setInterval(() => {
        if (isConnected) {
          clearInterval(interval);
          action();
        }
      }, 500);
      setTimeout(() => {
        clearInterval(interval);
        showToastMessage("Error", errorMessage, "error");
      }, 5000);
      return false;
    } else {
      action();
      return true;
    }
  };

  const createRoom = (user) => {
    if (!user) {
      showToastMessage("Error", "Please enter a username.", "error");
      return;
    }
    setUsername(user);
    localStorage.setItem("pollBattle_username", user);
    waitForConnection(
      () => sendMessage("create_room", { username: user }),
      "Failed to connect to server. Please try again."
    );
  };

  const joinRoom = (code, user) => {
    if (!user || !code) {
      showToastMessage("Error", "Username and Room Code are required.", "error");
      return;
    }
    setUsername(user);
    localStorage.setItem("pollBattle_username", user);
    waitForConnection(
      () => sendMessage("join_room", { roomCode: code, username: user }),
      "Failed to connect to server. Please try again."
    );
  };

  const startPoll = (question, options) => {
    if (roomCode && question && options.length === 2) {
      const startTime = Date.now();
      sendMessage("start_poll", { roomCode, question, options, startTime });
      return true;
    } else {
      showToastMessage("Error", "Invalid question or options.", "error");
      return false;
    }
  };

  const submitVote = (optionIndex) => {
    if (pollStatus.userVote !== null)
      return showToastMessage("Already Voted", "You already voted.", "error");
    setPollStatus((prev) => ({ ...prev, userVote: optionIndex }));
    sendMessage("vote", { roomCode, optionIndex });
    localStorage.setItem("pollBattle_userVote", JSON.stringify(optionIndex));
  };

  const endPoll = () => {
    sendMessage("end_poll", { roomCode });
    setPollStatus((prev) => ({ ...prev, active: false, ended: true }));
  };

  const resetPollState = () => {
    setPollStatus({
      active: false,
      ended: false,
      question: "",
      options: ["", ""],
      userVote: null,
      voteResults: { 0: 0, 1: 0 },
      timeRemaining: 60,
      winningOption: null,
      startTime: null,
    });
    setCurrentView("lobby");
    localStorage.removeItem("pollBattle_userVote");
  };

  const leaveRoom = () => {
    sendMessage("leave_room", { roomCode });
    setRoomCode("");
    setRoomUsers([]);
    setIsHost(false);
    resetPollState();
    setCurrentView("welcome");
    localStorage.removeItem("pollBattle_roomCode");
    localStorage.removeItem("pollBattle_userVote");
  };

  return (
    <PollContext.Provider
      value={{
        roomCode,
        isHost,
        roomUsers,
        pollStatus,
        username,
        currentView,
        showToast,
        toastMessage,
        createRoom,
        joinRoom,
        startPoll,
        submitVote,
        leaveRoom,
        resetPollState,
        setCurrentView,
        setUsername,
        isConnected,
        isConnecting,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};
