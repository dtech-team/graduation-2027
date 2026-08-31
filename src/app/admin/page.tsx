"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Users, 
  LogOut, 
  Home, 
  FileText, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  UserPlus,
  UserCheck,
  UserX,
  Mail,
  Sparkles,
  MessageSquare,
  Heart
} from "lucide-react";
import { GuestItem, RSVPStatus } from "@/config/guests";
import { encodeInviteData } from "@/utils/share";
import { LookupLogItem } from "@/app/api/lookup-logs/route";
import { VipUserItem } from "@/app/api/auth/vip/route";
import { supabase } from "@/lib/supabase";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const DEFAULT_PRONOUNS = ["Bạn", "Anh", "Chị", "Em", "Mày", "Cậu", "Thầy", "Cô"];
const DEFAULT_RELATIONS = ["Bạn Thân", "Bạn Đại Học", "Bạn Cấp 3", "Đồng Nghiệp", "Gia Đình", "Tiền Bối", "Khách Quý"];

// Chuẩn hóa tên để so sánh không dấu
function normalizeName(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [lookupLogs, setLookupLogs] = useState<LookupLogItem[]>([]);
  const [vipUsers, setVipUsers] = useState<VipUserItem[]>([]);
  
  // Lưu lựa chọn khách VIP gắn cho từng tài khoản Google đang chờ duyệt
  const [selectedGuestMap, setSelectedGuestMap] = useState<Record<string, string>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [vipSearchTerm, setVipSearchTerm] = useState("");
  
  const [statusFilter, setStatusFilter] = useState<"all" | "attending" | "declined" | "pending">("all");
  const [logFilter, setLogFilter] = useState<"all" | "matched" | "unmatched">("all");
  const [vipFilter, setVipFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const [adminWishes, setAdminWishes] = useState<any[]>([]);
  const [wishSearchTerm, setWishSearchTerm] = useState("");
  const [wishFilter, setWishFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  const [activeTab, setActiveTab] = useState<"single" | "batch" | "list" | "logs" | "vip" | "wishes">("list");

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
      fetchLookupLogs(savedPin);
      fetchVipUsers(savedPin);
      fetchAdminWishes(savedPin);
    }
    
    // Đăng ký realtime cập nhật từ Supabase
    const channel = supabase
      .channel('admin:realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes_gallery' }, () => {
        const pin = sessionStorage.getItem("admin_pin");
        if (pin) fetchAdminWishes(pin);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vip_users' }, () => {
        const pin = sessionStorage.getItem("admin_pin");
        if (pin) fetchVipUsers(pin);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAdminWishes = async (adminPin: string) => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/admin/wishes?t=${timestamp}`, {
        headers: { "x-admin-pin": adminPin },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAdminWishes(data.data);
      }
    } catch (e) {
      console.error("Error fetching admin wishes:", e);
    }
  };

  const fetchGuests = async (adminPin: string) => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      const verifyRes = await fetch(`/api/guests?t=${timestamp}`, {
        headers: {
          "x-admin-pin": adminPin,
          "x-verify-pin": "true",
        },
        cache: "no-store",
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        sessionStorage.removeItem("admin_pin");
        setIsAuthenticated(false);
        return;
      }

      const res = await fetch(`/api/guests?t=${timestamp}`, { cache: "no-store" });
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

  // Lấy nhật ký tra cứu tên khách
  const fetchLookupLogs = async (adminPin: string) => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/lookup-logs?t=${timestamp}`, {
        headers: { "x-admin-pin": adminPin },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLookupLogs(data.data);
      }
    } catch (e) {
      console.error("Error fetching lookup logs:", e);
    }
  };

  // Lấy danh sách tài khoản VIP
  const fetchVipUsers = async (adminPin: string) => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/auth/vip?t=${timestamp}`, {
        headers: { "x-admin-pin": adminPin },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVipUsers(data.data);
      }
    } catch (e) {
      console.error("Error fetching VIP users:", e);
    }
  };

  // Tự động tìm khách mời khớp nhất với Tên Google
  const findBestMatchingGuest = (googleName: string) => {
    const normGoogle = normalizeName(googleName);
    return guests.find((g) => {
      const normGuest = normalizeName(g.name);
      return normGoogle.includes(normGuest) || normGuest.includes(normGoogle);
    });
  };

  // Duyệt hoặc từ chối tài khoản VIP
  const handleUpdateVipStatus = async (id: string, newStatus: "approved" | "rejected" | "pending", guestName?: string) => {
    try {
      const res = await fetch("/api/auth/vip", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({ 
          id, 
          status: newStatus,
          claimedGuestName: guestName
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVipUsers(vipUsers.map((u) => (u.id === id ? { 
          ...u, 
          status: newStatus,
          claimedGuestName: guestName || u.claimedGuestName
        } : u)));

        showToast(
          newStatus === "approved"
            ? `⭐ Đã DUYỆT VIP cho "${guestName || 'Khách'}" thành công!`
            : newStatus === "rejected"
            ? "❌ Đã từ chối yêu cầu VIP!"
            : "⏳ Đã chuyển về trạng thái chờ duyệt"
        );
      }
    } catch (e) {
      showToast("Lỗi cập nhật trạng thái VIP!");
    }
  };

  // Xóa tài khoản VIP
  const handleDeleteVipUser = async (id: string, email: string) => {
    if (!window.confirm(`Xóa tài khoản VIP "${email}"?`)) return;
    try {
      const res = await fetch(`/api/auth/vip?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) {
        setVipUsers(vipUsers.filter((u) => u.id !== id));
        showToast("🗑️ Đã xóa tài khoản VIP!");
      }
    } catch (e) {
      showToast("Lỗi xóa tài khoản!");
    }
  };

  // Cập nhật trạng thái lời chúc (duyệt/từ chối/nổi bật)
  const handleUpdateWishStatus = async (id: string, updates: any) => {
    try {
      const res = await fetch("/api/admin/wishes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-pin": pin,
        },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminWishes(adminWishes.map((w) => (w.id === id ? { ...w, ...updates } : w)));
        showToast("✅ Đã cập nhật trạng thái lời chúc!");
      }
    } catch (e) {
      showToast("Lỗi cập nhật lời chúc!");
    }
  };

  // Xóa lời chúc
  const handleDeleteWish = async (id: string) => {
    if (!window.confirm("Xóa vĩnh viễn ảnh / lời chúc này?")) return;
    try {
      const res = await fetch(`/api/admin/wishes?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) {
        setAdminWishes(adminWishes.filter((w) => w.id !== id));
        showToast("🗑️ Đã xóa lời chúc!");
      }
    } catch (e) {
      showToast("Lỗi xóa lời chúc!");
    }
  };

  // Xóa 1 log tra cứu
  const handleDeleteLog = async (logId: string) => {
    try {
      const res = await fetch(`/api/lookup-logs?id=${logId}`, {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) {
        setLookupLogs(lookupLogs.filter((l) => l.id !== logId));
        showToast("🗑️ Đã xóa bản ghi tra cứu!");
      }
    } catch (e) {
      showToast("Lỗi xóa nhật ký!");
    }
  };

  // Xóa toàn bộ logs tra cứu
  const handleClearAllLogs = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ nhật ký tra cứu không?")) return;
    try {
      const res = await fetch("/api/lookup-logs?clearAll=true", {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) {
        setLookupLogs([]);
        showToast("🧹 Đã xóa sạch toàn bộ nhật ký tra cứu!");
      }
    } catch (e) {
      showToast("Lỗi xóa nhật ký!");
    }
  };

  // Nhanh chóng thêm người lạ vào danh sách khách mời
  const handleQuickAddFromLog = (inputName: string) => {
    setFormData({
      name: inputName,
      pronoun: "Bạn",
      relationship: "Bạn Đại Học",
      message: "",
      status: "pending",
    });
    setEditingId(null);
    setActiveTab("single");
    showToast(`📝 Đã điền tên "${inputName}" vào form thêm khách mời!`);
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
        
        const guestsRes = await fetch("/api/guests");
        const guestsData = await guestsRes.json();
        if (guestsData.success) {
          setGuests(guestsData.data);
        }

        fetchLookupLogs(pin);
        fetchVipUsers(pin);
        fetchAdminWishes(pin);
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
      alert("Vui lòng nhập ít nhất 1 tên khách mời!");
      return;
    }

    const batchGuests = lines.map((name) => ({
      name,
      pronoun: batchPronoun,
      relationship: batchRelation,
      message: "",
    }));

    setLoading(true);
    try {
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
        showToast(`🎉 Đã nhập thành công ${data.count} khách mời!`);
      } else {
        alert(data.error || "Lỗi nhập hàng loạt!");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  // Xóa khách mời
  const handleDeleteGuest = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách mời "${name}" không?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/guests?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-pin": pin },
      });
      const data = await res.json();
      if (data.success) {
        setGuests(data.data);
        showToast(`🗑️ Đã xóa khách mời "${name}"!`);
      } else {
        alert(data.error || "Lỗi khi xóa!");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  // Đổi nhanh trạng thái RSVP từ Admin
  const handleQuickStatusToggle = async (guest: GuestItem, newStatus: RSVPStatus) => {
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: guest.name,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGuests((prev) =>
          prev.map((g) =>
            g.id === guest.id
              ? {
                  ...g,
                  status: newStatus,
                  rsvpTime: newStatus !== "pending" ? new Date().toISOString() : undefined,
                }
              : g
          )
        );
        const statusLabel =
          newStatus === "attending"
            ? "SẼ THAM GIA 🎉"
            : newStatus === "declined"
            ? "BÁO VẮNG 😢"
            : "CHƯA PHẢN HỒI ⏳";
        showToast(`✓ Đã đổi trạng thái của ${guest.name} thành [${statusLabel}]`);
      }
    } catch (e) {
      showToast("Lỗi cập nhật trạng thái!");
    }
  };

  // Copy link thiệp riêng của từng khách
  const copyDirectInviteLink = (guest: GuestItem) => {
    const invitePayload = {
      guestName: guest.name,
      pronoun: guest.pronoun || "Bạn",
      relationship: guest.relationship || "Bạn bè",
      message: guest.message || "",
    };
    const encoded = encodeInviteData(invitePayload);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/preview?i=${encoded}`;

    navigator.clipboard.writeText(url);
    setCopiedId(guest.id);
    showToast(`📋 Đã copy link thiệp riêng của ${guest.name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Thống kê số liệu RSVP
  const attendingCount = guests.filter((g) => g.status === "attending").length;
  const declinedCount = guests.filter((g) => g.status === "declined").length;
  const pendingCount = guests.filter((g) => !g.status || g.status === "pending").length;

  // Lọc danh sách khách
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

  // Lọc logs tra cứu
  const filteredLogs = lookupLogs.filter((log) => {
    const q = logSearchTerm.toLowerCase().trim();
    const matchesSearch =
      log.inputName.toLowerCase().includes(q) ||
      (log.matchedGuestName && log.matchedGuestName.toLowerCase().includes(q)) ||
      (log.userAgent && log.userAgent.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (logFilter === "matched") return log.matched;
    if (logFilter === "unmatched") return !log.matched;

    return true;
  });

  // Lọc VIP users
  const filteredVipUsers = vipUsers.filter((user) => {
    const q = vipSearchTerm.toLowerCase().trim();
    const matchesSearch =
      user.email.toLowerCase().includes(q) ||
      user.googleName.toLowerCase().includes(q) ||
      (user.claimedGuestName && user.claimedGuestName.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (vipFilter === "pending") return user.status === "pending";
    if (vipFilter === "approved") return user.status === "approved";
    if (vipFilter === "rejected") return user.status === "rejected";

    return true;
  });

  const unmatchedCount = lookupLogs.filter((l) => !l.matched).length;
  const matchedLogCount = lookupLogs.filter((l) => l.matched).length;
  const pendingVipCount = vipUsers.filter((u) => u.status === "pending").length;
  const approvedVipCount = vipUsers.filter((u) => u.status === "approved").length;

  const formatLogTime = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const hours = d.getHours().toString().padStart(2, "0");
      const mins = d.getMinutes().toString().padStart(2, "0");
      const secs = d.getSeconds().toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      return `${hours}:${mins}:${secs} • ${day}/${month}/${d.getFullYear()}`;
    } catch {
      return isoStr;
    }
  };

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
              Nhập mã PIN bí mật của Dũng để quản lý danh sách khách mời, duyệt quyền VIP và theo dõi lượt tra cứu.
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
        <div className="w-full max-w-5xl flex flex-col gap-6">
          
          {/* Header Bar */}
          <div className="bg-[#1b0a26] border-4 border-black p-4 sm:p-6 rounded-3xl shadow-[6px_6px_0px_0px_#00f2d1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-black flex items-center justify-center font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                🎓
              </div>
              <div>
                <h1 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider flex items-center gap-2">
                  QUẢN TRỊ LỄ TỐT NGHIỆP
                </h1>
                <p className="text-xs text-gray-400">Dung Graduation 2027 • Secret Guest, Live RSVP & VIP Access Manager</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchGuests(pin); fetchLookupLogs(pin); fetchVipUsers(pin); fetchAdminWishes(pin); showToast("🔄 Đã làm mới toàn bộ dữ liệu!"); }}
                className="px-3.5 py-2 rounded-full bg-[#2a133d] border border-gray-600 text-xs font-display font-bold text-secondary-fixed hover:text-white hover:border-secondary-fixed transition-all flex items-center gap-1.5 cursor-pointer"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Làm Mới</span>
              </button>
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

          {/* --- LIVE RSVP & LOOKUP OVERVIEW BENTO GRID --- */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
            {/* 1. Tổng Khách */}
            <div className="bg-[#1b0a26] border-2 border-black p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0 font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-gray-400 uppercase tracking-wider">TỔNG KHÁCH MỜI</p>
                <p className="font-display font-black text-lg sm:text-xl text-white">{guests.length}</p>
              </div>
            </div>

            {/* 2. Sẽ tham gia */}
            <div className="bg-[#0e2420] border-2 border-secondary-fixed/50 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/20 border border-secondary-fixed flex items-center justify-center text-secondary-fixed shrink-0 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-secondary-fixed uppercase tracking-wider">SẼ THAM GIA</p>
                <p className="font-display font-black text-lg sm:text-xl text-secondary-fixed">
                  {attendingCount} <span className="text-xs font-normal opacity-80">({guests.length > 0 ? Math.round((attendingCount / guests.length) * 100) : 0}%)</span>
                </p>
              </div>
            </div>

            {/* 3. Báo vắng */}
            <div className="bg-[#260e14] border-2 border-red-500/50 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-500 flex items-center justify-center text-red-400 shrink-0 font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-red-400 uppercase tracking-wider">BÁO VẮNG</p>
                <p className="font-display font-black text-lg sm:text-xl text-red-400">{declinedCount}</p>
              </div>
            </div>

            {/* 4. Tài khoản VIP chờ duyệt */}
            <div 
              className="bg-[#14221c] border-2 border-secondary-fixed/60 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 cursor-pointer hover:border-secondary-fixed transition-colors"
              onClick={() => setActiveTab("vip")}
            >
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed/20 border border-secondary-fixed flex items-center justify-center text-secondary-fixed shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-secondary-fixed uppercase tracking-wider">DUYỆT VIP</p>
                <p className="font-display font-black text-lg sm:text-xl text-secondary-fixed">
                  {pendingVipCount} <span className="text-xs font-normal text-gray-400 font-mono">chờ duyệt / {approvedVipCount} VIP</span>
                </p>
              </div>
            </div>

            {/* 5. Lời chúc mới */}
            <div 
              className="bg-[#14221c] border-2 border-[#00f2d1]/60 p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 cursor-pointer hover:border-[#00f2d1] transition-colors sm:col-span-2 md:col-span-1"
              onClick={() => setActiveTab("wishes")}
            >
              <div className="w-10 h-10 rounded-xl bg-[#00f2d1]/20 border border-[#00f2d1] flex items-center justify-center text-[#00f2d1] shrink-0 font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-[#00f2d1] uppercase tracking-wider">LỜI CHÚC</p>
                <p className="font-display font-black text-lg sm:text-xl text-[#00f2d1]">
                  {adminWishes.filter(w => w.status === 'pending').length} <span className="text-xs font-normal text-gray-400 font-mono">mới / {adminWishes.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (6 TABS) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-[#1b0a26] p-1.5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
            {/* Tab 1: Danh sách khách */}
            <button
              onClick={() => { setActiveTab("list"); setEditingId(null); }}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "list"
                  ? "bg-secondary-fixed text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Khách ({guests.length})</span>
            </button>

            {/* Tab 2: Thêm 1 khách */}
            <button
              onClick={() => setActiveTab("single")}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "single"
                  ? "bg-tertiary-fixed text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingId ? "Sửa Khách" : "+ Thêm 1"}</span>
            </button>

            {/* Tab 3: Nhập hàng loạt */}
            <button
              onClick={() => setActiveTab("batch")}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "batch"
                  ? "bg-primary text-white shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Hàng Loạt</span>
            </button>

            {/* Tab 4: AI ĐANG TÒ MÒ */}
            <button
              onClick={() => setActiveTab("logs")}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                activeTab === "logs"
                  ? "bg-[#ff7043] text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-[#ff7043]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ai Tò Mò?</span>
              {unmatchedCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold animate-pulse">
                  {unmatchedCount}
                </span>
              )}
            </button>

            {/* Tab 5: DUYỆT TÀI KHOẢN VIP */}
            <button
              onClick={() => setActiveTab("vip")}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer relative col-span-2 sm:col-span-1 ${
                activeTab === "vip"
                  ? "bg-emerald-400 text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-emerald-400"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Duyệt VIP</span>
              {pendingVipCount > 0 && (
                <span className="bg-amber-400 text-black text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black animate-bounce">
                  {pendingVipCount}
                </span>
              )}
            </button>

            {/* Tab 6: LỜI CHÚC */}
            <button
              onClick={() => setActiveTab("wishes")}
              className={`py-2.5 px-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer relative col-span-3 sm:col-span-1 ${
                activeTab === "wishes"
                  ? "bg-[#00f2d1] text-black shadow-[2px_2px_0px_0px_#000]"
                  : "text-gray-400 hover:text-[#00f2d1]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Lời Chúc</span>
              {adminWishes.filter(w => w.status === 'pending').length > 0 && (
                <span className="bg-[#ff00a0] text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono font-black animate-pulse">
                  {adminWishes.filter(w => w.status === 'pending').length}
                </span>
              )}
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
                    placeholder="Tự nhập quan hệ khác..."
                    className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 text-sm focus:outline-none"
                  />
                </div>

                {/* Lời nhắn riêng */}
                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">Lời nhắn riêng (Tùy chọn)</label>
                  <div className="bg-[#12061c] rounded-xl border border-gray-700 mt-1 focus-within:border-tertiary-fixed overflow-hidden custom-quill">
                    <ReactQuill
                      theme="snow"
                      value={formData.message}
                      onChange={(content) => setFormData({ ...formData, message: content })}
                      placeholder="VD: Cảm ơn bạn rất nhiều vì đã luôn đồng hành cùng tôi..."
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          [{ 'color': [] }, { 'background': [] }],
                          ['clean']
                        ]
                      }}
                    />
                  </div>
                </div>

                {/* Nút Submit */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-tertiary-fixed to-secondary-fixed text-black font-display font-black py-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] uppercase cursor-pointer"
                  >
                    {editingId ? "CẬP NHẬT THÔNG TIN" : "LƯU KHÁCH MỜI"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", pronoun: "Bạn", relationship: "Bạn Đại Học", message: "", status: "pending" });
                        setActiveTab("list");
                      }}
                      className="px-6 py-3 rounded-xl bg-gray-800 text-gray-300 font-display font-bold hover:bg-gray-700 cursor-pointer"
                    >
                      HỦY
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* --- TAB 2: FORM NHẬP HÀNG LOẠT --- */}
          {activeTab === "batch" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1b0a26] border-4 border-primary p-6 rounded-3xl shadow-[6px_6px_0px_0px_#00f2d1]"
            >
              <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-primary mb-2">
                📋 NHẬP DANH SÁCH KHÁCH HÀNG LOẠT
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Dán danh sách họ tên khách mời vào ô bên dưới, mỗi người 1 dòng. Hệ thống sẽ tự động gán xưng hô và mối quan hệ mặc định bạn chọn.
              </p>

              <form onSubmit={handleBatchImport} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-display font-bold text-gray-300 uppercase">Xưng hô mặc định</label>
                    <input
                      type="text"
                      value={batchPronoun}
                      onChange={(e) => setBatchPronoun(e.target.value)}
                      className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 mt-1 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-display font-bold text-gray-300 uppercase">Mối quan hệ mặc định</label>
                    <input
                      type="text"
                      value={batchRelation}
                      onChange={(e) => setBatchRelation(e.target.value)}
                      className="w-full bg-[#12061c] text-white py-2.5 px-4 rounded-xl border border-gray-700 mt-1 text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-display font-bold text-gray-300 uppercase">
                    Danh sách họ tên (Mỗi dòng 1 tên) *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Hoàng C\nPhạm Minh D..."}
                    className="w-full bg-[#12061c] text-white p-4 rounded-xl border-2 border-primary mt-1 font-mono text-sm focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-secondary-fixed text-white font-display font-black py-3.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] uppercase tracking-wider cursor-pointer"
                >
                  XÁC NHẬN NHẬP DANH SÁCH
                </button>
              </form>
            </motion.div>
          )}

          {/* --- TAB 3: DANH SÁCH KHÁCH MỜI VÀ RSVP --- */}
          {activeTab === "list" && (
            <div className="flex flex-col gap-4">
              
              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, xưng hô, quan hệ..."
                    className="w-full bg-[#1b0a26] text-white pl-10 pr-4 py-2.5 rounded-full border-2 border-gray-700 text-xs font-bold focus:border-secondary-fixed focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === "all"
                        ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-gray-400 border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    Tất cả ({guests.length})
                  </button>

                  <button
                    onClick={() => setStatusFilter("attending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      statusFilter === "attending"
                        ? "bg-secondary-fixed text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-secondary-fixed border-secondary-fixed/40 hover:border-secondary-fixed"
                    }`}
                  >
                    <span>● Sẽ tham gia ({attendingCount})</span>
                  </button>

                  <button
                    onClick={() => setStatusFilter("declined")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      statusFilter === "declined"
                        ? "bg-red-500 text-white border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-red-400 border-red-500/40 hover:border-red-400"
                    }`}
                  >
                    <span>● Báo vắng ({declinedCount})</span>
                  </button>

                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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

          {/* --- TAB 4: AI ĐANG TÒ MÒ WEB (NHẬT KÝ TRA CỨU) --- */}
          {activeTab === "logs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Header Box */}
              <div className="bg-[#1b0a26] border-4 border-[#ff7043] p-5 sm:p-6 rounded-3xl shadow-[6px_6px_0px_0px_#ff3af2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-[#ff7043] flex items-center gap-2">
                    🕵️ NHẬT KÝ TRA CỨU (AI ĐANG TÒ MÒ WEB)
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Ghi lại từng lần bất kỳ ai gõ tên vào trang chủ để xem thiệp, kể cả người lạ gõ thử tên linh tinh!
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fetchLookupLogs(pin)}
                    className="px-3.5 py-2 rounded-xl bg-[#281338] border border-gray-700 text-xs font-display font-bold text-secondary-fixed hover:bg-secondary-fixed hover:text-black transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm Mới</span>
                  </button>

                  {lookupLogs.length > 0 && (
                    <button
                      onClick={handleClearAllLogs}
                      className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-500 text-xs font-display font-bold text-red-300 hover:bg-red-900 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Hết Logs</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearchTerm}
                    onChange={(e) => setLogSearchTerm(e.target.value)}
                    placeholder="Tìm tên đã gõ, thiết bị..."
                    className="w-full bg-[#1b0a26] text-white pl-10 pr-4 py-2.5 rounded-full border-2 border-gray-700 text-xs font-bold focus:border-[#ff7043] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setLogFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer whitespace-nowrap ${
                      logFilter === "all"
                        ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-gray-400 border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    Tất cả ({lookupLogs.length})
                  </button>

                  <button
                    onClick={() => setLogFilter("unmatched")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      logFilter === "unmatched"
                        ? "bg-red-500 text-white border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-red-400 border-red-500/40 hover:border-red-400"
                    }`}
                  >
                    <span>⚠️ Người lạ / Không khớp ({unmatchedCount})</span>
                  </button>

                  <button
                    onClick={() => setLogFilter("matched")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      logFilter === "matched"
                        ? "bg-secondary-fixed text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-secondary-fixed border-secondary-fixed/40 hover:border-secondary-fixed"
                    }`}
                  >
                    <span>✅ Khách VIP hợp lệ ({matchedLogCount})</span>
                  </button>
                </div>
              </div>

              {/* Logs List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredLogs.length === 0 ? (
                  <div className="col-span-full bg-[#1b0a26] p-10 rounded-3xl border-2 border-dashed border-gray-700 text-center text-gray-400">
                    <Eye className="w-10 h-10 mx-auto text-gray-600 mb-2 animate-pulse" />
                    <p className="font-display font-bold text-sm">Chưa có bản ghi tra cứu nào phù hợp!</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`bg-[#1b0a26] border-2 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between gap-3 transition-all ${
                        !log.matched
                          ? "border-red-500/70 shadow-[4px_4px_0px_0px_#ef4444]"
                          : "border-secondary-fixed/60 shadow-[4px_4px_0px_0px_#00f2d1]"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          {log.matched ? (
                            <span className="text-[10px] font-display font-black bg-secondary-fixed text-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              KHÁCH VIP HỢP LỆ
                            </span>
                          ) : (
                            <span className="text-[10px] font-display font-black bg-red-950 text-red-300 border border-red-500 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              NGƯỜI LẠ / TÊN KHÔNG KHỚP
                            </span>
                          )}

                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            {formatLogTime(log.timestamp)}
                          </span>
                        </div>

                        <div className="bg-[#12061c] p-3 rounded-xl border border-gray-800">
                          <p className="text-[10px] uppercase font-display font-bold text-gray-500">Tên vừa được nhập:</p>
                          <p className="font-display font-black text-base sm:text-lg text-white mt-0.5">
                            "{log.inputName}"
                          </p>
                          {log.matched && log.matchedGuestName && (
                            <p className="text-xs text-secondary-fixed font-bold mt-1">
                              ➔ Khớp với khách VIP: <span className="underline">{log.matchedGuestName}</span>
                            </p>
                          )}
                        </div>

                        {log.userAgent && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            {log.userAgent.includes("Mobile") || log.userAgent.includes("iPhone") || log.userAgent.includes("Android") ? (
                              <Smartphone className="w-3 h-3 text-tertiary-fixed shrink-0" />
                            ) : (
                              <Monitor className="w-3 h-3 text-secondary-fixed shrink-0" />
                            )}
                            <span className="truncate max-w-[280px]" title={log.userAgent}>
                              {log.userAgent}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800">
                        {!log.matched ? (
                          <button
                            onClick={() => handleQuickAddFromLog(log.inputName)}
                            className="flex items-center gap-1.5 text-xs font-display font-bold px-3 py-1.5 rounded-lg bg-[#2b160f] hover:bg-[#ff7043] hover:text-black text-[#ff7043] border border-[#ff7043]/50 transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Thêm Vào Khách Mời</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-500 font-mono">Đã có trong danh sách</span>
                        )}

                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1.5 rounded-lg hover:bg-red-950 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Xóa bản ghi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </motion.div>
          )}

          {/* --- TAB 5: DUYỆT TÀI KHOẢN GOOGLE (VIP) --- */}
          {activeTab === "vip" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              {/* Header Box */}
              <div className="bg-[#1b0a26] border-4 border-emerald-400 p-5 sm:p-6 rounded-3xl shadow-[6px_6px_0px_0px_#00f2d1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    🛡️ DUYỆT TÀI KHOẢN GOOGLE KHÁCH VIP
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Xem thông tin tài khoản Google của bạn bè vừa đăng nhập. Chọn khách VIP tương ứng và bấm Duyệt để cấp quyền!
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fetchVipUsers(pin)}
                    className="px-3.5 py-2 rounded-xl bg-[#281338] border border-gray-700 text-xs font-display font-bold text-secondary-fixed hover:bg-secondary-fixed hover:text-black transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm Mới</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vipSearchTerm}
                    onChange={(e) => setVipSearchTerm(e.target.value)}
                    placeholder="Tìm email, tên Google, tên khách..."
                    className="w-full bg-[#1b0a26] text-white pl-10 pr-4 py-2.5 rounded-full border-2 border-gray-700 text-xs font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setVipFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer whitespace-nowrap ${
                      vipFilter === "all"
                        ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-gray-400 border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    Tất cả ({vipUsers.length})
                  </button>

                  <button
                    onClick={() => setVipFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      vipFilter === "pending"
                        ? "bg-amber-400 text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-amber-400 border-amber-400/40 hover:border-amber-400"
                    }`}
                  >
                    <span>Chờ duyệt ({pendingVipCount})</span>
                  </button>

                  <button
                    onClick={() => setVipFilter("approved")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      vipFilter === "approved"
                        ? "bg-emerald-400 text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-emerald-400 border-emerald-400/40 hover:border-emerald-400"
                    }`}
                  >
                    <span>Đã duyệt VIP ({approvedVipCount})</span>
                  </button>
                </div>
              </div>

              {/* VIP Users Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredVipUsers.length === 0 ? (
                  <div className="col-span-full bg-[#1b0a26] p-10 rounded-3xl border-2 border-dashed border-gray-700 text-center text-gray-400">
                    <ShieldCheck className="w-10 h-10 mx-auto text-gray-600 mb-2 animate-pulse" />
                    <p className="font-display font-bold text-sm">Chưa có tài khoản Google nào đăng nhập!</p>
                  </div>
                ) : (
                  filteredVipUsers.map((user) => {
                    const matchedGuest = findBestMatchingGuest(user.googleName);
                    const currentSelectedGuest = selectedGuestMap[user.id] || user.claimedGuestName || matchedGuest?.name || (guests.length > 0 ? guests[0].name : "");

                    return (
                      <div
                        key={user.id}
                        className={`bg-[#1b0a26] border-2 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between gap-3 transition-all ${
                          user.status === "approved"
                            ? "border-emerald-500/70 shadow-[4px_4px_0px_0px_#10b981]"
                            : user.status === "rejected"
                            ? "border-red-500/60"
                            : "border-amber-400 shadow-[4px_4px_0px_0px_#f59e0b]"
                        }`}
                      >
                        <div className="flex flex-col gap-2.5">
                          {/* Status Badge + Time */}
                          <div className="flex items-center justify-between gap-2">
                            {user.status === "approved" ? (
                              <span className="text-[10px] font-display font-black bg-emerald-400 text-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                ĐÃ DUYỆT VIP ⭐
                              </span>
                            ) : user.status === "rejected" ? (
                              <span className="text-[10px] font-display font-black bg-red-900 text-red-200 border border-red-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-400" />
                                ĐÃ TỪ CHỐI
                              </span>
                            ) : (
                              <span className="text-[10px] font-display font-black bg-amber-400 text-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" />
                                CHỜ DŨNG DUYỆT ⏳
                              </span>
                            )}

                            <span className="text-[10px] text-gray-400 font-mono">
                              {formatLogTime(user.createdAt)}
                            </span>
                          </div>

                          {/* Google User Profile Card */}
                          <div className="bg-[#12061c] p-3 rounded-xl border border-gray-800 flex items-center gap-3">
                            <img
                              src={ "/icons/user.png"}
                              onError={(e) => { e.currentTarget.src = "/icons/user.png"; }}
                              referrerPolicy="no-referrer"
                              alt="Avatar"
                              className="w-12 h-12 rounded-full border-2 border-secondary-fixed bg-black shrink-0 object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-display font-black text-sm text-white truncate">
                                {user.googleName}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-1 truncate font-mono">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </p>
                              {user.claimedGuestName && user.status === "approved" && (
                                <p className="text-xs text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                                  <span>Gán với khách VIP:</span>
                                  <span className="underline font-black">{user.claimedGuestName}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* So khớp thông minh & Chọn khách VIP liên kết */}
                          {user.status !== "approved" && (
                            <div className="bg-[#180d22] p-2.5 rounded-xl border border-purple-900/60 flex flex-col gap-1.5">
                              {matchedGuest && (
                                <div className="text-[11px] text-secondary-fixed font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-secondary-fixed shrink-0" />
                                  <span>Tự động khớp tên với: <strong className="text-white underline">{matchedGuest.name}</strong></span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-display font-bold text-gray-400 uppercase shrink-0">
                                  Gán với Khách VIP:
                                </label>
                                <select
                                  value={currentSelectedGuest}
                                  onChange={(e) => setSelectedGuestMap({ ...selectedGuestMap, [user.id]: e.target.value })}
                                  className="w-full bg-[#12061c] text-white text-xs font-bold py-1 px-2 rounded-lg border border-gray-700 focus:border-secondary-fixed focus:outline-none"
                                >
                                  {guests.map((g) => (
                                    <option key={g.id} value={g.name} className="bg-[#180924] text-white">
                                      {g.name} ({g.relationship})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for Admin */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800">
                          <div className="flex items-center gap-1.5">
                            {user.status !== "approved" && (
                              <button
                                onClick={() => handleUpdateVipStatus(user.id, "approved", currentSelectedGuest)}
                                className="flex items-center gap-1 text-xs font-display font-black px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black border border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>DUYỆT CHO: {currentSelectedGuest || "KHÁCH VIP"}</span>
                              </button>
                            )}

                            {user.status !== "rejected" && (
                              <button
                                onClick={() => handleUpdateVipStatus(user.id, "rejected")}
                                className="flex items-center gap-1 text-xs font-display font-bold px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/60 cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Từ Chối</span>
                              </button>
                            )}

                            {user.status !== "pending" && (
                              <button
                                onClick={() => handleUpdateVipStatus(user.id, "pending")}
                                className="text-[11px] font-display font-bold px-2 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
                              >
                                Reset
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteVipUser(user.id, user.email)}
                            className="p-1.5 rounded-lg hover:bg-red-950 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Xóa tài khoản này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </motion.div>
          )}

          {/* --- TAB 6: DUYỆT LỜI CHÚC --- */}
          {activeTab === "wishes" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="bg-[#1b0a26] border-4 border-[#00f2d1] p-5 sm:p-6 rounded-3xl shadow-[6px_6px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-[#00f2d1] flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    QUẢN LÝ LỜI CHÚC
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Duyệt lời chúc hiển thị lên trang Gallery. Lời chúc ẩn danh vẫn hiển thị tên người gửi thật ở đây.
                  </p>
                </div>
                <button
                  onClick={() => fetchAdminWishes(pin)}
                  className="px-3.5 py-2 rounded-xl bg-[#281338] border border-gray-700 text-xs font-display font-bold text-[#00f2d1] hover:bg-[#00f2d1] hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm Mới</span>
                </button>
              </div>

              {/* Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={wishSearchTerm}
                    onChange={(e) => setWishSearchTerm(e.target.value)}
                    placeholder="Tìm lời chúc, người gửi..."
                    className="w-full bg-[#1b0a26] text-white pl-10 pr-4 py-2.5 rounded-full border-2 border-gray-700 text-xs font-bold focus:border-[#00f2d1] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setWishFilter("all")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer whitespace-nowrap ${
                      wishFilter === "all"
                        ? "bg-white text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-gray-400 border-gray-800 hover:border-gray-600"
                    }`}
                  >
                    Tất cả ({adminWishes.length})
                  </button>

                  <button
                    onClick={() => setWishFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      wishFilter === "pending"
                        ? "bg-[#ff00a0] text-white border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-[#ff00a0] border-[#ff00a0]/40 hover:border-[#ff00a0]"
                    }`}
                  >
                    Chờ duyệt ({adminWishes.filter((w) => w.status === "pending").length})
                  </button>

                  <button
                    onClick={() => setWishFilter("approved")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      wishFilter === "approved"
                        ? "bg-[#00f2d1] text-black border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-[#00f2d1] border-[#00f2d1]/40 hover:border-[#00f2d1]"
                    }`}
                  >
                    Đã duyệt ({adminWishes.filter((w) => w.status === "approved").length})
                  </button>
                  
                  <button
                    onClick={() => setWishFilter("rejected")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-black border transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      wishFilter === "rejected"
                        ? "bg-red-500 text-white border-black shadow-[2px_2px_0px_0px_#000]"
                        : "bg-[#1b0a26] text-red-400 border-red-500/40 hover:border-red-400"
                    }`}
                  >
                    Từ chối ({adminWishes.filter((w) => w.status === "rejected").length})
                  </button>
                </div>
              </div>

              {/* Grid Lời Chúc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {adminWishes
                  .filter(
                    (w) =>
                      wishFilter === "all" || w.status === wishFilter
                  )
                  .filter(
                    (w) =>
                      w.message.toLowerCase().includes(wishSearchTerm.toLowerCase()) ||
                      (w.vip_users?.claimed_guest_name && w.vip_users.claimed_guest_name.toLowerCase().includes(wishSearchTerm.toLowerCase())) ||
                      (w.vip_users?.google_name && w.vip_users.google_name.toLowerCase().includes(wishSearchTerm.toLowerCase()))
                  )
                  .map((wish) => (
                    <div
                      key={wish.id}
                      className={`bg-[#1b0a26] border-2 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between gap-3 transition-all ${
                        wish.status === "approved"
                          ? "border-[#00f2d1]/70"
                          : wish.status === "rejected"
                          ? "border-red-500/60"
                          : "border-[#ff00a0]"
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {wish.vip_users?.google_avatar && (
                              <img src={wish.vip_users.google_avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-600" />
                            )}
                            <div>
                              <p className="font-display font-black text-sm text-white">
                                {wish.vip_users?.claimed_guest_name || wish.vip_users?.google_name || "Khách VIP"}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                {formatLogTime(wish.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          {wish.status === "approved" ? (
                            <span className="text-[10px] font-display font-black bg-[#00f2d1] text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> ĐÃ DUYỆT
                            </span>
                          ) : wish.status === "rejected" ? (
                            <span className="text-[10px] font-display font-black bg-red-900 text-red-200 border border-red-500 px-2 py-0.5 rounded-full">
                              TỪ CHỐI
                            </span>
                          ) : (
                            <span className="text-[10px] font-display font-black bg-[#ff00a0] text-white px-2 py-0.5 rounded-full animate-pulse">
                              CHỜ DUYỆT
                            </span>
                          )}
                        </div>

                        {wish.visibility === "anonymous" && (
                          <div className="bg-[#281338] text-gray-300 text-xs p-2 rounded-lg border border-purple-900 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-purple-400" />
                            <span>Người dùng gửi với chế độ <strong>Ẩn Danh</strong></span>
                          </div>
                        )}

                        {wish.image_url && (
                          <img src={wish.image_url} alt="Wish" className="w-full h-32 object-cover rounded-xl border border-gray-700" />
                        )}
                        <p className="text-sm text-gray-200 italic line-clamp-4 bg-[#12061c] p-3 rounded-xl border border-gray-800">
                          "{wish.message}"
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-1.5">
                          {wish.status !== "approved" && (
                            <button
                              onClick={() => handleUpdateWishStatus(wish.id, { status: "approved" })}
                              className="px-3 py-1.5 rounded-lg bg-[#00f2d1] hover:bg-[#00c9ad] text-black text-xs font-display font-black cursor-pointer"
                            >
                              ✓ Duyệt
                            </button>
                          )}
                          {wish.status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateWishStatus(wish.id, { status: "rejected" })}
                              className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/60 text-xs font-display font-bold cursor-pointer"
                            >
                              ✗ Từ Chối
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleUpdateWishStatus(wish.id, { isFeatured: !wish.is_featured })}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              wish.is_featured ? 'bg-[#ff00a0] text-white border-[#ff00a0]' : 'text-gray-500 border-gray-700 hover:text-white'
                            }`}
                            title={wish.is_featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                          >
                            <Heart className={`w-4 h-4 ${wish.is_featured ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteWish(wish.id)}
                          className="p-1.5 rounded-lg hover:bg-red-950 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}

// Thêm CSS tuỳ chỉnh cho Quill để hợp với nền tối
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    .custom-quill .ql-toolbar {
      border: none;
      border-bottom: 1px solid #374151;
      background-color: #1a0f2e;
    }
    .custom-quill .ql-container {
      border: none;
      font-family: inherit;
      min-height: 100px;
      color: white;
      font-size: 14px;
    }
    .custom-quill .ql-editor.ql-blank::before {
      color: #9ca3af;
      font-style: normal;
    }
    .custom-quill .ql-stroke {
      stroke: #d1d5db !important;
    }
    .custom-quill .ql-fill {
      fill: #d1d5db !important;
    }
    .custom-quill .ql-picker-label {
      color: #d1d5db !important;
    }
    .custom-quill .ql-active .ql-stroke {
      stroke: #00d0b0 !important;
    }
    .custom-quill .ql-active .ql-fill {
      fill: #00d0b0 !important;
    }
  `;
  document.head.appendChild(style);
}
