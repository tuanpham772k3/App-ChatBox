import React, { useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { useDispatch } from "react-redux";
import SearchBar from "../../ui/search/SearchBar";
import UserSelectItem from "@/components/ui/user/UserSelectItem";
import { addMemberToGroup } from "@/store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";
import userApi from "@/services/userApi";

const ModalAddMembers = ({ isOpen, onCancel, conversationId }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

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

  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddMembersToGroup = async () => {
    try {
      if (selectedUsers.length === 0) {
        notification.warning({
          message: "No members selected",
          description: "Please select at least one member to add to the group",
        });
        return;
      }

      await dispatch(
        addMemberToGroup({ conversationId, memberIds: selectedUsers })
      ).unwrap();

      setSelectedUsers([]);
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
      width="min(calc(100vw - 2rem), 25rem)"
      onOk={handleAddMembersToGroup}
      confirmLoading={loading}
      okText="Thêm"
      cancelText="Hủy"
      title="Thêm thành viên"
    >
      <div className="max-h-[60vh] flex flex-col gap-2 border-y-1 border-[var(--color-border)] py-4">
        {/* Search */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder={"Tìm kiếm thành viên..."}
        />

        {/* User List */}
        <div className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="w-full text-center mt-8">
              <Spin />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">
              Không tìm thấy kết quả
            </div>
          ) : (
            results.map((user) => (
              <UserSelectItem
                key={user._id}
                user={user}
                isSelected={selectedUsers.includes(user._id)}
                onToggle={() => toggleUser(user._id)}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalAddMembers;
