import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ADMIN_CONFIG } from "@/config/admin";
import { SECRET_GUEST_LIST, GuestItem } from "@/config/guests";

const dataFilePath = path.join(process.cwd(), "src", "data", "guests.json");

// Helper đọc dữ liệu
function readGuests(): GuestItem[] {
  try {
    if (fs.existsSync(dataFilePath)) {
      const content = fs.readFileSync(dataFilePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading guests.json:", e);
  }
  return SECRET_GUEST_LIST;
}

// Helper ghi dữ liệu
function writeGuests(guests: GuestItem[]): boolean {
  try {
    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(guests, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing guests.json:", e);
    return false;
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

  const guests = readGuests();
  return NextResponse.json({ success: true, data: guests });
}

// POST: Thêm mới / Cập nhật khách mời / Nhập hàng loạt
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const pin = request.headers.get("x-admin-pin") || body.pin;

    if (pin !== ADMIN_CONFIG.pin) {
      return NextResponse.json({ success: false, error: "Mã PIN Admin không chính xác!" }, { status: 401 });
    }

    let guests = readGuests();

    // 1. Nhập hàng loạt (Batch Import)
    if (Array.isArray(body.batchGuests)) {
      const newItems: GuestItem[] = body.batchGuests.map((g: Partial<GuestItem>, idx: number) => ({
        id: `g-${Date.now()}-${idx}`,
        name: (g.name || "").trim(),
        aliases: g.aliases || [(g.name || "").toLowerCase().trim()],
        pronoun: g.pronoun || "Bạn",
        relationship: g.relationship || "Bạn bè",
        message: g.message || "",
      })).filter((g: GuestItem) => g.name.length > 0);

      guests = [...newItems, ...guests];
      writeGuests(guests);
      return NextResponse.json({ success: true, count: newItems.length, data: guests });
    }

    // 2. Thêm hoặc sửa 1 khách
    const { name, pronoun, relationship, message, aliases, id } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Tên khách mời không được để trống!" }, { status: 400 });
    }

    if (id) {
      // Sửa
      guests = guests.map((g) =>
        g.id === id
          ? {
              ...g,
              name: name.trim(),
              pronoun: pronoun || "Bạn",
              relationship: relationship || "Bạn bè",
              message: message || "",
              aliases: aliases || [name.toLowerCase().trim()],
            }
          : g
      );
    } else {
      // Thêm mới
      const newGuest: GuestItem = {
        id: `g-${Date.now()}`,
        name: name.trim(),
        pronoun: pronoun || "Bạn",
        relationship: relationship || "Bạn bè",
        message: message || "",
        aliases: aliases && aliases.length > 0 ? aliases : [name.toLowerCase().trim()],
      };
      guests = [newGuest, ...guests];
    }

    writeGuests(guests);
    return NextResponse.json({ success: true, data: guests });
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

    let guests = readGuests();
    guests = guests.filter((g) => g.id !== id);
    writeGuests(guests);

    return NextResponse.json({ success: true, data: guests });
  } catch (error) {
    console.error("API DELETE error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xóa khách mời!" }, { status: 500 });
  }
}
