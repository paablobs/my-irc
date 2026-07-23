import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { useChannelStore } from '../stores/channelStore';
import { useUserStore } from '../stores/userStore';
import { useState } from 'react';

export function MemberList() {
  const activeChannel = useChannelStore((s) => s.activeChannel);
  const users = useUserStore((s) => s.getUsersInChannel(activeChannel || ''));
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const operators = users.filter((u) => u.isOperator);
  const voiced = users.filter((u) => u.isVoiced && !u.isOperator);
  const regular = users.filter((u) => !u.isOperator && !u.isVoiced);

  const handleWhois = (nickname: string) => {
    window.__ircClient?.sendCommand(`WHOIS ${nickname}`);
  };

  const renderUserGroup = (title: string, userList: typeof users) => {
    if (userList.length === 0) return null;

    return (
      <Box mb={3}>
        <Text fontSize="xs" color="#6c6c80" px={3} mb={1} fontWeight="semibold" textTransform="uppercase">
          {title} — {userList.length}
        </Text>
        <VStack gap={0} align="stretch">
          {userList.map((user) => (
            <HStack
              key={user.nickname}
              px={3}
              py={1.5}
              cursor="pointer"
              _hover={{ bg: '#0f3460' }}
              transition="background 0.15s"
              justify="space-between"
              onMouseEnter={() => setSelectedUser(user.nickname)}
              onMouseLeave={() => setSelectedUser(null)}
            >
              <HStack gap={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg={user.away ? '#6c6c80' : '#4ade80'}
                />
                <Text
                  fontSize="sm"
                  color={user.away ? '#6c6c80' : '#e6e6e6'}
                  fontWeight={user.isOperator ? 'semibold' : 'normal'}
                >
                  {user.nickname}
                </Text>
                {user.isOperator && (
                  <Badge colorScheme="red" fontSize="xs" variant="subtle">
                    OP
                  </Badge>
                )}
                {user.isVoiced && (
                  <Badge colorScheme="green" fontSize="xs" variant="subtle">
                    VOICE
                  </Badge>
                )}
              </HStack>

              {selectedUser === user.nickname && (
                <Tooltip.Root positioning={{ placement: 'left' }}>
                  <Tooltip.Trigger asChild>
                    <IconButton
                      aria-label="User info"
                      size="xs"
                      variant="ghost"
                      color="#a0a0b0"
                      _hover={{ color: '#e6e6e6' }}
                      onClick={() => handleWhois(user.nickname)}
                    >
                      <FiInfo />
                    </IconButton>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <Tooltip.Arrow />
                    WHOIS {user.nickname}
                  </Tooltip.Content>
                </Tooltip.Root>
              )}
            </HStack>
          ))}
        </VStack>
      </Box>
    );
  };

  if (!activeChannel) return null;

  return (
    <Box
      w="200px"
      h="100%"
      bg="#16213e"
      borderLeft="1px solid #0f3460"
      overflow="auto"
    >
      <Box p={3} borderBottom="1px solid #0f3460">
        <Text fontWeight="semibold" color="#e6e6e6" fontSize="sm">
          Members
        </Text>
      </Box>

      <Box py={2}>
        {renderUserGroup('Operators', operators)}
        {renderUserGroup('Voiced', voiced)}
        {renderUserGroup('Members', regular)}
      </Box>
    </Box>
  );
}
