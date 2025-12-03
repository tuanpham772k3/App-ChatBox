// Hàm helper xử lý Show timestamp
export const showTimestamp = (previous, current) => {
  if (!previous) return true; // Tin đầu tiên luôn hiển thị

  //
  const p = new Date(previous);
  const c = new Date(current);

  const diffMin = (c - p) / 6000; // Khoảng cách giữa 2 tin - đổi sang phút

  const isNewDay = c.toDateString() !== p.toDateString(); // Kiểm tra ngày gửi tin
  return diffMin > 5 || isNewDay; // Nếu cách 5p hoặc khác ngày => hiển thị
};
