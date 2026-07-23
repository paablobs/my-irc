import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { WelcomePage } from '../pages/WelcomePage';
import { ChatPage } from '../pages/ChatPage';
import { SettingsPage } from '../pages/SettingsPage';
import { useConnectionStore } from '../stores/connectionStore';

export function App() {
  const isConnected = useConnectionStore((state) => state.isConnected);

  return (
    <Box h="100vh" w="100vw" overflow="hidden">
      <Routes>
        <Route path="/" element={isConnected ? <ChatPage /> : <WelcomePage />} />
        <Route path="/channel/:channel" element={<ChatPage />} />
        <Route path="/dm/:user" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Box>
  );
}
