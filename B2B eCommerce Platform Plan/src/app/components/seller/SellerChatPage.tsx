import { ChatPage } from '../shared/ChatPage';

export function SellerChatPage() {
  return <ChatPage breadcrumbPrefix={{ label: 'Kênh người bán', href: '/seller' }} />;
}
