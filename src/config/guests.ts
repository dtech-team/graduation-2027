export type RSVPStatus = "attending" | "declined" | "pending";

export interface GuestItem {
  id: string;
  name: string; // Tên chuẩn hiển thị trên thiệp
  aliases?: string[]; // Các biến thể tên, biệt danh, tên không dấu
  pronoun: string; // Xưng hô (Bạn, Anh, Chị, Em, Mày, Cậu...)
  relationship: string; // Mối quan hệ (Bạn thân, Bạn Đại học, Đồng nghiệp, Gia đình...)
  message?: string; // Lời nhắn riêng cá nhân hóa dành cho khách mời này
  status?: RSVPStatus; // Trạng thái xác nhận tham gia: "attending" | "declined" | "pending"
  rsvpTime?: string; // Thời điểm khách bấm xác nhận (ISO date string)
  guestNote?: string; // Lời nhắn gửi lại cho Dũng khi RSVP
}

/**
 * DANH SÁCH KHÁCH MỜI BÍ MẬT (CHỈ CÓ BẠN CẤU HÌNH Ở ĐÂY)
 * Bạn có thể thêm, sửa, xóa danh sách bạn bè/người thân tùy thích.
 */
export const SECRET_GUEST_LIST: GuestItem[] = [
  {
    id: "guest-1",
    name: "Nguyễn Văn Minh",
    aliases: ["nguyen van minh", "minh nguyen", "minh", "van minh"],
    pronoun: "Bạn",
    relationship: "Bạn Thân",
    message: "Cảm ơn bạn đã luôn đồng hành cùng Dũng suốt những năm tháng thanh xuân đại học!",
  },
  {
    id: "guest-2",
    name: "Trần Thị Lan",
    aliases: ["tran thi lan", "lan tran", "lan"],
    pronoun: "Chị",
    relationship: "Đồng Nghiệp",
    message: "Rất vinh hạnh và mong được đón tiếp chị tại buổi lễ tốt nghiệp của em!",
  },
  {
    id: "guest-3",
    name: "Lê Hoàng Nam",
    aliases: ["le hoang nam", "nam le", "nam"],
    pronoun: "Anh",
    relationship: "Tiền Bối",
    message: "Cảm ơn anh đã luôn chỉ dẫn và giúp đỡ em trong suốt thời gian qua!",
  },
  {
    id: "guest-4",
    name: "Phạm Quỳnh Anh",
    aliases: ["pham quynh anh", "quynh anh", "quynh anh pham"],
    pronoun: "Bạn",
    relationship: "Bạn Đại Học",
    message: "Hẹn gặp bạn tại ngày lễ tốt nghiệp nhé, cùng nhau chụp thật nhiều ảnh đẹp nha!",
  },
  {
    id: "guest-5",
    name: "Trần Quang Dũng",
    aliases: ["tran quang dung", "quang dung", "dung tran", "dung"],
    pronoun: "Tôi",
    relationship: "Tân Cử Nhân",
    message: "Chào mừng bạn đến với ngày lễ tốt nghiệp trọng đại của Dũng!",
  },
];

/**
 * Hàm loại bỏ dấu tiếng Việt để so sánh tên thông minh
 */
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Tìm kiếm khách mời trong bất kỳ danh sách nào được truyền vào
 */
export function matchGuestInList(inputName: string, guestList: GuestItem[]): GuestItem | null {
  if (!inputName || !inputName.trim()) return null;

  const rawClean = inputName.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedInput = removeVietnameseTones(inputName);

  for (const guest of guestList) {
    // 1. So khớp chính xác tên chuẩn (có dấu & không phân biệt hoa thường)
    if (guest.name.toLowerCase().trim() === rawClean) {
      return guest;
    }

    // 2. So khớp tên chuẩn khi bỏ dấu tiếng Việt
    if (removeVietnameseTones(guest.name) === normalizedInput) {
      return guest;
    }

    // 3. So khớp các biến thể alias (nếu có cấu hình)
    if (guest.aliases && guest.aliases.length > 0) {
      for (const alias of guest.aliases) {
        if (
          alias.toLowerCase().trim() === rawClean ||
          removeVietnameseTones(alias) === normalizedInput
        ) {
          return guest;
        }
      }
    }
  }

  return null;
}

/**
 * Tìm kiếm khách mời trong danh sách bí mật mặc định
 */
export function findGuestByName(inputName: string): GuestItem | null {
  return matchGuestInList(inputName, SECRET_GUEST_LIST);
}

