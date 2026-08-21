"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Users, 
  LogOut, 
  Home, 
  Sparkles, 
  FileText, 
  Send,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  HelpCircle
} from "lucide-react";
import { GuestItem, RSVPStatus } from "@/config/guests";
import { encodeInviteData } from "@/utils/share";

const DEFAULT_PRONOUNS = ["Bạn", "Anh", "Chị", "Em", "Mày", "Cậu", "Thầy", "Cô"];
const DEFAULT_RELATIONS = ["Bạn Thân", "Bạn Đại Học", "Bạn Cấp 3", "Đồng Nghiệp", "Gia Đình", "Tiền Bối", "Khách Quý"];

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "attending" | "declined" | "pending">("all");
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "list">("list");

  // Form thêm / sửa đơn lẻ
  const [formData, setFormData] = useState<{
    name: string;
    pronoun: string;
    relationship: string;
    message: string;
    status: RSVPStatus;
  }>({
    name: "",
    pronoun: "Bạn",
    relationship: "Bạn Đại Học",
    message: "",
    status: "pending",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form nhập hàng loạt
  const [batchText, setBatchText] = useState("");
  const [batchPronoun, setBatchPronoun] = useState("Bạn");
  const [batchRelation, setBatchRelation] = useState("Bạn Đại Học");

  // Feedback copy link
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Kiểm tra session lưu trong sessionStorage
  useEffect(() => {
    const savedPin = sessionStorage.getItem("admin_pin");
    if (savedPin) {
      setPin(savedPin);
      fetchGuests(savedPin);
    }
  }, []);

  const fetchGuests = async (adminPin: string) => {
    setLoading(true);
    try {
      // 1. Kiểm tra PIN
      const verifyRes = await fetch("/api/guests", {
        headers: {
          "x-admin-pin": adminPin,
          "x-verify-pin": "true",
        },
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        sessionStorage.removeItem("admin_pin");
        setIsAuthenticated(false);
        return;
      }

      // 2. Lấy danh sách khách mời
      const res = await fetch("/api/guests");
      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_pin", adminPin);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đăng nhập PIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/guests", {
        headers: {
          "x-admin-pin": pin,
          "x-verify-pin": "true",
        },
      });
      const data = await res.json();

      if (res.ok && data.verified) {
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_pin", pin);
        
        // Lấy danh sách khách
        const guestsRes = await fetch("/api/guests");
        const guestsData = await guestsRes.json();
        if (guestsData.success) {
          setGuests(guestsData.data);
        }

        showToast("🎉 Đăng nhập Admin thành công!");
      } else {
        setErrorMsg("Mã PIN không chính xác! Vui lòng thử lại.");
      }
    } catch (err) {
      setErrorMsg("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  // Xử lý thêm / sửa khách mời
  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          id: editingId,
          ...formData,
          rsvpTime: formData.status !== "pending" ? new Date().toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
        setFormData({ name: "", pronoun: "Bạn", relationship: "Bạn Đại Học", message: "", status: "pending" });
        setEditingId(null);
        setActiveTab("list");
        showToast(editingId ? "✨ Đã cập nhật thông tin khách mời!" : "🎉 Đã thêm khách mời thành công!");
      } else {
        alert(data.error || "Lỗi lưu dữ liệu!");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nhập hàng loạt
  const handleBatchImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      alert("Vui lòng dán ít nhất 1 tên khách mời!");
      return;
    }

    setLoading(true);
    try {
      const batchGuests = lines.map((name) => ({
        name,
        pronoun: batchPronoun,
        relationship: batchRelation,
        status: "pending",
      }));

      const res = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({ batchGuests }),
      });

      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
        setBatchText("");
        setActiveTab("list");
        showToast(`🎉 Đã thêm thành công ${data.count} khách mời vào danh sách!`);
      }
    } catch (e) {
      alert("Lỗi nhập hàng loạt!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa khách
  const handleDeleteGuest = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách "${name}" khỏi danh sách?`)) return;

    try {
      const res = await fetch(`/api/guests?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
        showToast(`🗑️ Đã xóa "${name}"`);
      }
    } catch (e) {
      alert("Lỗi xóa khách!");
    }
  };

  // Thay đổi trạng thái nhanh trực tiếp từ Admin
  const handleQuickStatusToggle = async (guest: GuestItem, nextStatus: RSVPStatus) => {
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({
          id: guest.id,
          name: guest.name,
          pronoun: guest.pronoun,
          relationship: guest.relationship,
          message: guest.message || "",
          status: nextStatus,
          rsvpTime: nextStatus !== "pending" ? new Date().toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
        const statusLabel = nextStatus === "attending" ? "Sẽ tham gia 🎉" : nextStatus === "declined" ? "Báo vắng 😢" : "Chưa phản hồi ⏳";
        showToast(`✨ ${guest.name}: ${statusLabel}`);
      }
    } catch (e) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  // Copy link thư mời trực tiếp
  const copyDirectInviteLink = (guest: GuestItem) => {
    const encoded = encodeInviteData({
      guestName: guest.name,
      pronoun: guest.pronoun,
      relationship: guest.relationship,
      message: guest.message || "",
    });
    const url = `${window.location.origin}/preview?i=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopiedId(guest.id);
    showToast(`📋 Đã copy link thiệp riêng của ${guest.name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Thống kê số liệu RSVP
  const attendingCount = guests.filter((g) => g.status === "attending").length;
  const declinedCount = guests.filter((g) => g.status === "declined").length;
  const pendingCount = guests.filter((g) => !g.status || g.status === "pending").length;

  // Lọc danh sách khách theo tìm kiếm và trạng thái RSVP
  const filteredGuests = guests.filter((g) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      g.relationship.toLowerCase().includes(q) ||
      g.pronoun.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "attending") return g.status === "attending";
    if (statusFilter === "declined") return g.status === "declined";
    if (statusFilter === "pending") return !g.status || g.status === "pending";

    return true;
  });

  const formatRsvpDate = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} • ${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0514] text-white flex flex-col items-center py-8 px-4 sm:px-6 relative selection:bg-secondary-fixed selection:text-black">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 z-50 bg-secondary-fixed text-black font-display font-black px-6 py-3 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000] text-sm flex items-center gap-2"
          >
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MÀN HÌNH NHẬP MÃ PIN KHÓA --- */}
      {!isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md my-auto flex flex-col items-center"
        >
          <div className="w-full bg-[#1b0a26] border-4 border-tertiary-fixed rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#ff3af2] relative">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed text-black flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="font-display font-black text-2xl text-center uppercase tracking-wider text-white mb-2">
              ADMIN DASHBOARD
            </h1>
            <p className="text-gray-400 text-xs text-center mb-6">
              Nhập mã PIN bí mật của Dũng để quản lý danh sách khách mời và xem xác nhận tham dự.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Nhập mã PIN (VD: 2027)..."
                  className="w-full bg-[#12061c] text-white text-center text-xl tracking-widest font-mono py-3.5 px-4 rounded-2xl border-2 border-secondary-fixed focus:border-primary focus:outline-none placeholder-gray-600 font-bold"
                  autoFocus
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-red-400 font-bold text-xs text-center bg-red-950/60 py-2 rounded-xl border border-red-500">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-secondary-fixed to-primary text-black font-display font-black py-3.5 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#fde400] active:translate-y-0 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
              >
                {loading ? "Đang kiểm tra..." : "MỞ KHÓA BẢNG QUẢN TRỊ"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-gray-400 hover:text-white underline font-display">
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </motion.div>
      ) : (
        /* --- MÀN HÌNH DASHBOARD QUẢN TRỊ ĐẦY ĐỦ --- */
        <div className="w-full max-w-4xl flex flex-col gap-6">
          
          {/* Header Bar */}
          <div className="bg-[#1b0a26] border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[6px_6px_0px_0px_#00f2d1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-black flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                🎓
              </div>
              <div>
                <h1 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider flex items-center gap-2">
                  QUẢN TRỊ KHÁCH MỜI
                </h1>
                <p className="text-xs text-gray-400">Dung Graduation 2027 • Secret Guest & Live RSVP Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="px-4 py-2 rounded-full bg-[#2a133d] border border-gray-600 text-xs font-display font-bold text-gray-300 hover:text-white hover:border-white transition-all flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Trang Chủ</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-red-950/80 border border-red-500 text-xs font-display font-bold text-red-300 hover:bg-red-900 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Thoát</span>
              </button>
            </div>
          </div>

          {/* --- LIVE RSVP OVERVIEW BENTO GRID --- */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
            {/* 1. Tổng Khách */}
            <div className="bg-[#1b0a26] border-2 border-black p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0 font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-gray-400 uppercase tracking-wider">TỔNG KHÁCH</p>
                <p className="font-display font-black text-lg sm:text-xl text-white">{guests.length}</p>
              </div>
            </div>

            {/* 2. Sẽ tham gia */}
            <div className="bg-[#13221e] border-2 border-secondary-fixed/70 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#00f2d1] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/20 border border-secondary-fixed flex items-center justify-center text-secondary-fixed shrink-0 font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-secondary-fixed uppercase tracking-wider">SẼ THAM GIA</p>
                <p className="font-display font-black text-lg sm:text-xl text-secondary-fixed">{attendingCount} <span className="text-[10px] font-normal text-gray-300">({guests.length > 0 ? Math.round((attendingCount / guests.length) * 100) : 0}%)</span></p>
              </div>
            </div>

            {/* 3. Báo vắng */}
            <div className="bg-[#240e1b] border-2 border-red-500/50 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500 flex items-center justify-center text-red-400 shrink-0 font-bold">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-red-400 uppercase tracking-wider">BÁO VẮNG</p>
                <p className="font-display font-black text-lg sm:text-xl text-red-400">{declinedCount}</p>
              </div>
            </div>

            {/* 4. Chưa phản hồi */}
            <div className="bg-[#1c1426] border-2 border-tertiary-fixed/50 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/20 border border-tertiary-fixed flex items-center justify-center text-tertiary-fixed shrink-0 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-tertiary-fixed uppercase tracking-wider">CHƯA PHẢN HỒI</p>
                <p className="font-display font-black text-lg sm:text-xl text-tertiary-fixed">{pendingCount}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 bg-[#1b0a26] p-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            <button
              onClick={() => { setActiveTab("list"); setEditingId(null); }}
              className={`flex-1 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "list"
                  ? "bg-secondary-fixed text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Danh Sách ({guests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "single"
                  ? "bg-tertiary-fixed text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? "Sửa Khách" : "+ Thêm 1 Khách"}</span>
            </button>

            <button
              onClick={() => setActiveTab("batch")}
              className={`flex-1 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "batch"
                  ? "bg-primary text-white shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>+ Thêm Hàng Loạt</span>
            </button>
          </div>

          {/* --- TAB 1: FORM THÊM / SỬA ĐƠN LẺ --- */}
          {activeTab === "single" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1b0a26] border-4 border-tertiary-fixed p-6 rounded-3xl shadow-[6px_6px_0px_0px_#ff3af2]"
            >
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-tertiary-fixed mb-4">
                {editingId ? "✏️ CHỈNH SỬA THÔNG TIN KHÁCH" : "✨ THÊM KHÁCH MỜI MỚI"}
              </h2>

              <form onSubmit={handleSaveGuest} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Họ và Tên khách mời *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Nguyễn Văn Minh..."
                    className="w-full bg-[#12061c] text-white py-3 px-4 rounded-xl border-2 border-secondary-fixed mt-1 font-bold focus:outline-none"
                  />
                </div>

                {/* Xưng hô */}
                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Xưng hô</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                    {DEFAULT_PRONOUNS.map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setFormData({ ...formData, pronoun: p })}
                        className={`text-xs px-3 py-1 rounded-full font-bold border transition-all cursor-pointer ${
                          formData.pronoun === p
                            ? "bg-secondary-fixed text-black border-black font-black"
                            : "bg-[#250f36] text-gray-300 border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.pronoun}
                    onChange={(e) => setFormData({ ...formData, pronoun: e.target.value })}
                    placeholder="Tự nhập xưng hô khác..."
                    className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 text-sm focus:outline-none"
                  />
                </div>

                {/* Mối quan hệ */}
                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Mối quan hệ</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                    {DEFAULT_RELATIONS.map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setFormData({ ...formData, relationship: r })}
                        className={`text-xs px-3 py-1 rounded-full font-bold border transition-all cursor-pointer ${
                          formData.relationship === r
                            ? "bg-tertiary-fixed text-black border-black font-black"
                            : "bg-[#250f36] text-gray-300 border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="Tự nhập mối quan hệ khác..."
                    className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 text-sm focus:outline-none"
                  />
                </div>

                {/* Trạng thái RSVP */}
                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Trạng thái xác nhận tham dự</label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "pending" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-display font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.status === "pending"
                          ? "bg-tertiary-fixed text-black border-black font-black"
                          : "bg-[#250f36] text-gray-400 border-gray-700 hover:border-gray-500"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Chưa phản hồi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "attending" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-display font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.status === "attending"
                          ? "bg-secondary-fixed text-black border-black font-black shadow-[0_0_10px_#00f2d1]"
                          : "bg-[#250f36] text-gray-400 border-gray-700 hover:border-secondary-fixed hover:text-secondary-fixed"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sẽ tham gia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "declined" })}
                      className={`py-2 px-3 rounded-xl border text-xs font-display font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.status === "declined"
                          ? "bg-red-500 text-white border-black font-black"
                          : "bg-[#250f36] text-gray-400 border-gray-700 hover:border-red-400 hover:text-red-400"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Báo vắng</span>
                    </button>
                  </div>
                </div>

                {/* Lời nhắn riêng */}
                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Lời nhắn riêng dành cho người này (tùy chọn)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="VD: Cảm ơn bạn đã luôn bên cạnh Dũng suốt thời gian qua..."
                    rows={2}
                    className="w-full bg-[#12061c] text-white p-3 rounded-xl border border-gray-700 mt-1 text-sm focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-secondary-fixed to-primary text-black font-display font-black py-3 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_#000] uppercase tracking-wider cursor-pointer"
                  >
                    {editingId ? "LƯU THAY ĐỔI" : "THÊM VÀO DANH SÁCH"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); setActiveTab("list"); }}
                      className="px-6 py-3 rounded-full bg-gray-800 text-gray-300 font-bold text-xs uppercase cursor-pointer"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* --- TAB 2: FORM NHẬP HÀNG LOẠT (BATCH) --- */}
          {activeTab === "batch" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1b0a26] border-4 border-primary p-6 rounded-3xl shadow-[6px_6px_0px_0px_#fde400]"
            >
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-primary mb-2">
                📋 NHẬP DANH SÁCH KHÁCH HÀNG LOẠT
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Dán danh sách tên bạn bè (mỗi dòng 1 tên). Hệ thống sẽ tự động thêm tất cả vào danh sách VIP!
              </p>

              <form onSubmit={handleBatchImport} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-display font-bold text-gray-300 uppercase">Xưng hô chung</label>
                    <input
                      type="text"
                      value={batchPronoun}
                      onChange={(e) => setBatchPronoun(e.target.value)}
                      placeholder="Bạn"
                      className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 text-sm mt-1 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-bold text-gray-300 uppercase">Mối quan hệ chung</label>
                    <input
                      type="text"
                      value={batchRelation}
                      onChange={(e) => setBatchRelation(e.target.value)}
                      placeholder="Bạn Đại Học"
                      className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 text-sm mt-1 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Danh sách họ tên (mỗi người 1 dòng) *</label>
                  <textarea
                    required
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder={"Nguyễn Văn An\nTrần Thị Bích\nLê Hoàng Cường\nPhạm Quỳnh Dung..."}
                    rows={6}
                    className="w-full bg-[#12061c] text-white p-4 rounded-2xl border-2 border-primary font-mono text-sm mt-1 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-pink-600 text-white font-display font-black py-3.5 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000] uppercase tracking-wider cursor-pointer"
                >
                  🚀 NHẬP TẤT CẢ VÀO DANH SÁCH
                </button>
              </form>
            </motion.div>
          )}

          {/* --- TAB 3: DANH SÁCH KHÁCH MỜI HIỆN CÓ --- */}
          {activeTab === "list" && (
            <div className="flex flex-col gap-4">
              
              {/* Search & Status Filter Pills */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo tên, xưng hô, mối quan hệ..."
                    className="w-full bg-[#1b0a26] text-white pl-12 pr-4 py-3.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000] focus:border-secondary-fixed focus:outline-none font-bold text-sm"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer ${
                      statusFilter === "all"
                        ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-gray-400 border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    Tất cả ({guests.length})
                  </button>

                  <button
                    onClick={() => setStatusFilter("attending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === "attending"
                        ? "bg-secondary-fixed text-black border-black shadow-[2px_2px_0px_0px_#00f2d1]"
                        : "bg-[#1b0a26] text-secondary-fixed border-secondary-fixed/40 hover:border-secondary-fixed"
                    }`}
                  >
                    <span>● Sẽ tham gia ({attendingCount})</span>
                  </button>

                  <button
                    onClick={() => setStatusFilter("declined")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === "declined"
                        ? "bg-red-500 text-white border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-red-400 border-red-500/40 hover:border-red-500"
                    }`}
                  >
                    <span>● Báo vắng ({declinedCount})</span>
                  </button>

                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === "pending"
                        ? "bg-tertiary-fixed text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-tertiary-fixed border-tertiary-fixed/40 hover:border-tertiary-fixed"
                    }`}
                  >
                    <span>● Chưa phản hồi ({pendingCount})</span>
                  </button>
                </div>
              </div>

              {/* Guest Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredGuests.length === 0 ? (
                  <div className="col-span-full bg-[#1b0a26] p-8 rounded-3xl border-2 border-dashed border-gray-700 text-center text-gray-400">
                    <p className="font-display font-bold">Không tìm thấy khách mời nào phù hợp!</p>
                  </div>
                ) : (
                  filteredGuests.map((guest) => (
                    <div
                      key={guest.id}
                      className={`bg-[#1b0a26] border-2 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between gap-3 transition-colors ${
                        guest.status === "attending"
                          ? "border-secondary-fixed/70 shadow-[4px_4px_0px_0px_#00f2d1]"
                          : guest.status === "declined"
                          ? "border-red-500/60"
                          : "border-black hover:border-gray-600"
                      }`}
                    >
                      <div>
                        {/* Name + Relationship Tag + Status Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-black text-base sm:text-lg text-white">
                              {guest.name}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">
                              Xưng hô: <span className="text-gray-200 font-bold">{guest.pronoun}</span> • Quan hệ: <span className="text-tertiary-fixed font-bold">{guest.relationship}</span>
                            </p>
                          </div>

                          {/* RSVP Status Pill */}
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {guest.status === "attending" ? (
                              <span className="text-[11px] font-display font-black bg-secondary-fixed text-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(0,242,209,0.4)]">
                                <CheckCircle2 className="w-3 h-3" />
                                SẼ THAM GIA
                              </span>
                            ) : guest.status === "declined" ? (
                              <span className="text-[11px] font-display font-black bg-red-900 text-red-200 border border-red-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-400" />
                                BÁO VẮNG
                              </span>
                            ) : (
                              <span className="text-[11px] font-display font-black bg-[#281338] text-gray-400 border border-gray-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-500" />
                                CHƯA PHẢN HỒI
                              </span>
                            )}
                            {guest.rsvpTime && (
                              <span className="text-[10px] text-gray-500 font-mono">
                                {formatRsvpDate(guest.rsvpTime)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Custom message if any */}
                        {guest.message && (
                          <p className="text-xs text-gray-400 italic mt-2 line-clamp-2 bg-[#12061c] p-2 rounded-lg border border-gray-800">
                            "{guest.message}"
                          </p>
                        )}
                      </div>

                      {/* Quick Status Toggle Buttons & Actions */}
                      <div className="flex flex-col gap-2 pt-2 border-t border-gray-800">
                        {/* Quick RSVP toggle row for Admin */}
                        <div className="flex items-center justify-between text-[11px] font-display font-bold">
                          <span className="text-gray-500">Đổi trạng thái:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickStatusToggle(guest, "attending")}
                              className={`px-2 py-0.5 rounded-md border text-[10px] transition-all cursor-pointer ${
                                guest.status === "attending"
                                  ? "bg-secondary-fixed text-black border-black font-black"
                                  : "bg-[#180924] text-gray-400 border-gray-800 hover:border-secondary-fixed hover:text-secondary-fixed"
                              }`}
                              title="Đánh dấu sẽ tham gia"
                            >
                              ✓ Đi
                            </button>
                            <button
                              onClick={() => handleQuickStatusToggle(guest, "declined")}
                              className={`px-2 py-0.5 rounded-md border text-[10px] transition-all cursor-pointer ${
                                guest.status === "declined"
                                  ? "bg-red-500 text-white border-black font-black"
                                  : "bg-[#180924] text-gray-400 border-gray-800 hover:border-red-400 hover:text-red-400"
                              }`}
                              title="Đánh dấu báo vắng"
                            >
                              ✗ Vắng
                            </button>
                            <button
                              onClick={() => handleQuickStatusToggle(guest, "pending")}
                              className={`px-2 py-0.5 rounded-md border text-[10px] transition-all cursor-pointer ${
                                !guest.status || guest.status === "pending"
                                  ? "bg-tertiary-fixed text-black border-black font-black"
                                  : "bg-[#180924] text-gray-400 border-gray-800 hover:border-tertiary-fixed hover:text-tertiary-fixed"
                              }`}
                              title="Đặt lại chưa phản hồi"
                            >
                              ⏳ Reset
                            </button>
                          </div>
                        </div>

                        {/* Bottom action row: Copy link & Edit / Delete */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            onClick={() => copyDirectInviteLink(guest)}
                            className="flex items-center gap-1.5 text-xs font-display font-bold px-3 py-1.5 rounded-lg bg-[#29123b] hover:bg-secondary-fixed hover:text-black text-secondary-fixed transition-colors cursor-pointer"
                          >
                            {copiedId === guest.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-green-400">Đã copy link</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Link Thiệp</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setFormData({
                                  name: guest.name,
                                  pronoun: guest.pronoun,
                                  relationship: guest.relationship,
                                  message: guest.message || "",
                                  status: guest.status || "pending",
                                });
                                setEditingId(guest.id);
                                setActiveTab("single");
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGuest(guest.id, guest.name)}
                              className="p-1.5 rounded-lg hover:bg-red-950 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
