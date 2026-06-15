import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createGroupConversation } from "@/store/conversationsSlice";
import UserSelectItem from "@/components/ui/user/UserSelectItem";
import { useNotification } from "@/hooks/useNotification";
import SearchBar from "../../ui/search/SearchBar";
import { getFriends } from "@/store/relationshipSlice";

const ModalCreateGroup = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const { friends, loading } = useSelector((state) => state.relationship);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [groupName, setGroupName] = useState("");

  const notification = useNotification();

  useEffect(() => {
    dispatch(getFriends());
  }, []);

  // Tìm kiếm bạn bè khi searchText thay đổi
  // useEffect(() => {
  //   const query = searchText.trim();

  //   const handler = setTimeout(() => {
  //     fetchUsers(query);
  //   }, 400);

  //   return () => clearTimeout(handler);
  // }, [searchText, dispatch]);

  // Hàm xử lý chọn/bỏ chọn bạn bè
  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        // Nếu đã chọn thì bỏ chọn
        return prev.filter((id) => id !== userId);
      } else {
        // Nếu chưa chọn thì thêm vào
        return [...prev, userId];
      }
    });
  };

  // Xử lý Tạo nhóm
  const handleCreateGroup = async () => {
    try {
      if (selectedUsers.length < 2) {
        notification.warning({
          message: "No members selected",
          description: "Please select at least two members to create a group.",
        });
        return;
      }

      if (groupName === "") {
        notification.warning({
          message: "Group name is empty",
          description: "Please enter a group name to create a group",
        });
        return;
      }

      await dispatch(
        createGroupConversation({ name: groupName, memberIds: selectedUsers })
      ).unwrap();

      setSelectedUsers([]);
      setGroupName("");
      setSearchText("");
      onCancel(null);
    } catch (error) {
      notification.error({
        message: "Tạo nhóm thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      width="min(calc(100vw - 2rem), 31.25rem)"
      onOk={handleCreateGroup}
      confirmLoading={loading}
      okText="Tạo"
      cancelText="Hủy"
      styles={{
        content: {
          padding: 0,
        },
        footer: {
          margin: 0,
          padding: 16,
        },
      }}
      centered
    >
      <div className="h-[70vh] flex flex-col">
        <header className="h-12 px-4 flex items-center border-b border-[var(--color-border)]">
          <h2 className="text-[var(--color-text-primary)] text-base font-semibold">
            Tạo nhóm chat
          </h2>
        </header>

        <section className="flex-1 min-h-0 flex flex-col gap-2 px-4 mt-2">
          {/* Input */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-[var(--color-surface)] hover:bg-[var(--color-hover)] active:bg-[var(--color-active)] border border-[var(--color-border)] rounded-full cursor-pointer">
              <Camera size={26} />
            </div>

            <div className="min-w-0 flex-1 p-2 text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] focus-within:border-blue-500">
              <input
                placeholder="Nhập tên nhóm..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full placeholder-[var(--color-text-secondary)]"
              />
            </div>
          </div>

          {/* Search */}
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Tìm kiếm..."
          />

          {/* User List */}
          <ul className="flex-1 min-h-0 space-y-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="w-full text-center mt-8">
                <Spin />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                Không tìm thấy kết quả
              </div>
            ) : (
              friends.map((user) => (
                <UserSelectItem
                  key={user._id}
                  user={user}
                  isSelected={selectedUsers.includes(user._id)}
                  onToggle={() => toggleUser(user._id)}
                />
              ))
            )}
          </ul>
        </section>
      </div>
    </Modal>
  );
};

export default ModalCreateGroup;
