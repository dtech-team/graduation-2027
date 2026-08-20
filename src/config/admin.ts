/**
 * CẤU HÌNH ADMIN
 * Mã PIN được đọc từ biến môi trường process.env.ADMIN_PIN (.env.local)
 * Không bao giờ bị lộ khi commit code lên GitHub.
 */
export const ADMIN_CONFIG = {
  get pin(): string {
    return process.env.ADMIN_PIN || "2027";
  },
};
