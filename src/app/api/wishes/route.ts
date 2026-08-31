import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Lấy danh sách ảnh/lời chúc (Có áp dụng phân quyền Visibility)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // ID của VIP user (nếu đã đăng nhập)
    
    // Lấy toàn bộ wishes kèm thông tin user (Join bảng vip_users)
    const { data, error } = await supabase
      .from("wishes_gallery")
      .select(`
        *,
        vip_users (
          google_name,
          google_avatar,
          claimed_guest_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET wishes error:", error);
      return NextResponse.json({ success: false, error: "Lỗi database" }, { status: 500 });
    }

    // Áp dụng Logic Phân Quyền (RBAC)
    const filtered = (data || []).filter((wish: any) => {
      // 1. Nếu là người đăng bài -> Luôn luôn được xem bài của mình (dù pending hay private)
      if (userId && wish.vip_user_id === userId) return true;
      
      // 2. Bài của người khác -> Bắt buộc phải được duyệt ('approved')
      if (wish.status !== 'approved') return false;
      
      // 3. Phân quyền mức độ hiển thị (Visibility Scope)
      if (wish.visibility === 'private') return false; // Đã check bài của chính mình ở trên
      if (wish.visibility === 'vip_only' && !userId) return false; // Chỉ Guest (không đăng nhập) thì bị chặn
      
      return true;
    }).map((wish: any) => {
      // 4. Nếu gửi ẩn danh, che tên người gửi đối với mọi người (kể cả chính họ trên giao diện public để họ an tâm)
      if (wish.visibility === 'anonymous') {
        return {
          ...wish,
          vip_users: {
            ...wish.vip_users,
            google_name: "Ẩn Danh",
            claimed_guest_name: "Khách mời ẩn danh"
          }
        };
      }
      return wish;
    });

    return NextResponse.json({ success: true, data: filtered });
  } catch (error) {
    console.error("GET wishes error:", error);
    return NextResponse.json({ success: false, error: "Lỗi tải ảnh/lời chúc" }, { status: 500 });
  }
}

// POST: Gửi ảnh/lời chúc mới
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vipUserId, message, visibility } = body;

    if (!vipUserId || !message) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin!" }, { status: 400 });
    }

    // Kiểm tra giới hạn 3 lời chúc
    const { count, error: countError } = await supabase
      .from("wishes_gallery")
      .select("*", { count: "exact", head: true })
      .eq("vip_user_id", vipUserId);

    if (countError) {
      console.error("Count wishes error:", countError);
      return NextResponse.json({ success: false, error: "Lỗi kiểm tra giới hạn" }, { status: 500 });
    }

    if (count !== null && count >= 3) {
      return NextResponse.json({ success: false, error: "Bạn chỉ được gửi tối đa 3 lời chúc thôi nha!" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("wishes_gallery")
      .insert({
        vip_user_id: vipUserId,
        message: message || "",
        status: "pending",
        visibility: visibility || "public",
        is_featured: false
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert wish error:", error);
      return NextResponse.json({ success: false, error: "Lỗi Database", details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: "Đã gửi lời chúc thành công!" });
  } catch (error) {
    console.error("POST wishes error:", error);
    return NextResponse.json({ success: false, error: "Lỗi lưu lời chúc" }, { status: 500 });
  }
}
