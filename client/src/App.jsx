import React from "react";
import { usePoll } from "../context/PollContext";

import WelcomePage from "../components/WelcomePage";
import CreatePoll from "../components/CreatePoll";
import RoomLobby from "../components/RoomLobby";
import ActivePoll from "../components/ActivePoll";
// import Results from "../components/Results";

import { PollProvider } from "../context/PollContext";

function App() {
  const { currentView } = usePoll();

  switch (currentView) {
    case 'welcome':
      return <WelcomePage />;
    case 'create_poll':
      return <CreatePoll />;
    case 'lobby':
      return <RoomLobby />;
    case 'poll':
      return <ActivePoll />;
    default:
      return <div className="text-center mt-10">Unknown view: {currentView}</div>;
  }
}

function AppWrapper() {
  return (
    <PollProvider>
        <App />
    
    </PollProvider>
  );
}

export default AppWrapper;
