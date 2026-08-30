import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_CONFIG } from "@/config/admin";
import { GuestItem, SECRET_GUEST_LIST } from "@/config/guests";

// Format row to GuestItem
function formatGuest(row: any): GuestItem {
  return {
    id: row.id,
    name: row.name,
    aliases: row.aliases || [],
    pronoun: row.pronoun,
    relationship: row.relationship,
    message: row.message,
    status: row.status,
    rsvpTime: row.rsvp_time,
    guestNote: row.guest_note
  };
}

// Chèn khách mặc định nếu DB trống
async function ensureDefaultGuests() {
  const { data, error } = await supabase.from('guests').select('id').limit(1);
  if (error || !data || data.length === 0) {
    const defaultGuests = SECRET_GUEST_LIST.map(g => ({
      id: g.id,
      name: g.name,
      aliases: g.aliases,
      pronoun: g.pronoun,
      relationship: g.relationship,
      message: g.message,
      status: g.status || 'pending'
    }));
    await supabase.from('guests').insert(defaultGuests);
  }
}

// GET: Lấy danh sách khách mời (hoặc xác thực PIN)
export async function GET(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  const isVerifyOnly = request.headers.get("x-verify-pin");

  if (isVerifyOnly) {
    if (pin === ADMIN_CONFIG.pin) {
      return NextResponse.json({ success: true, verified: true });
    }
    return NextResponse.json({ success: false, error: "Mã PIN không đúng!" }, { status: 401 });
  }

  // Tự động chèn dữ liệu mẫu nếu DB trống
  await ensureDefaultGuests();

  const { data, error } = await supabase.from('guests').select('*');
  
  if (error) {
    console.error("Supabase GET guests error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, data: (data || []).map(formatGuest) });
}

// POST: Thêm mới / Cập nhật khách mời / Nhập hàng loạt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = request.headers.get("x-admin-pin") || body.pin;

    if (pin !== ADMIN_CONFIG.pin) {
      return NextResponse.json({ success: false, error: "Mã PIN Admin không chính xác!" }, { status: 401 });
    }

    // 1. Nhập hàng loạt (Batch Import)
    if (Array.isArray(body.batchGuests)) {
      const newItems = body.batchGuests.map((g: Partial<GuestItem>, idx: number) => ({
        id: `g-${Date.now()}-${idx}`,
        name: (g.name || "").trim(),
        aliases: g.aliases || [(g.name || "").toLowerCase().trim()],
        pronoun: g.pronoun || "Bạn",
        relationship: g.relationship || "Bạn bè",
        message: g.message || "",
        status: "pending"
      })).filter((g: any) => g.name.length > 0);

      const { error } = await supabase.from('guests').insert(newItems);
      if (error) throw error;
      
      const { data: allGuests } = await supabase.from('guests').select('*');
      return NextResponse.json({ 
        success: true, 
        count: newItems.length, 
        data: (allGuests || []).map(formatGuest) 
      });
    }

    // 2. Thêm hoặc sửa 1 khách
    const { name, pronoun, relationship, message, aliases, id, status, rsvpTime, guestNote } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên khách mời không được để trống!" }, { status: 400 });
    }

    if (id) {
      // Sửa
      const updates: any = {
        name: name.trim(),
        pronoun: pronoun || "Bạn",
        relationship: relationship || "Bạn bè",
        message: message || "",
        aliases: aliases || [name.toLowerCase().trim()],
      };
      if (status !== undefined) updates.status = status;
      if (rsvpTime !== undefined) updates.rsvp_time = rsvpTime;
      if (guestNote !== undefined) updates.guest_note = guestNote;

      const { error } = await supabase.from('guests').update(updates).eq('id', id);
      if (error) throw error;
    } else {
      // Thêm mới
      const { error } = await supabase.from('guests').insert({
        id: `g-${Date.now()}`,
        name: name.trim(),
        pronoun: pronoun || "Bạn",
        relationship: relationship || "Bạn bè",
        message: message || "",
        aliases: aliases && aliases.length > 0 ? aliases : [name.toLowerCase().trim()],
        status: status || "pending",
        rsvp_time: rsvpTime || null,
        guest_note: guestNote || null,
      });
      if (error) throw error;
    }

    const { data: allGuests, error: getError } = await supabase.from('guests').select('*');
    if (getError) throw getError;

    return NextResponse.json({ success: true, data: (allGuests || []).map(formatGuest) });
  } catch (error) {
    console.error("API POST error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xử lý máy chủ!" }, { status: 500 });
  }
}

// DELETE: Xóa khách mời
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const pin = request.headers.get("x-admin-pin") || searchParams.get("pin");

    if (pin !== ADMIN_CONFIG.pin) {
      return NextResponse.json({ success: false, error: "Mã PIN Admin không chính xác!" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID khách mời!" }, { status: 400 });
    }

    const { error } = await supabase.from('guests').delete().eq('id', id);
    if (error) throw error;

    const { data: allGuests } = await supabase.from('guests').select('*');
    return NextResponse.json({ success: true, data: (allGuests || []).map(formatGuest) });
  } catch (error) {
    console.error("API DELETE error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xóa khách mời!" }, { status: 500 });
  }
}
