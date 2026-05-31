import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { Camera } from "lucide-react";
import { useDispatch } from "react-redux";
import { createGroupConversation } from "@/store/conversationsSlice";
import UserSelectItem from "@/components/ui/user/UserSelectItem";
import { useNotification } from "@/hooks/useNotification";
import SearchBar from "../ui/search/SearchBar";
import userApi from "@/services/userApi";

const ModalCreateGroup = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [groupName, setGroupName] = useState("");

  const notification = useNotification();

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const users = await userApi.searchUsers(query);
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

  // Xử lý khi nhấn nút "Tạo nhóm"
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

      // Create conversation
      await dispatch(
        createGroupConversation({ name: groupName, memberIds: selectedUsers })
      ).unwrap();

      // Reset state
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
      title="Tạo nhóm chat"
    >
      <div className="space-y-4 border-y-1 border-[var(--color-border)] py-4">
        {/* Input */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center border border-[var(--color-border)] rounded-full cursor-pointer">
            <Camera size={26} />
          </div>
          <div className="min-w-0 flex-1 sm:pe-20 p-2 text-[var(--color-text-primary)] border-b-2 border-[var(--color-border)] focus-within:border-blue-500">
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
          placeholder={"Tìm kiếm thành viên..."}
        />

        {/* User List */}
        <ul className="max-h-[min(60vh,25rem)] flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          ) : (
            results.length === 0 && (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                Không tìm thấy kết quả
              </div>
            )
          )}

          {results.map((user) => (
            <UserSelectItem
              key={user._id}
              user={user}
              isSelected={selectedUsers.includes(user._id)}
              onToggle={() => toggleUser(user._id)}
            />
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default ModalCreateGroup;
