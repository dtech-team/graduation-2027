import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_CONFIG } from "@/config/admin";

export async function GET(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

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

  if (error) return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, isFeatured, visibility } = body;

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (isFeatured !== undefined) updates.is_featured = isFeatured;
    if (visibility !== undefined) updates.visibility = visibility;

    const { data, error } = await supabase
      .from("wishes_gallery")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH admin wishes error:", error);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Thiếu ID" }, { status: 400 });
  }

  const { error } = await supabase.from("wishes_gallery").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: "Lỗi xoá" }, { status: 500 });

  return NextResponse.json({ success: true, message: "Đã xoá ảnh/lời chúc" });
}
