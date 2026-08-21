import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SECRET_GUEST_LIST, GuestItem, matchGuestInList, RSVPStatus } from "@/config/guests";

const dataFilePath = path.join(process.cwd(), "src", "data", "guests.json");

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

// GET: Lấy trạng thái RSVP của khách mời theo tên hoặc ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const guestName = searchParams.get("name");
    const guestId = searchParams.get("id");

    const guests = readGuests();

    let matched: GuestItem | null = null;
    if (guestId) {
      matched = guests.find((g) => g.id === guestId) || null;
    } else if (guestName) {
      matched = matchGuestInList(guestName, guests);
    }

    if (!matched) {
      return NextResponse.json({ success: false, error: "Không tìm thấy khách mời!" }, { status: 404 });
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

    let guests = readGuests();
    let targetIndex = -1;

    if (guestId) {
      targetIndex = guests.findIndex((g) => g.id === guestId);
    } else if (guestName) {
      const matched = matchGuestInList(guestName, guests);
      if (matched) {
        targetIndex = guests.findIndex((g) => g.id === matched.id);
      }
    }

    if (targetIndex === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy khách mời trong danh sách!" }, { status: 404 });
    }

    const updatedGuest: GuestItem = {
      ...guests[targetIndex],
      status: status as RSVPStatus,
      rsvpTime: new Date().toISOString(),
      guestNote: typeof guestNote === "string" ? guestNote.trim() : guests[targetIndex].guestNote,
    };

    guests[targetIndex] = updatedGuest;
    writeGuests(guests);

    return NextResponse.json({
      success: true,
      data: updatedGuest,
      message: status === "attending" ? "Xác nhận tham gia thành công!" : "Đã ghi nhận phản hồi vắng mặt!",
    });
  } catch (error) {
    console.error("API RSVP POST error:", error);
    return NextResponse.json({ success: false, error: "Lỗi xử lý xác nhận tham gia!" }, { status: 500 });
  }
}
