import React, { useMemo, useState } from "react";
import { Search, CornerUpLeft } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { SlNote } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers } from "@/features/user/userSlice";
import { debounce } from "lodash";

// Mock data
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

const ConversationList = ({ activeChat, handleSelectChat }) => {
  const dispatch = useDispatch();
  /** Search */
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { searchResults, loading } = useSelector((state) => state.user);
  const [keyword, setKeyword] = useState("");

  // Tối ưu tần suất gọi api search
  const debouncedSearch = useMemo(
    () => debounce((val) => dispatch(searchUsers(val)), 500),
    [dispatch]
  );

  // Xử lý search user
  const handleSearch = (e) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };

  // Xử lý khi focus search
  const handleFocus = () => {
    setIsSearchFocused(true);
    if (!keyword.trim()) {
      dispatch(searchUsers("")); // keyword rỗng => trả danh sách gợi ý
    }
  };

  return (
    <section
      className={`flex-1 flex flex-col bg-[var(--bg-primary)] rounded-lg
      ${activeChat ? "hidden" : "flex"} md:flex`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-[var(--color-text-primary)]">
        <h2 className="font-bold text-2xl">Chat</h2>
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
      <div className="px-4 pb-3 flex items-center gap-2">
        {isSearchFocused && (
          <button
            onClick={() => setIsSearchFocused(false)}
            className="flex items-center justify-center w-9 h-9 rounded-full 
            bg-[var(--bg-gray)] hover:bg-[var(--bg-hover-primary)] 
            text-[var(--color-text-primary)] transition-colors"
          >
            <CornerUpLeft className="w-5 h-5" />
          </button>
        )}
        <div
          className="flex-1 flex items-center gap-2 
          text-[var(--color-text-secondary)] 
          rounded-3xl bg-[var(--bg-gray)] px-4 py-1 transition-all duration-200"
        >
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm trên Messenger"
            className="placeholder:text-[var(--color-text-secondary)] focus:outline-none bg-transparent flex-1"
            onFocus={handleFocus}
            onBlur={() => setIsSearchFocused(false)}
            value={keyword}
            onClick={handleSearch}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        {isSearchFocused ? (
          <div className="text-[var(--color-text-secondary)]">
            <p className="text-sm mb-2">Gợi ý liên hệ</p>
            {loading && <p>Kết quả tìm kiếm cho {keyword}</p>}
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[var(--bg-hover-secondary)] transition"
                onClick={() => handleSelectChat(user._id)}
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-[var(--color-text-primary)] font-medium">
                  {user.username}
                </span>
              </div>
            ))}
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition hover:bg-[var(--bg-hover-secondary)]"
              onClick={() => handleSelectChat(item.id)}
            >
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
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ConversationList;
