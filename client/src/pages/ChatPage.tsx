import { Flex } from '@chakra-ui/react';
import { Sidebar } from '../components/Sidebar';
import { ChannelList } from '../components/ChannelList';
import { ChatArea } from '../components/ChatArea';
import { MemberList } from '../components/MemberList';
import { useSettingsStore } from '../stores/settingsStore';

export function ChatPage() {
  const showUserList = useSettingsStore((s) => s.settings.showUserList);

  return (
    <Flex h="100%" w="100%">
      <Sidebar />
      <ChannelList />
      <ChatArea />
      {showUserList && <MemberList />}
    </Flex>
  );
}
