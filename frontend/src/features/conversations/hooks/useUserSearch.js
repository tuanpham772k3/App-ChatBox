// src/features/chat/hooks/useUserSearch.js
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchUsers } from "@/features/user/userSlice";
import useDebounce from "@/hooks/useDebounce";

const useUserSearch = () => {
  const dispatch = useDispatch();
  const { searchResults, loading } = useSelector((state) => state.user);

  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Tối ưu tần suất gọi api search
  const debouncedSearch = useDebounce(
    (val) => {
      dispatch(searchUsers(val));
    },
    500,
    [dispatch]
  );

  // Xử lý search user
  const handleSearch = (value) => {
    setKeyword(value);
    debouncedSearch(value);
  };

   // Xử lý search user
  const handleFocus = () => {
    setIsFocused(true);

    // keyword rỗng => trả danh sách gợi ý ban đầu
    if (!keyword.trim()) {
      dispatch(searchUsers("")); 
    }
  };

  // Đặt lại state về mặc đinh
  const resetSearch = () => {
    setKeyword("");
    setIsFocused(false);
  };

  return {
    keyword,
    isFocused,
    loading,
    searchResults,
    handleSearch,
    handleFocus,
    resetSearch,
    setIsFocused,
    setKeyword,
  };
};

export default useUserSearch;
