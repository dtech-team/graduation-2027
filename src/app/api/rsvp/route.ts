import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GuestItem, matchGuestInList, RSVPStatus } from "@/config/guests";

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

// GET: Lấy trạng thái RSVP của khách mời theo tên hoặc ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestName = searchParams.get("name");
    const guestId = searchParams.get("id");

    let matched: GuestItem | null = null;

    if (guestId) {
      const { data, error } = await supabase.from('guests').select('*').eq('id', guestId).maybeSingle();
      if (data && !error) matched = formatGuest(data);
    } else if (guestName) {
      // Lấy toàn bộ danh sách để áp dụng hàm tìm kiếm custom (bỏ dấu tiếng Việt, fuzzy match...)
      const { data, error } = await supabase.from('guests').select('*');
      if (data && !error) {
        const guests = data.map(formatGuest);
        matched = matchGuestInList(guestName, guests);
      }
    }

    if (!matched) {
      return NextResponse.json({ success: true, guest: null, status: "pending" });
    }

    return NextResponse.json({
      success: true,
      status: matched.status || "pending",
      rsvpTime: matched.rsvpTime || null,
      guestNote: matched.guestNote || "",
      guest: matched,
    });
  } catch (error) {
    console.error("API RSVP GET error:", error);
    return NextResponse.json({ success: false, error: "Lỗi máy chủ!" }, { status: 500 });
  }
}

// POST: Xác nhận hoặc thay đổi trạng thái tham gia (RSVP)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { guestName, guestId, status, guestNote } = body;

    if (!status || !["attending", "declined", "pending"].includes(status)) {
      return NextResponse.json({ success: false, error: "Trạng thái RSVP không hợp lệ!" }, { status: 400 });
    }

    let targetId = guestId;

    // Nếu không truyền lên ID, tìm lại ID qua thuật toán matchGuestInList
    if (!targetId && guestName) {
      const { data } = await supabase.from('guests').select('*');
      if (data) {
        const guests = data.map(formatGuest);
        const matched = matchGuestInList(guestName, guests);
        if (matched) {
          targetId = matched.id;
        }
      }
    }

    if (!targetId) {
      return NextResponse.json({ success: false, error: "Không tìm thấy khách mời trong danh sách!" }, { status: 404 });
    }

    // Cập nhật lên Supabase
    const updates: any = {
      status: status,
      rsvp_time: new Date().toISOString(),
    };
    if (typeof guestNote === "string") {
      updates.guest_note = guestNote.trim();
    }

    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('id', targetId)
      .select()
      .single();

    if (error) {
      console.error("Supabase RSVP update error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: formatGuest(data),
      message: status === "attending" ? "Xác nhận tham gia thành công!" : "Đã ghi nhận phản hồi vắng mặt!",
    });
  } catch (error) {
    console.error("API RSVP POST error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xử lý xác nhận tham gia!" }, { status: 500 });
  }
}
