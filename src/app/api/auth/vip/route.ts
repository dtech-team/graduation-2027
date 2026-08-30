import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

// Chuyển đổi dữ liệu từ Supabase sang dạng camelCase của client
function formatUser(row: any): VipUserItem {
  return {
    id: row.id,
    email: row.email,
    googleName: row.google_name,
    googleAvatar: row.google_avatar,
    claimedGuestName: row.claimed_guest_name,
    status: row.status,
    role: row.role,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    note: row.note
  };
}

// GET: Kiểm tra trạng thái VIP của email hoặc Lấy danh sách cho Admin
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const pin = request.headers.get("x-admin-pin");

  // 1. Kiểm tra trạng thái của 1 email cụ thể (Client-side check)
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const { data, error } = await supabase.from('vip_users').select('*').eq('email', cleanEmail).maybeSingle();
    
    if (data) {
      return NextResponse.json({ success: true, user: formatUser(data) });
    }
    return NextResponse.json({ success: true, user: null, status: "not_registered" });
  }

  // 2. Lấy toàn bộ danh sách (Admin Only)
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.from('vip_users').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Supabase GET vip_users error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, data: data.map(formatUser) });
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

    // Kiểm tra xem email đã tồn tại chưa
    const { data: existingUser } = await supabase.from('vip_users').select('*').eq('email', cleanEmail).maybeSingle();

    if (existingUser) {
      // Nếu đã được approved trước đó, giữ nguyên quyền approved
      if (existingUser.status === "approved") {
        return NextResponse.json({ 
          success: true, 
          user: formatUser(existingUser), 
          message: "Tài khoản của bạn đã được duyệt VIP!" 
        });
      }

      // Cập nhật lại thông tin mới nhất và giữ trạng thái pending
      const { data: updated, error } = await supabase.from('vip_users')
        .update({
          google_name: googleName || existingUser.google_name,
          google_avatar: googleAvatar || existingUser.google_avatar,
          claimed_guest_name: claimedGuestName || existingUser.claimed_guest_name,
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
      
      return NextResponse.json({ 
        success: true, 
        user: formatUser(updated), 
        message: "Yêu cầu của bạn đang chờ Dũng duyệt!" 
      });
    }

    // Tạo yêu cầu mới
    const { data: newUser, error } = await supabase.from('vip_users')
      .insert({
        email: cleanEmail,
        google_name: googleName || cleanEmail.split("@")[0],
        google_avatar: googleAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        claimed_guest_name: claimedGuestName || "Khách mời",
        status: "pending",
        role: "user"
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      user: formatUser(newUser), 
      message: "Đã gửi yêu cầu cấp quyền VIP tới Dũng thành công!" 
    });
  } catch (e: any) {
    console.error("Error creating VIP user:", e);
    const errorMsg = e.message || (typeof e === 'object' ? JSON.stringify(e) : "Lỗi xử lý yêu cầu!");
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
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

    const updates: any = { status };
    if (note !== undefined) updates.note = note;
    if (claimedGuestName !== undefined) updates.claimed_guest_name = claimedGuestName;
    if (status === "approved") updates.approved_at = new Date().toISOString();

    const { data, error } = await supabase.from('vip_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: formatUser(data) });
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

  const { error } = await supabase.from('vip_users').delete().eq('id', id);
  if (error) {
    console.error("Supabase delete vip_user error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Đã xóa tài khoản VIP!" });
}
