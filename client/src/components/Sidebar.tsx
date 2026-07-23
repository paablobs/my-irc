import { Box, VStack, Text, Tooltip, IconButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiHash, FiSettings, FiLogOut } from 'react-icons/fi';
import { useConnectionStore } from '../stores/connectionStore';

export function Sidebar() {
  const navigate = useNavigate();
  const { nickname, isConnected, disconnect } = useConnectionStore();

  return (
    <Box
      w="60px"
      h="100%"
      bg="#16213e"
      borderRight="1px solid #0f3460"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py={4}
      gap={2}
    >
      <Tooltip.Root positioning={{ placement: 'right' }}>
        <Tooltip.Trigger asChild>
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            bg="#0073e6"
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            _hover={{ bg: '#005bb5' }}
          >
            <Text color="white" fontWeight="bold" fontSize="sm">
              {nickname.charAt(0).toUpperCase()}
            </Text>
          </Box>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          {nickname}
        </Tooltip.Content>
      </Tooltip.Root>

      <Box w="32px" h="1px" bg="#0f3460" my={2} />

      <VStack gap={2} flex={1}>
        <Tooltip.Root positioning={{ placement: 'right' }}>
          <Tooltip.Trigger asChild>
            <IconButton
              aria-label="Channels"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              color="#a0a0b0"
              _hover={{ color: '#e6e6e6', bg: '#0f3460' }}
            >
              <FiHash />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Arrow />
            Channels
          </Tooltip.Content>
        </Tooltip.Root>

        <Tooltip.Root positioning={{ placement: 'right' }}>
          <Tooltip.Trigger asChild>
            <IconButton
              aria-label="Settings"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              color="#a0a0b0"
              _hover={{ color: '#e6e6e6', bg: '#0f3460' }}
            >
              <FiSettings />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Arrow />
            Settings
          </Tooltip.Content>
        </Tooltip.Root>
      </VStack>

      <VStack gap={2}>
        <Tooltip.Root positioning={{ placement: 'right' }}>
          <Tooltip.Trigger asChild>
            <Box
              w="8px"
              h="8px"
              borderRadius="full"
              bg={isConnected ? '#4ade80' : '#f87171'}
            />
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Arrow />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Tooltip.Content>
        </Tooltip.Root>

        <Tooltip.Root positioning={{ placement: 'right' }}>
          <Tooltip.Trigger asChild>
            <IconButton
              aria-label="Disconnect"
              variant="ghost"
              size="sm"
              onClick={() => {
                disconnect();
                window.__ircClient?.sendCommand('QUIT');
                navigate('/');
              }}
              color="#a0a0b0"
              _hover={{ color: '#f87171', bg: '#0f3460' }}
            >
              <FiLogOut />
            </IconButton>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Arrow />
            Disconnect
          </Tooltip.Content>
        </Tooltip.Root>
      </VStack>
    </Box>
  );
}
