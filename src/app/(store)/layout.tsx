import { AnnouncementBar } from "@/components/layout/announcement-bar"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChatbotWidget } from "@/components/chat/chatbot-widget"
import { WelcomePopup } from "@/components/layout/welcome-popup"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-40">
        <AnnouncementBar />
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
      <WelcomePopup />
    </>
  )
}
