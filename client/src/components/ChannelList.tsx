import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Badge,
  IconButton,
  Dialog,
  Portal,
} from '@chakra-ui/react';
import { FiPlus, FiHash, FiSearch } from 'react-icons/fi';
import { useChannelStore } from '../stores/channelStore';
import { useConnectionStore } from '../stores/connectionStore';

export function ChannelList() {
  const navigate = useNavigate();
  const { channels, activeChannel, setActiveChannel, clearUnread } = useChannelStore();
  const nickname = useConnectionStore((s) => s.nickname);
  const [search, setSearch] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinChannel, setJoinChannel] = useState('');

  const channelList = Array.from(channels.values()).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleChannelClick = (channelName: string) => {
    setActiveChannel(channelName);
    clearUnread(channelName);
    navigate(`/channel/${channelName.slice(1)}`);
  };

  const handleJoin = () => {
    if (joinChannel.trim()) {
      const channelName = joinChannel.startsWith('#') ? joinChannel : `#${joinChannel}`;
      window.__ircClient?.sendCommand(`JOIN ${channelName}`);
      setJoinChannel('');
      setJoinDialogOpen(false);
    }
  };

  return (
    <Box
      w="240px"
      h="100%"
      bg="#16213e"
      borderRight="1px solid #0f3460"
      display="flex"
      flexDirection="column"
    >
      <Box p={3} borderBottom="1px solid #0f3460">
        <HStack justify="space-between" mb={3}>
          <Text fontWeight="semibold" color="#e6e6e6" fontSize="sm">
            Channels
          </Text>
          <Dialog.Root open={joinDialogOpen} onOpenChange={(e) => setJoinDialogOpen(e.open)}>
            <Dialog.Trigger asChild>
              <IconButton
                aria-label="Join channel"
                size="xs"
                variant="ghost"
                color="#a0a0b0"
                _hover={{ color: '#e6e6e6' }}
              >
                <FiPlus />
              </IconButton>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content bg="#252545">
                  <Dialog.Header>
                    <Dialog.Title color="#e6e6e6">Join Channel</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Input
                      value={joinChannel}
                      onChange={(e) => setJoinChannel(e.target.value)}
                      placeholder="Channel name (e.g., #general)"
                      bg="#16213e"
                      border="1px solid #0f3460"
                      color="#e6e6e6"
                      _placeholder={{ color: '#6c6c80' }}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button variant="ghost" onClick={() => setJoinDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button bg="#0073e6" color="white" onClick={handleJoin}>
                      Join
                    </Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </HStack>

        <HStack>
          <FiSearch color="#6c6c80" size={14} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            size="sm"
            bg="transparent"
            border="none"
            color="#e6e6e6"
            _placeholder={{ color: '#6c6c80' }}
            _focus={{ boxShadow: 'none' }}
          />
        </HStack>
      </Box>

      <VStack gap={0} flex={1} overflow="auto" align="stretch" py={1}>
        {channelList.length === 0 ? (
          <Box p={4} textAlign="center">
            <Text color="#6c6c80" fontSize="sm">
              No channels yet
            </Text>
            <Text color="#6c6c80" fontSize="xs" mt={1}>
              Join a channel to get started
            </Text>
          </Box>
        ) : (
          channelList.map((channel) => (
            <HStack
              key={channel.name}
              px={3}
              py={2}
              cursor="pointer"
              bg={activeChannel === channel.name ? '#0f3460' : 'transparent'}
              _hover={{ bg: '#0f3460' }}
              onClick={() => handleChannelClick(channel.name)}
              transition="background 0.15s"
            >
              <FiHash size={16} color="#6c6c80" />
              <Text
                flex={1}
                fontSize="sm"
                color={activeChannel === channel.name ? '#e6e6e6' : '#a0a0b0'}
                fontWeight={activeChannel === channel.name ? 'semibold' : 'normal'}
              >
                {channel.name.slice(1)}
              </Text>
              {channel.unreadCount > 0 && (
                <Badge
                  borderRadius="full"
                  px={2}
                  fontSize="xs"
                  bg="#0073e6"
                  color="white"
                >
                  {channel.unreadCount}
                </Badge>
              )}
            </HStack>
          ))
        )}
      </VStack>

      <Box p={3} borderTop="1px solid #0f3460">
        <HStack>
          <Box w="8px" h="8px" borderRadius="full" bg="#4ade80" />
          <Text fontSize="xs" color="#a0a0b0">
            {nickname}
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
