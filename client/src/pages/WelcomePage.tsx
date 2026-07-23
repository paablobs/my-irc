import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Collapsible,
  Field,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useConnectionStore } from '../stores/connectionStore';
import { IRCWebSocketClient } from '../websocket/ircClient';
import { handleIRCMessage } from '../api/ircHandler';

const MotionBox = motion.create(Box);

export function WelcomePage() {
  const navigate = useNavigate();
  const { setConnectionInfo, setConnecting, setError, setConnected } = useConnectionStore();
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [realname, setRealname] = useState('');
  const [server, setServer] = useState('localhost');
  const [port, setPort] = useState('8080');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setLocalError] = useState('');

  const handleConnect = async () => {
    if (!nickname.trim()) {
      setLocalError('Nickname is required');
      return;
    }

    setIsConnecting(true);
    setLocalError('');
    setConnecting(true);

    const wsUrl = `ws://${server}:${port}`;

    try {
      const client = new IRCWebSocketClient(wsUrl);

      client.onMessage((msg) => {
        if (msg.type === 'irc' && msg.data) {
          handleIRCMessage(msg.data);
        } else if (msg.type === 'connected') {
          client.register(nickname, username || nickname, realname || nickname);
          setConnectionInfo({
            nickname,
            username: username || nickname,
            realname: realname || nickname,
            server,
            port: parseInt(port),
          });
          setConnected(true);
          navigate('/channel/general');
        } else if (msg.type === 'disconnected') {
          setConnected(false);
        } else if (msg.type === 'error') {
          setLocalError(msg.message || 'Connection failed');
          setError(msg.message || 'Connection failed');
        }
      });

      window.__ircClient = {
        sendCommand: (cmd: string) => client.sendCommand(cmd),
      };

      await client.connect();
    } catch (err) {
      setLocalError('Failed to connect to WebSocket gateway');
      setConnecting(false);
      setIsConnecting(false);
    }
  };

  return (
    <Flex h="100%" align="center" justify="center" bg="#1a1a2e">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxW="md" py={12}>
          <VStack gap={8} align="stretch">
            <VStack gap={2} textAlign="center">
              <Heading size="2xl" color="#1a8cff">
                IRC Client
              </Heading>
              <Text color="#a0a0b0">
                Connect to your favorite IRC server
              </Text>
            </VStack>

            <VStack gap={4} align="stretch">
              <Field.Root required>
                <Field.Label color="#a0a0b0">Nickname</Field.Label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  bg="#16213e"
                  border="1px solid #0f3460"
                  color="#e6e6e6"
                  _placeholder={{ color: '#6c6c80' }}
                  _focus={{ borderColor: '#1a8cff', boxShadow: '0 0 0 1px #1a8cff' }}
                  size="lg"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="#a0a0b0">Username</Field.Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Optional (defaults to nickname)"
                  bg="#16213e"
                  border="1px solid #0f3460"
                  color="#e6e6e6"
                  _placeholder={{ color: '#6c6c80' }}
                  _focus={{ borderColor: '#1a8cff', boxShadow: '0 0 0 1px #1a8cff' }}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="#a0a0b0">Real Name</Field.Label>
                <Input
                  value={realname}
                  onChange={(e) => setRealname(e.target.value)}
                  placeholder="Optional (defaults to nickname)"
                  bg="#16213e"
                  border="1px solid #0f3460"
                  color="#e6e6e6"
                  _placeholder={{ color: '#6c6c80' }}
                  _focus={{ borderColor: '#1a8cff', boxShadow: '0 0 0 1px #1a8cff' }}
                />
              </Field.Root>

              <Collapsible.Root open={showAdvanced}>
                <Collapsible.Trigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    color="#a0a0b0"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content>
                  <VStack gap={4} mt={4}>
                    <HStack gap={4}>
                      <Field.Root flex={3}>
                        <Field.Label color="#a0a0b0">Server</Field.Label>
                        <Input
                          value={server}
                          onChange={(e) => setServer(e.target.value)}
                          placeholder="localhost"
                          bg="#16213e"
                          border="1px solid #0f3460"
                          color="#e6e6e6"
                        />
                      </Field.Root>
                      <Field.Root flex={1}>
                        <Field.Label color="#a0a0b0">Port</Field.Label>
                        <Input
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                          placeholder="8080"
                          bg="#16213e"
                          border="1px solid #0f3460"
                          color="#e6e6e6"
                        />
                      </Field.Root>
                    </HStack>
                  </VStack>
                </Collapsible.Content>
              </Collapsible.Root>

              {error && (
                <Text color="#f87171" fontSize="sm" textAlign="center">
                  {error}
                </Text>
              )}

              <Button
                size="lg"
                onClick={handleConnect}
                loading={isConnecting}
                loadingText="Connecting..."
                bg="#0073e6"
                color="white"
                _hover={{ bg: '#005bb5' }}
                _active={{ bg: '#004485' }}
              >
                Connect
              </Button>
            </VStack>
          </VStack>
        </Container>
      </MotionBox>
    </Flex>
  );
}
