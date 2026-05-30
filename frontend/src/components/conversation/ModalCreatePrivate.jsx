import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Spin } from "antd";
import FriendItem from "@/components/ui/member/FriendItem";
import SearchBar from "../ui/search/SearchBar";
import { searchUsers } from "@/store/userSlice";
import { createPrivateConversation } from "../../store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";

const ModalCreatePrivate = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [searchText, setSearchText] = useState("");

  const notification = useNotification();

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const users = await dispatch(searchUsers(query)).unwrap();
      setResults(users);
    } catch (error) {
      notification.error({
        message: "Không thể tải danh sách người dùng",
        description: error.message || "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    const query = searchText.trim();

    const handler = setTimeout(() => {
      fetchUsers(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, dispatch]);

  const toggleFriend = (friendId) => {
    setSelectedFriend((prev) => (prev === friendId ? "" : friendId));
  };

  const handleCreatePrivate = async () => {
    try {
      if (selectedFriend.length === 0) {
        notification.warning({
          message: "No members selected",
          description: "Please select one member to create a private chat.",
        });
        return;
      }

      await dispatch(createPrivateConversation(selectedFriend)).unwrap();

      setSelectedFriend("");
      setSearchText("");
      onCancel(null);
    } catch (error) {
      notification.error({
        message: "Tạo cuộc hội thoại thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      width="min(calc(100vw - 2rem), 25rem)"
      onOk={handleCreatePrivate}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      title="Tạo chat riêng tư"
    >
      <div className="space-y-4 border-y-1 border-[var(--color-border)] py-4">
        {/* Search */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Tìm kiếm thành viên..."
        />

        {/* Friends List */}
        <ul className="max-h-[min(60vh,25rem)] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <span className="w-full text-center mt-8">
              <Spin />
            </span>
          ) : (
            results.length === 0 && (
              <span className="text-center mt-8 text-[var(--color-text-secondary)]">
                Không có người dùng nào
              </span>
            )
          )}

          {results.map((friend) => (
            <FriendItem
              key={friend._id}
              friend={friend}
              isSelected={selectedFriend === friend._id}
              onToggle={() => toggleFriend(friend._id)}
            />
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default ModalCreatePrivate;
