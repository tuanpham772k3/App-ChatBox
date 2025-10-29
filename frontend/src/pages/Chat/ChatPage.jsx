import React from "react";
import {
    Archive,
    Menu,
    MessageCircle,
    MessageCircleMore,
    Search,
    Store,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { SlNote } from "react-icons/sl";

const list = [
    {
        id: 1,
        name: "Công nghệ thông tin",
        message:
            "Hà đã gửi 1 ảnh. a word that refers to a lung disease contracted from the inhalation of very fine silica particles, specifically from a volcano; medically, it is the same as silicosis.",
        time: "1 giờ",
        avatar: "/img/user1.jpg",
        unread: true,
    },
    {
        id: 2,
        name: "Nhà Hàng Hữu Phước",
        message: "Cuộc gọi video đã kết thúc.",
        time: "2 giờ",
        avatar: "/img/user2.jpg",
        unread: true,
    },
    {
        id: 3,
        name: "Anh Nưng",
        message: "Bạn: khả năng cũng sắp ngáp",
        time: "4 giờ",
        avatar: "/img/user3.jpg",
    },
    {
        id: 4,
        name: "AE xã hội",
        message: "Kim Ha: Mà nước đang lên",
        time: "5 giờ",
        avatar: "/img/user4.jpg",
    },
    {
        id: 5,
        name: "Huỳnh Xuân Quý",
        message: "Bạn: uh",
        time: "1 ngày",
        avatar: "/img/user5.jpg",
        online: true,
    },
];

const ChatPage = () => {
    return (
        <div className="w-full h-screen p-4 bg-[var(--bg-black)]">
            <div className="w-full h-full flex justify-center gap-4">
                {/* Sidebar */}
                <aside className="w-[44px] h-full flex flex-col justify-between text-[var(--color-text-secondary)]">
                    {/* TOP ICONS */}
                    <div className="flex flex-col items-center">
                        <button className="relative group w-[44px] h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-primary)]">
                            <MessageCircle className="w-5 h-5" />
                            <span className="absolute top-3 right-3 block w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
                        </button>

                        <button className="w-[44px] h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-primary)] ">
                            <Store className="w-5 h-5" />
                        </button>

                        <button className="w-[44px] h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-primary)]">
                            <MessageCircleMore className="w-5 h-5" />
                        </button>

                        <button className="w-[44px] h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-primary)]">
                            <Archive className="w-5 h-5" />
                        </button>

                        {/* Divider */}
                        <div className="w-8 h-[1px] bg-[var(--color-border)] my-6"></div>

                        {/* APP ICONS */}
                        <div className="flex flex-col items-center gap-3 mt-2">
                            {[
                                "../../assets/img/app1.jpg",
                                "/img/app2.png",
                                "/img/app3.png",
                                "/img/app4.png",
                                "/img/app5.png",
                                "/img/app6.png",
                            ].map((src, idx) => (
                                <img
                                    key={idx}
                                    src={src}
                                    alt=""
                                    className="w-9 h-9 rounded-lg object-cover hover:scale-110 transition-transform cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>

                    {/* BOTTOM ICONS */}
                    <div className="flex flex-col items-center gap-4 mb-4">
                        {/* Avatar user */}
                        <img
                            src="/img/user.jpg"
                            alt="user"
                            className="w-9 h-9 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
                        />

                        {/* Menu / Settings */}
                        <button className="rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors">
                            <Menu className="w-6 h-6 text-[var(--color-text-primary)]" />
                        </button>
                    </div>
                </aside>

                {/* Conversations List */}
                <section className="flex-1 flex flex-col bg-[var(--bg-primary)] rounded-lg">
                    {/* Header conversation */}
                    <div className="flex items-center justify-between px-4 py-3 text-[var(--color-text-primary)]">
                        {/* Text left */}
                        <h2 className="font-bold text-2xl">Chat</h2>
                        {/* Icon right */}
                        <div className="flex gap-3">
                            <button className="flex items-center rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors">
                                <FaFacebook className="w-5 h-5" />
                            </button>
                            <button className="flex items-center rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors">
                                <SlNote className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="px-4 pb-3">
                        <div className="w-full flex items-center gap-2 text-[var(--color-text-secondary)] rounded-3xl bg-[var(--bg-gray)] px-4 py-1">
                            <Search className="w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm trên Messenger"
                                className="placeholder:text-[var(--color-text-secondary)] focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex flex-col px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
                        {/* Items */}
                        {list.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition hover:bg-[var(--bg-hover-secondary)] "
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {item.online && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-black)] rounded-full"></span>
                                    )}
                                </div>

                                {/* Nội dung hội thoại + thời gian*/}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <h3 className="text-sm text-[var(--color-text-primary)] font-medium truncate">
                                        {item.name}
                                    </h3>
                                    <p
                                        className={`text-[var(--color-text-secondary)] ${
                                            item.unread
                                                ? "text-sm text-[var(--color-text-primary)]"
                                                : "text-xs text-[var(--color-text-secondary)]"
                                        } overflow-hidden text-ellipsis break-words line-clamp-1`}
                                    >
                                        {item.message}
                                        <span className="ml-1 text-[var(--color-text-secondary)] whitespace-nowrap">
                                            {item.time}
                                        </span>
                                    </p>
                                </div>

                                {/*trạng thái đọc */}
                                <div className="flex flex-col items-end text-xs text-[var(--color-text-secondary)]">
                                    {item.unread && (
                                        <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Chat Window */}
                <main className="flex-[2] bg-[var(--bg-primary)] flex flex-col rounded-lg overflow-hidden">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src="/img/user3.jpg"
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-primary)] rounded-full"></span>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[var(--color-text-primary)] font-semibold">
                                    Anh Nưng
                                </h3>
                                <span className="text-xs text-[var(--color-text-secondary)]">
                                    Đang hoạt động
                                </span>
                            </div>
                        </div>

                        {/* Action icons */}
                        <div className="flex items-center gap-3 text-[var(--color-text-primary)]">
                            <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.25 0a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 20.25v-7.5a2.25 2.25 0 012.25-2.25m11.25 0H6.75"
                                    />
                                </svg>
                            </button>
                            <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0H4.5z"
                                    />
                                </svg>
                            </button>
                            <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M6 6h12M6 12h12M6 18h12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
                        {/* Date Separator */}
                        <div className="flex justify-center">
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                22:34 T2
                            </span>
                        </div>

                        {/* Partner messages */}
                        <div className="flex items-end gap-2">
                            <img
                                src="/img/user3.jpg"
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex flex-col gap-1">
                                <div className="bg-[var(--bg-gray)] text-[var(--color-text-primary)] px-3 py-2 rounded-2xl rounded-tl-none max-w-xs">
                                    Mới lội vô quảng nam
                                </div>
                                <div className="bg-[var(--bg-gray)] text-[var(--color-text-primary)] px-3 py-2 rounded-2xl rounded-tl-none max-w-xs">
                                    Má nước ngang rốn 😢
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                23:10 T2
                            </span>
                        </div>

                        {/* Your messages */}
                        <div className="flex justify-end">
                            <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-tr-none max-w-xs">
                                Huế nhiều chỗ ngập tới nóc nhà 😢
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <div className="bg-blue-500 text-white px-3 py-2 rounded-2xl rounded-tr-none max-w-xs">
                                khả năng cũng sắp ngập
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                17:11 T3
                            </span>
                        </div>

                        <div className="flex items-end gap-2">
                            <img
                                src="/img/user3.jpg"
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="bg-[var(--bg-gray)] text-[var(--color-text-primary)] px-3 py-2 rounded-2xl rounded-tl-none max-w-xs">
                                Đn ngập ko
                            </div>
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border)]">
                        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M9 12h6m2 8a9 9 0 10-9-9 9 9 0 009 9z"
                                />
                            </svg>
                        </button>

                        <input
                            type="text"
                            placeholder="Aa"
                            className="flex-1 bg-[var(--bg-gray)] rounded-full px-4 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
                        />

                        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M14.752 11.168l-9.193-5.468A1 1 0 004 6.532v10.936a1 1 0 001.559.832l9.193-5.468a1 1 0 000-1.664z"
                                />
                            </svg>
                        </button>

                        <button className="text-blue-500 hover:text-blue-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M2.003 9.25a1 1 0 011.116-.993l13.75 1.5a1 1 0 010 1.986l-13.75 1.5A1 1 0 012.003 9.25z" />
                            </svg>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatPage;
