import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useChannelStore } from '../stores/channelStore';
import { useMessageStore } from '../stores/messageStore';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { Message } from '../stores/messageStore';

export function ChatArea() {
  const { channel: channelParam } = useParams();
  const channelName = channelParam ? `#${channelParam}` : null;
  const activeChannel = useChannelStore((s) => s.activeChannel);
  const currentChannel = channelName || activeChannel;
  const messages = useMessageStore((s) => s.getMessages(currentChannel || ''));
  const users = useUserStore((s) => s.getUsersInChannel(currentChannel || ''));
  const timestampFormat = useSettingsStore((s) => s.settings.timestampFormat);
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !currentChannel) return;

    if (input.startsWith('/')) {
      const command = input.slice(1);
      window.__ircClient?.sendCommand(command);
    } else {
      window.__ircClient?.sendCommand(`PRIVMSG ${currentChannel} :${input}`);
    }

    setInput('');
  };

  const handleMentionClick = (nick: string) => {
    setInput((prev) => prev + nick + ' ');
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    if (timestampFormat === '24h') {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (msg: Message) => {
    switch (msg.type) {
      case 'system':
      case 'error':
        return (
          <HStack key={msg.id} px={4} py={1} gap={2}>
            <Text fontSize="xs" color="#6c6c80" w="60px" textAlign="right">
              {formatTime(msg.timestamp)}
            </Text>
            <Text fontSize="sm" color={msg.type === 'error' ? '#f87171' : '#6c6c80'} fontStyle="italic">
              {msg.content}
            </Text>
          </HStack>
        );

      case 'join':
      case 'part':
      case 'quit':
      case 'kick':
        return (
          <HStack key={msg.id} px={4} py={1} gap={2}>
            <Text fontSize="xs" color="#6c6c80" w="60px" textAlign="right">
              {formatTime(msg.timestamp)}
            </Text>
            <Text fontSize="sm" color="#6c6c80">
              <Text as="span" color="#1a8cff" fontWeight="semibold">{msg.sender}</Text>
              {' '}{msg.content}
            </Text>
          </HStack>
        );

      case 'nick':
        return (
          <HStack key={msg.id} px={4} py={1} gap={2}>
            <Text fontSize="xs" color="#6c6c80" w="60px" textAlign="right">
              {formatTime(msg.timestamp)}
            </Text>
            <Text fontSize="sm" color="#6c6c80">
              <Text as="span" color="#1a8cff" fontWeight="semibold">{msg.sender}</Text>
              {' '}{msg.content}
            </Text>
          </HStack>
        );

      case 'topic':
      case 'mode':
        return (
          <HStack key={msg.id} px={4} py={1} gap={2}>
            <Text fontSize="xs" color="#6c6c80" w="60px" textAlign="right">
              {formatTime(msg.timestamp)}
            </Text>
            <Text fontSize="sm" color="#60a5fa">
              {msg.content}
            </Text>
          </HStack>
        );

      case 'notice':
        return (
          <HStack key={msg.id} px={4} py={1} gap={2}>
            <Text fontSize="xs" color="#6c6c80" w="60px" textAlign="right">
              {formatTime(msg.timestamp)}
            </Text>
            <Text fontSize="sm" color="#fbbf24">
              [{msg.sender}] {msg.content}
            </Text>
          </HStack>
        );

      default:
        return (
          <HStack key={msg.id} px={4} py={1.5} gap={2} _hover={{ bg: '#16213e' }}>
            <Text fontSize="xs" color="#6c6c80" w="60px" textAlign="right" flexShrink={0}>
              {formatTime(msg.timestamp)}
            </Text>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="#1a8cff"
              cursor="pointer"
              _hover={{ textDecoration: 'underline' }}
              flexShrink={0}
              onClick={() => handleMentionClick(msg.sender)}
            >
              {msg.sender}
            </Text>
            <Text fontSize="sm" color="#e6e6e6">
              {msg.content}
            </Text>
          </HStack>
        );
    }
  };

  return (
    <Flex flex={1} h="100%" direction="column" bg="#1a1a2e">
      {currentChannel ? (
        <>
          <Box
            px={4}
            py={3}
            borderBottom="1px solid #0f3460"
            bg="#16213e"
          >
            <HStack justify="space-between">
              <HStack>
                <Text fontWeight="semibold" color="#e6e6e6">
                  {currentChannel}
                </Text>
                <Text fontSize="sm" color="#6c6c80">
                  {users.length} {users.length === 1 ? 'user' : 'users'}
                </Text>
              </HStack>
            </HStack>
          </Box>

          <Box flex={1} overflow="auto" ref={scrollRef}>
            <VStack gap={0} align="stretch" py={2}>
              {messages.map((msg) => renderMessage(msg))}
            </VStack>
          </Box>

          <Box px={4} py={3} borderTop="1px solid #0f3460">
            <HStack>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                  if (e.key === '@') setShowMentions(true);
                }}
                placeholder={`Message ${currentChannel}`}
                bg="#16213e"
                border="1px solid #0f3460"
                color="#e6e6e6"
                _placeholder={{ color: '#6c6c80' }}
                _focus={{ borderColor: '#1a8cff', boxShadow: '0 0 0 1px #1a8cff' }}
              />
              <IconButton
                aria-label="Send"
                onClick={handleSend}
                bg="#0073e6"
                _hover={{ bg: '#005bb5' }}
                color="white"
              >
                <FiSend />
              </IconButton>
            </HStack>

            {showMentions && users.length > 0 && (
              <Box
                mt={2}
                p={2}
                bg="#252545"
                borderRadius="md"
                border="1px solid #0f3460"
              >
                <Text fontSize="xs" color="#6c6c80" mb={1}>
                  Users in channel:
                </Text>
                <HStack flexWrap="wrap" gap={1}>
                  {users.map((user) => (
                    <Text
                      key={user.nickname}
                      fontSize="sm"
                      color="#1a8cff"
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                      px={2}
                      py={1}
                      bg="#16213e"
                      borderRadius="sm"
                      onClick={() => handleMentionClick(user.nickname)}
                    >
                      {user.nickname}
                    </Text>
                  ))}
                </HStack>
              </Box>
            )}
          </Box>
        </>
      ) : (
        <Flex flex={1} align="center" justify="center">
          <VStack gap={2}>
            <Text color="#6c6c80" fontSize="lg">
              Select a channel to start chatting
            </Text>
            <Text color="#6c6c80" fontSize="sm">
              Join a channel from the sidebar or create a new one
            </Text>
          </VStack>
        </Flex>
      )}
    </Flex>
  );
}
