import React from "react";
import { Sparkles } from "lucide-react";

const ChatEmptyState = () => {
  return (
    <div className="hidden md:flex flex-1 min-w-0 bg-gradient-to-br from-[var(--color-app)] via-[var(--color-app)] to-blue-50/30 dark:to-gray-800/50 items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Header */}
        <header className="mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Sparkles size={18} className="text-blue-500" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-text-secondary)] opacity-60">
              Welcome
            </span>
            <Sparkles size={18} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-[var(--color-text-primary)] mb-3">
            Chào mừng đến với{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Messages
            </span>
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-xs mx-auto opacity-80">
            Trải nghiệm trò chuyện cùng người thân, bạn bè được bảo mật chặt chẽ.
          </p>
        </header>

        {/* Static illustration */}
        <div className="relative group flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img
            src="https://i.pinimg.com/1200x/29/dd/db/29dddbb74db0c68adc5358271281e03a.jpg"
            alt="Chat illustration"
            className="relative w-64 h-64 object-cover rounded-3xl shadow-lg transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>

        {/* Bottom hint */}
        <p className="text-xs text-[var(--color-text-secondary)] opacity-40 mt-10 animate-pulse">
          Chọn một cuộc trò chuyện để bắt đầu
        </p>
      </div>
    </div>
  );
};

export default ChatEmptyState;
