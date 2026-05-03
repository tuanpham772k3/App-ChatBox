import React, { useEffect, useState } from "react";
import { Button, Modal, Spin } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import FriendItem from "@/components/ui/member/FriendItem";
import { searchUsers } from "@/store/userSlice";
import { useNotification } from "@/hooks/useNotification";
import { addMemberToGroup } from "@/store/conversationsSlice";
import SearchBar from "../ui/search/SearchBar";

const ModalAddMembers = ({ isOpen, onCancel, conversationId }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
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
      width="min(calc(100vw - 2rem), 25rem)"
      centered
      closeIcon={<CloseOutlined style={{ color: "var(--color-text-secondary)" }} />}
      styles={{
        content: {
          backgroundColor: "var(--color-app)",
          padding: 0,
        },
      }}
    >
      {/* ====== Header ====== */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
          Thêm thành viên
        </h2>
      </div>
      {/* ====== Body ====== */}
      <div className="flex flex-col gap-2 p-4">
        {/* Search */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder={"Tìm kiếm thành viên..."}
        />

        {/* Friends List */}
        <div className="max-h-[min(60vh,25rem)] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          ) : results.length === 0 ? (
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
      {/* ====== Footer ====== */}
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
