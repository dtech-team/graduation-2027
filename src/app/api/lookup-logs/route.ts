import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_CONFIG } from "@/config/admin";

export interface LookupLogItem {
  id: string;
  inputName: string;
  matched: boolean;
  matchedGuestName?: string | null;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

// GET: Lấy danh sách nhật ký tra cứu (Admin Only)
export async function GET(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('lookup_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(500);

  if (error) {
    console.error("Supabase GET logs error:", error);
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }

  const formattedLogs: LookupLogItem[] = (data || []).map(log => ({
    id: log.id,
    inputName: log.input_name,
    matched: log.matched,
    matchedGuestName: log.matched_guest_name,
    timestamp: log.timestamp,
    userAgent: log.user_agent,
    ip: log.ip
  }));

  return NextResponse.json({ success: true, data: formattedLogs });
}

// POST: Ghi nhận 1 lượt tra cứu tên từ người dùng
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { inputName, matched, matchedGuestName } = body;

    if (!inputName || !inputName.trim()) {
      return NextResponse.json({ success: false, error: "Tên tra cứu không hợp lệ" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "Unknown Device";
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Localhost / Client";

    const { data, error } = await supabase
      .from('lookup_logs')
      .insert({
        input_name: inputName.trim(),
        matched: Boolean(matched),
        matched_guest_name: matchedGuestName || null,
        user_agent: userAgent.substring(0, 150),
        ip,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }

    const newLog: LookupLogItem = {
      id: data.id,
      inputName: data.input_name,
      matched: data.matched,
      matchedGuestName: data.matched_guest_name,
      timestamp: data.timestamp,
      userAgent: data.user_agent,
      ip: data.ip
    };

    return NextResponse.json({ success: true, data: newLog });
  } catch (e) {
    console.error("Error creating lookup log:", e);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}

// DELETE: Xóa 1 log hoặc xóa toàn bộ logs (Admin Only)
export async function DELETE(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const logId = searchParams.get("id");
  const clearAll = searchParams.get("clearAll");

  if (clearAll === "true") {
    // Supabase needs a filter to delete all safely, .neq on uuid is a good way
    const { error } = await supabase.from('lookup_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error("Supabase clear logs error:", error);
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ nhật ký!" });
  }

  if (logId) {
    const { error } = await supabase.from('lookup_logs').delete().eq('id', logId);
    if (error) {
      console.error("Supabase delete log error:", error);
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Đã xóa bản ghi tra cứu!" });
  }

  return NextResponse.json({ success: false, error: "Thiếu tham số xóa" }, { status: 400 });
}
