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
  eventDate: "2027-06-28T10:00:00",
  eventDateDisplay: "28 THÁNG 6, 2027",
  eventTime: "10:00 AM – 20:00 AM",
  locationName: "HỘI TRƯỜNG HỘI NHẬP CS1 - UTH",
  locationAddress: "02 Võ Oanh, phường Thạnh Mỹ Tây, TP.HCM",
  major: "Ngành Thiết kế Đồ họa",
  dresscode: "Trắng",
  mapUrl: "https://maps.app.goo.gl/JoTvhyPczfEnYtrS8",
};
