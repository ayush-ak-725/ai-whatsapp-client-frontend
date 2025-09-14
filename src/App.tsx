import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from './hooks/useWebSocket.ts';
import { useStore } from './store/useStore.ts';
import Sidebar from './components/Sidebar.tsx';
import ChatArea from './components/ChatArea.tsx';
import GroupManagement from './components/GroupManagement.tsx';
import CharacterManagement from './components/CharacterManagement.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import './index.css';

function App() {
  const { isConnected, connect } = useWebSocket();
  const { isLoading, initializeApp } = useStore();

  React.useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  React.useEffect(() => {
    if (isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  if (isLoading) {
    return (
      <div className="h-screen bg-chat-bg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="chat-container h-screen overflow-hidden">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#202c33',
              color: '#e9edef',
              border: '1px solid #2a3942',
            },
          }}
        />
        
        <Sidebar />
        
        <Routes>
          <Route path="/" element={<ChatArea />} />
          <Route path="/groups" element={<GroupManagement />} />
          <Route path="/characters" element={<CharacterManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



