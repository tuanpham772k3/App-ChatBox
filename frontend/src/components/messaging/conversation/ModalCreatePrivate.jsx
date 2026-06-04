import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Modal, Spin } from "antd";
import UserSelectItem from "@/components/ui/user/UserSelectItem";
import SearchBar from "../../ui/search/SearchBar";
import { createPrivateConversation } from "../../../store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";
import userApi from "@/services/userApi";

const ModalCreatePrivate = ({ isOpen, onCancel }) => {
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchText, setSearchText] = useState("");

  const notification = useNotification();

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const users = await userApi.getUsers(query);
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

  const toggleUser = (userId) => {
    setSelectedUser((prev) => (prev === userId ? "" : userId));
  };

  const handleCreatePrivate = async () => {
    try {
      if (selectedUser.length === 0) {
        notification.warning({
          message: "No members selected",
          description: "Please select one member to create a private chat.",
        });
        return;
      }

      await dispatch(createPrivateConversation(selectedUser)).unwrap();

      setSelectedUser("");
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
      <div className="max-h-[60vh] flex flex-col gap-2 border-y-1 border-[var(--color-border)] py-4">
        {/* Search */}
        <SearchBar
          value={searchText}
          onChange={setSearchText}
          placeholder="Tìm kiếm thành viên..."
        />

        {/* User List */}
        <ul className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <span className="w-full text-center mt-8">
              <Spin />
            </span>
          ) : results.length === 0 ? (
            <span className="text-center mt-8 text-[var(--color-text-secondary)]">
              Không có người dùng nào
            </span>
          ) : (
            results.map((user) => (
              <UserSelectItem
                key={user._id}
                user={user}
                isSelected={selectedUser === user._id}
                onToggle={() => toggleUser(user._id)}
              />
            ))
          )}
        </ul>
      </div>
    </Modal>
  );
};

export default ModalCreatePrivate;
