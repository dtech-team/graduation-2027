import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
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

const logFilePath = path.join(os.tmpdir(), "graduation_db", "lookup_logs.json");

// Helper đọc logs
function readLogs(): LookupLogItem[] {
  try {
    if (fs.existsSync(logFilePath)) {
      const content = fs.readFileSync(logFilePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading lookup_logs.json:", e);
  }
  return [];
}

// Helper ghi logs
function writeLogs(logs: LookupLogItem[]): boolean {
  try {
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing lookup_logs.json:", e);
    return false;
  }
}

// GET: Lấy danh sách nhật ký tra cứu (Admin Only)
export async function GET(request: Request) {
  const pin = request.headers.get("x-admin-pin");
  if (pin !== ADMIN_CONFIG.pin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const logs = readLogs();
  return NextResponse.json({ success: true, data: logs });
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

    const newLog: LookupLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      inputName: inputName.trim(),
      matched: Boolean(matched),
      matchedGuestName: matchedGuestName || null,
      timestamp: new Date().toISOString(),
      userAgent: userAgent.substring(0, 150),
      ip,
    };

    let logs = readLogs();
    // Thêm log mới lên đầu danh sách (giới hạn tối đa 500 log gần nhất)
    logs = [newLog, ...logs].slice(0, 500);
    writeLogs(logs);

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

  let logs = readLogs();

  if (clearAll === "true") {
    writeLogs([]);
    return NextResponse.json({ success: true, message: "Đã xóa toàn bộ nhật ký!" });
  }

  if (logId) {
    logs = logs.filter((l) => l.id !== logId);
    writeLogs(logs);
    return NextResponse.json({ success: true, message: "Đã xóa bản ghi tra cứu!" });
  }

  return NextResponse.json({ success: false, error: "Thiếu tham số xóa" }, { status: 400 });
}
