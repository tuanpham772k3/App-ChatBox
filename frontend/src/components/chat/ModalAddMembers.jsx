import React, { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { Search } from "lucide-react";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import FriendItem from "@/components/ui/member/FriendItem";
import { searchUsers } from "@/store/userSlice";
import { useNotification } from "@/hooks/useNotification";
import { addMemberToGroup } from "@/store/conversationsSlice";

const ModalAddMembers = ({ isOpen, onCancel, conversationId }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchText, setSearchText] = useState("");

  const notification = useNotification();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await dispatch(searchUsers("")).unwrap();
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

  // Lấy danh sách user
  useEffect(() => {
    fetchUsers();
  }, [dispatch]);

  // Tìm kiếm bạn bè khi searchText thay đổi
  useEffect(() => {
    const query = searchText.trim();

    const handler = setTimeout(() => {
      fetchUsers(query);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, dispatch]);

  // Hàm xử lý chọn/bỏ chọn bạn bè
  const toggleFriend = (friendId) => {
    // Nếu click lại người đã chọn => bỏ chọn
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  const handleAddMembersToGroup = async () => {
    try {
      if (selectedFriends.length === 0) {
        notification.warning({
          message: "No members selected",
          description: "Please select at least one member to add to the group",
        });
        return;
      }

      await dispatch(
        addMemberToGroup({ conversationId, memberIds: selectedFriends })
      ).unwrap();

      setSelectedFriends([]);
      setSearchText("");
      onCancel();
    } catch (error) {
      notification.error({
        message: "Thêm thành viên thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      closeIcon={<CloseOutlined style={{ color: "var(--color-text-secondary)" }} />}
      styles={{
        content: {
          backgroundColor: "var(--color-app)",
          padding: 0,
        },
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
          Thêm thành viên
        </h2>
      </div>
      {/* Body */}
      <div className="flex flex-col px-4">
        {/* Ô tìm kiếm */}
        <div className="py-4 border-b border-[var(--color-border)]">
          <div className="relative flex items-center">
            <Search className="absolute w-4 h-4 left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] z-10" />
            <div className="flex-1 text-[var(--color-text-primary)]">
              <input
                placeholder="Nhập tên"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-[var(--color-chat)] hover:bg-[var(--color-hover-soft)] focus:bg-[var(--color-hover-soft)] 
              px-10 py-2 rounded-3xl placeholder-[var(--color-text-secondary)] border border-[var(--color-border)] focus-within:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Danh sách bạn bè */}
        <div className="h-[400px] overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          )}
          {results.length === 0 && !loading ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">
              Không tìm thấy kết quả
            </div>
          ) : (
            results.map((friend) => (
              <FriendItem
                key={friend._id}
                friend={friend}
                isSelected={selectedFriends.includes(friend._id)}
                onToggle={() => toggleFriend(friend._id)}
              />
            ))
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="p-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button onClick={onCancel}>Hủy</Button>
        <Button onClick={handleAddMembersToGroup} type="primary">
          Thêm
        </Button>
      </div>
    </Modal>
  );
};

export default ModalAddMembers;
