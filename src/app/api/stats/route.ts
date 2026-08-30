import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEFAULT_STATS = {
  totalViews: 0,
  totalInvites: 0,
};

// Tính số lượng người online tự nhiên dựa trên thời gian thực
function getDynamicOnlineCount(): number {
  const hour = new Date().getHours();
  // Giờ cao điểm (8h - 23h) từ 3 - 8 người, ban đêm từ 1 - 3 người
  const base = hour >= 8 && hour <= 23 ? 4 : 2;
  const variance = Math.floor(Math.sin(Date.now() / 60000) * 2);
  return Math.max(1, base + variance);
}

// GET: Lấy thống kê lượt xem & online
export async function GET() {
  try {
    const { data, error } = await supabase.from('stats').select('*').eq('id', 1).single();
    
    if (error || !data) {
      return NextResponse.json({
        success: true,
        data: {
          totalViews: DEFAULT_STATS.totalViews,
          totalInvites: DEFAULT_STATS.totalInvites,
          onlineCount: getDynamicOnlineCount(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalViews: data.total_views,
        totalInvites: data.total_invites,
        onlineCount: getDynamicOnlineCount(),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
  }
}

// POST: Tăng lượt xem hoặc lượt tạo thiệp
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "view"; // "view" | "invite"

    // Lấy stats hiện tại
    const { data: currentStats } = await supabase.from('stats').select('*').eq('id', 1).single();
    
    let totalViews = currentStats ? currentStats.total_views : DEFAULT_STATS.totalViews;
    let totalInvites = currentStats ? currentStats.total_invites : DEFAULT_STATS.totalInvites;

    if (action === "invite") {
      totalInvites++;
    } else {
      totalViews++;
    }

    // Cập nhật lại stats
    const { data, error } = await supabase
      .from('stats')
      .upsert({ 
        id: 1, 
        total_views: totalViews, 
        total_invites: totalInvites, 
        last_updated: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalViews: data ? data.total_views : totalViews,
        totalInvites: data ? data.total_invites : totalInvites,
        onlineCount: getDynamicOnlineCount(),
      },
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật thống kê!" }, { status: 500 });
  }
}
