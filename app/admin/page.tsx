"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Search,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  User,
  ExternalLink,
  ChevronLeft,
  X,
  FileSpreadsheet,
} from "lucide-react";

interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
  details: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Detail Modal & Delete Modal State
  const [selectedRecord, setSelectedRecord] = useState<Submission | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchSubmissions();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError("Please enter the admin password");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.message || "Invalid password");
        return;
      }

      setIsAuthenticated(true);
      setPassword("");
      fetchSubmissions();
    } catch {
      setLoginError("Connection failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    setSubmissions([]);
    setSearchQuery("");
  };

  const fetchSubmissions = useCallback(async (query: string = "") => {
    setIsLoadingRecords(true);
    setDashboardError(null);
    try {
      const url = query.trim()
        ? `/api/submissions?search=${encodeURIComponent(query.trim())}`
        : "/api/submissions";

      const res = await fetch(url);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setDashboardError(data.message || "Failed to load records");
        return;
      }
      setSubmissions(data.submissions || []);
    } catch {
      setDashboardError("Failed to fetch submissions from server");
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  // Trigger search with debounce
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchSubmissions(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, isAuthenticated, fetchSubmissions]);

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/submissions/${recordToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setDashboardError(data.message || "Failed to delete submission");
        return;
      }

      showToast(`Record #${recordToDelete.id} (${recordToDelete.name}) was successfully deleted.`);
      setRecordToDelete(null);
      fetchSubmissions(searchQuery);
    } catch {
      setDashboardError("Network error while deleting submission");
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Details", "Submitted At"];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.phone.replace(/"/g, '""')}"`,
      `"${s.details.replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${s.created_at}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `submissions_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exported records to CSV successfully!");
  };

  // Loading indicator for initial session check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Checking admin session...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Form</span>
            </Link>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Gateway
            </div>
          </div>
        </header>

        {/* Login Card */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 ring-8 ring-indigo-50/50">
              <Lock className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Admin Authentication
            </h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Please enter the administrator password to manage entries.
            </p>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="admin-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Enter admin password..."
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 text-sm transition-all focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-md shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Default password: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">admin123</code></span>
              <Link href="/" className="text-indigo-600 hover:underline font-medium">
                Public Form
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ADMIN DASHBOARD (LOGGED IN)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-sm animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to Public Site"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                Admin Dashboard
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {submissions.length} {submissions.length === 1 ? "Record" : "Records"}
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">
                Persistent Data Management & Export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSubmissions(searchQuery)}
              disabled={isLoadingRecords}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingRecords ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>

            <button
              onClick={exportToCSV}
              disabled={submissions.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {dashboardError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{dashboardError}</span>
            </div>
            <button
              onClick={() => setDashboardError(null)}
              className="text-rose-500 hover:text-rose-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or details..."
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
            {searchQuery && (
              <span>
                Found <strong>{submissions.length}</strong> matching entries
              </span>
            )}
            <button
              onClick={exportToCSV}
              disabled={submissions.length === 0}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Submissions Table / Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoadingRecords && submissions.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {searchQuery ? "No matching submissions found" : "No submissions yet"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "Try clearing your search query or searching for a different keyword."
                  : "Records submitted through the public form will automatically appear here."}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <span>Submit First Entry</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-16 text-center">ID</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Contact Name</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Contact Info</th>
                    <th className="py-3.5 px-4 min-w-[260px]">Details</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Date Submitted</th>
                    <th className="py-3.5 px-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          #{sub.id}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {sub.name}
                            </span>
                            <span className="text-[11px] text-slate-400 sm:hidden">
                              ID: #{sub.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-xs">
                          <a
                            href={`mailto:${sub.email}`}
                            className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{sub.email}</span>
                          </a>
                          <a
                            href={`tel:${sub.phone}`}
                            className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{sub.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Details Preview */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedRecord(sub)}
                          className="cursor-pointer group/details"
                        >
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 group-hover/details:border-indigo-200 group-hover/details:bg-indigo-50/40 transition-colors">
                            {sub.details}
                          </p>
                          <span className="text-[10px] text-indigo-600 font-medium opacity-0 group-hover/details:opacity-100 transition-opacity">
                            Click to expand full note →
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(sub.created_at).toLocaleString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setRecordToDelete(sub)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={`Delete submission #${sub.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Record #{selectedRecord.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedRecord.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                    Email
                  </span>
                  <a
                    href={`mailto:${selectedRecord.email}`}
                    className="font-medium text-indigo-600 hover:underline break-all text-xs"
                  >
                    {selectedRecord.email}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                    Phone
                  </span>
                  <a
                    href={`tel:${selectedRecord.phone}`}
                    className="font-medium text-slate-800 text-xs hover:text-indigo-600"
                  >
                    {selectedRecord.phone}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                  Full Details & Notes
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {selectedRecord.details}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Submitted on:{" "}
                <span className="text-slate-600 font-medium">
                  {new Date(selectedRecord.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const toDel = selectedRecord;
                  setSelectedRecord(null);
                  setRecordToDelete(toDel);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50/50">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900">
              Delete Submission #{recordToDelete.id}?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete the entry for{" "}
              <strong className="text-slate-800">{recordToDelete.name}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
