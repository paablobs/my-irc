import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Switch,
  Text,
  VStack,
  Select,
  createListCollection,
} from '@chakra-ui/react';
import { useSettingsStore } from '../stores/settingsStore';

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsStore();

  const themeCollection = createListCollection({
    items: [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
    ],
  });

  const timestampCollection = createListCollection({
    items: [
      { label: '24 Hour', value: '24h' },
      { label: '12 Hour', value: '12h' },
    ],
  });

  return (
    <Flex h="100%" bg="#1a1a2e" direction="column">
      <Container maxW="2xl" py={8} flex={1} overflow="auto">
        <VStack gap={8} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg" color="#e6e6e6">Settings</Heading>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back
            </Button>
          </HStack>

          <VStack gap={6} align="stretch">
            <Box p={6} bg="#16213e" borderRadius="lg">
              <Heading size="md" color="#e6e6e6" mb={4}>Appearance</Heading>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="#a0a0b0">Theme</Text>
                  <Select.Root collection={themeCollection} value={[settings.theme]} onValueChange={(e) => updateSettings({ theme: e.value[0] as 'dark' | 'light' })}>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                    </Select.Control>
                    <Select.Content>
                      {themeCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#a0a0b0">Font Size</Text>
                  <Text color="#e6e6e6">{settings.fontSize}px</Text>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#a0a0b0">Compact Mode</Text>
                  <Switch.Root
                    checked={settings.compactMode}
                    onCheckedChange={(e) => updateSettings({ compactMode: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>
              </VStack>
            </Box>

            <Box p={6} bg="#16213e" borderRadius="lg">
              <Heading size="md" color="#e6e6e6" mb={4}>Messages</Heading>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="#a0a0b0">Timestamp Format</Text>
                  <Select.Root collection={timestampCollection} value={[settings.timestampFormat]} onValueChange={(e) => updateSettings({ timestampFormat: e.value[0] as '12h' | '24h' })}>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                    </Select.Control>
                    <Select.Content>
                      {timestampCollection.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#a0a0b0">Show Join/Part Messages</Text>
                  <Switch.Root
                    checked={settings.showJoinPart}
                    onCheckedChange={(e) => updateSettings({ showJoinPart: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#a0a0b0">Show Nick Changes</Text>
                  <Switch.Root
                    checked={settings.showNickChanges}
                    onCheckedChange={(e) => updateSettings({ showNickChanges: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>
              </VStack>
            </Box>

            <Box p={6} bg="#16213e" borderRadius="lg">
              <Heading size="md" color="#e6e6e6" mb={4}>Notifications</Heading>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="#a0a0b0">Enable Notifications</Text>
                  <Switch.Root
                    checked={settings.notifications}
                    onCheckedChange={(e) => updateSettings({ notifications: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#a0a0b0">Notification Sound</Text>
                  <Switch.Root
                    checked={settings.notificationSound}
                    onCheckedChange={(e) => updateSettings({ notificationSound: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>
              </VStack>
            </Box>

            <Box p={6} bg="#16213e" borderRadius="lg">
              <Heading size="md" color="#e6e6e6" mb={4}>Connection</Heading>
              <VStack gap={4} align="stretch">
                <HStack justify="space-between">
                  <Text color="#a0a0b0">Auto Reconnect</Text>
                  <Switch.Root
                    checked={settings.autoReconnect}
                    onCheckedChange={(e) => updateSettings({ autoReconnect: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>

                <HStack justify="space-between">
                  <Text color="#a0a0b0">Show User List</Text>
                  <Switch.Root
                    checked={settings.showUserList}
                    onCheckedChange={(e) => updateSettings({ showUserList: e.checked })}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Flex>
  );
}
