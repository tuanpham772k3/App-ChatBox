import React from "react";
import { Carousel } from "antd";
import { MessageCircle, Users, ShieldCheck } from "lucide-react";

const slides = [
  {
    icon: <MessageCircle size={48} />,
    title: "Trò chuyện tức thì",
    description: "Gửi và nhận tin nhắn theo thời gian thực.",
  },
  {
    icon: <Users size={48} />,
    title: "Nhóm linh hoạt",
    description: "Tạo nhóm, thêm thành viên, quản lý dễ dàng.",
  },
  {
    icon: <ShieldCheck size={48} />,
    title: "Bảo mật & riêng tư",
    description: "Tin nhắn được bảo vệ và kiểm soát truy cập.",
  },
];

const ChatEmptyState = () => {
  return (
    <div className="hidden md:flex flex-1 min-w-0 bg-[var(--color-app)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-6">
          <h1 className="text-2xl">Chào mừng đến với Messages</h1>
          <p>
            Trải nghiệm trò chuyện cùng người thân, bạn bè được bảo mật chặt chẽ cho bạn.
          </p>
        </header>
        <Carousel arrows infinite={true} autoplay speed={1000}>
          {slides.map((slide, index) => (
            <div key={index}>
              <div className="flex flex-col items-center text-center gap-4 py-10">
                <div className="text-[var(--color-text-secondary)]">{slide.icon}</div>
                <h2 className="text-lg font-semibold">{slide.title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default ChatEmptyState;
