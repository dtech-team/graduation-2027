import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const statsFilePath = path.join(process.cwd(), "src", "data", "stats.json");

interface StatsData {
  totalViews: number;
  totalInvites: number;
  lastUpdated: string;
}

const DEFAULT_STATS: StatsData = {
  totalViews: 268,
  totalInvites: 42,
  lastUpdated: new Date().toISOString(),
};

function readStats(): StatsData {
  try {
    if (fs.existsSync(statsFilePath)) {
      const content = fs.readFileSync(statsFilePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading stats.json:", e);
  }
  return DEFAULT_STATS;
}

function writeStats(stats: StatsData): boolean {
  try {
    const dir = path.dirname(statsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing stats.json:", e);
    return false;
  }
}

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
  const stats = readStats();
  return NextResponse.json({
    success: true,
    data: {
      totalViews: stats.totalViews,
      totalInvites: stats.totalInvites,
      onlineCount: getDynamicOnlineCount(),
    },
  });
}

// POST: Tăng lượt xem hoặc lượt tạo thiệp
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "view"; // "view" | "invite"

    const stats = readStats();

    if (action === "invite") {
      stats.totalInvites = (stats.totalInvites || 0) + 1;
    } else {
      stats.totalViews = (stats.totalViews || 0) + 1;
    }

    stats.lastUpdated = new Date().toISOString();
    writeStats(stats);

    return NextResponse.json({
      success: true,
      data: {
        totalViews: stats.totalViews,
        totalInvites: stats.totalInvites,
        onlineCount: getDynamicOnlineCount(),
      },
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật thống kê!" }, { status: 500 });
  }
}
