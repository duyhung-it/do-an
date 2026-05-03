import { ChatPage } from '../shared/ChatPage';

export function BuyerChatPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ChatPage breadcrumbPrefix={{ label: 'Trang chủ', href: '/' }} />
    </div>
  );
}
