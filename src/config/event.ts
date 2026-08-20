export interface EventConfig {
  graduateName: string;
  eventDate: string; // ISO string e.g. "2027-10-25T08:00:00"
  eventDateDisplay: string;
  eventTime: string;
  locationName: string;
  locationAddress: string;
  major: string;
  dresscode: string;
  mapUrl: string;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  graduateName: "TRẦN QUANG DŨNG",
  eventDate: "2026-08-19T08:00:00",
  eventDateDisplay: "20 THÁNG 08, 2026",
  eventTime: "08:00 AM – 11:30 AM",
  locationName: "HỘI TRƯỜNG A, ĐẠI HỌC QUỐC GIA",
  locationAddress: "123 Đường Tốt Nghiệp, Quận 1, TP.HCM",
  major: "Ngành Thiết kế Đồ họa",
  dresscode: "Đen",
  mapUrl: "https://maps.app.goo.gl/a87GBZkeDN6v3HLF7",
};
