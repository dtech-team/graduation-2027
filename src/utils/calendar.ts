import { DEFAULT_EVENT_CONFIG } from "@/config/event";

interface CalendarEventOptions {
  guestName?: string;
  pronoun?: string;
  graduateName?: string;
  eventDate?: string;
  eventDateDisplay?: string;
  eventTime?: string;
  locationName?: string;
  locationAddress?: string;
  dresscode?: string;
  mapUrl?: string;
}

/**
 * Tạo đường dẫn thêm sự kiện trực tiếp vào Google Calendar
 */
export function generateGoogleCalendarUrl(options?: CalendarEventOptions): string {
  const graduateName = options?.graduateName || DEFAULT_EVENT_CONFIG.graduateName;
  const locationName = options?.locationName || DEFAULT_EVENT_CONFIG.locationName;
  const locationAddress = options?.locationAddress || DEFAULT_EVENT_CONFIG.locationAddress;
  const dresscode = options?.dresscode || DEFAULT_EVENT_CONFIG.dresscode;
  const eventTime = options?.eventTime || DEFAULT_EVENT_CONFIG.eventTime;
  const eventDateDisplay = options?.eventDateDisplay || DEFAULT_EVENT_CONFIG.eventDateDisplay;
  const mapUrl = options?.mapUrl || DEFAULT_EVENT_CONFIG.mapUrl;
  const guestName = options?.guestName || "Khách Quý";
  const pronoun = options?.pronoun || "Bạn";

  // Tiêu đề sự kiện
  const title = `🎓 LỄ TỐT NGHIỆP ${graduateName.toUpperCase()} • GRAD'27`;

  // Địa điểm
  const location = `${locationName}, ${locationAddress}`;

  // Thời gian sự kiện (Mặc định: 28/06/2027 từ 10:00 đến 20:00 GMT+7)
  // 10:00 AM GMT+7 = 03:00 UTC | 20:00 PM GMT+7 = 13:00 UTC
  // Format ISO UTC: YYYYMMDDTHHMMSSZ
  const dates = "20270628T030000Z/20270628T130000Z";

  // Mô tả chi tiết
  const details = [
    `🎓 THƯ MỜI THAM DỰ LỄ TỐT NGHIỆP CỦA ${graduateName}`,
    `✨ Kính mời: ${pronoun} ${guestName}`,
    `🕒 Thời gian: ${eventTime} (${eventDateDisplay})`,
    `👔 Dresscode: ${dresscode} (Tone thanh lịch)`,
    `📍 Địa điểm: ${locationName}`,
    `🏠 Địa chỉ: ${locationAddress}`,
    `📞 Hotline / Zalo: 077.946.1536`,
    `🗺️ Chỉ đường Google Maps: ${mapUrl}`,
    ``,
    `Rất hân hạnh và mong chờ được đón tiếp ${pronoun.toLowerCase()} tại buổi lễ tốt nghiệp trọng đại này! 🎉`,
  ].join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: dates,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
