import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ADMIN_CONFIG } from "@/config/admin";

export interface VipUserItem {
  id: string;
  email: string;
  googleName: string;
  googleAvatar: string;
  claimedGuestName: string;
  status: "pending" | "approved" | "rejected";
  role?: "user" | "admin";
  createdAt: string;
  approvedAt?: string;
  note?: string;
}

const dataFilePath = path.join(process.cwd(), "src", "data", "vip_users.json");

function readVipUsers(): VipUserItem[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading vip_users.json:", e);
  }
  return [];
}

function writeVipUsers(users: VipUserItem[]): boolean {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing vip_users.json:", e);
    return false;
  }
}

// GET: Kiểm tra trạng thái VIP của email hoặc Lấy danh sách cho Admin
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const pin = request.headers.get("x-admin-pin");

  const users = readVipUsers();

  // 1. Kiểm tra trạng thái của 1 email cụ thể (Client-side check)
  if (email) {
    const found = users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (found) {
      return NextResponse.json({ success: true, user: found });
    }
    return NextResponse.json({ success: true, user: null, status: "not_registered" });
  }

  // 2. Lấy toàn bộ danh sách (Admin Only)
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: users });
}

// POST: Người dùng gửi yêu cầu đăng ký VIP qua Google
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, googleName, googleAvatar, claimedGuestName } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ success: false, error: "Email không được để trống!" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let users = readVipUsers();

    // Kiểm tra xem email đã tồn tại chưa
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (existingIndex >= 0) {
      const existingUser = users[existingIndex];
      // Nếu đã được approved trước đó, giữ nguyên quyền approved
      if (existingUser.status === "approved") {
        return NextResponse.json({ 
          success: true, 
          user: existingUser, 
          message: "Tài khoản của bạn đã được duyệt VIP!" 
        });
      }

      // Cập nhật lại thông tin mới nhất và giữ trạng thái pending
      users[existingIndex] = {
        ...existingUser,
        googleName: googleName || existingUser.googleName,
        googleAvatar: googleAvatar || existingUser.googleAvatar,
        claimedGuestName: claimedGuestName || existingUser.claimedGuestName,
      };
      writeVipUsers(users);

      return NextResponse.json({ 
        success: true, 
        user: users[existingIndex], 
        message: "Yêu cầu của bạn đang chờ Dũng duyệt!" 
      });
    }

    // Tạo yêu cầu mới
    const newUser: VipUserItem = {
      id: `vip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      googleName: googleName || cleanEmail.split("@")[0],
      googleAvatar: googleAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      claimedGuestName: claimedGuestName || "Khách mời",
      status: "pending",
      role: "user",
      createdAt: new Date().toISOString(),
    };

    users = [newUser, ...users];
    writeVipUsers(users);

    return NextResponse.json({ 
      success: true, 
      user: newUser, 
      message: "Đã gửi yêu cầu cấp quyền VIP tới Dũng thành công!" 
    });
  } catch (e) {
    console.error("Error creating VIP user:", e);
    return NextResponse.json({ success: false, error: "Lỗi xử lý yêu cầu!" }, { status: 500 });
  }
}

// PATCH: Admin Duyệt / Từ chối / Đổi trạng thái VIP
export async function PATCH(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, note, claimedGuestName } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Thiếu ID hoặc Status" }, { status: 400 });
    }

    const users = readVipUsers();
    const targetIdx = users.findIndex((u) => u.id === id);

    if (targetIdx === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy người dùng!" }, { status: 404 });
    }

    users[targetIdx] = {
      ...users[targetIdx],
      status,
      note: note !== undefined ? note : users[targetIdx].note,
      claimedGuestName: claimedGuestName !== undefined ? claimedGuestName : users[targetIdx].claimedGuestName,
      approvedAt: status === "approved" ? new Date().toISOString() : undefined,
    };

    writeVipUsers(users);

    return NextResponse.json({ success: true, data: users[targetIdx] });
  } catch (e) {
    console.error("Error updating VIP user:", e);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật!" }, { status: 500 });
  }
}

// DELETE: Admin Xóa tài khoản VIP
export async function DELETE(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Thiếu ID người dùng" }, { status: 400 });
  }

  let users = readVipUsers();
  users = users.filter((u) => u.id !== id);
  writeVipUsers(users);

  return NextResponse.json({ success: true, message: "Đã xóa tài khoản VIP!" });
}
