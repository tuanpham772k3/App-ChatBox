import { useEffect, useMemo } from "react";
import { debounce } from "lodash";

/**
 * Hook debounce có thể tái sử dụng cho nhiều logic khác nhau.
 * @param {Function} callback - Hàm cần debounce (ví dụ: gọi API, xử lý filter,...)
 * @param {number} delay - Thời gian trễ (ms)
 * @param {Array} deps - Các dependency để re-init debounce khi cần
 * @returns {Function} Hàm đã được debounce
 */
const useDebounce = (callback, delay, deps = []) => {
  // Gói callback vào debounce và chỉ tạo lại khi deps thay đổi
  const debouncedFn = useMemo(() => debounce(callback, delay), deps);

  // Cleanup để tránh memory leak khi component unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
};

export default useDebounce;
