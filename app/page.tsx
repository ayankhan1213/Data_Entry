"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  FileText,
  Send,
  CheckCircle2,
  Shield,
  ArrowRight,
  Database,
  Lock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    details: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 5) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Please enter details or requirements";
    } else if (formData.details.trim().length < 3) {
      newErrors.details = "Details should be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.message || "Failed to submit data");
        }
        return;
      }

      setSubmitSuccess(data.data);
      setFormData({ name: "", email: "", phone: "", details: "" });
    } catch {
      setServerError("Network error. Please ensure the server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(null);
    setServerError(null);
    setFormData({ name: "", email: "", phone: "", details: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                DataEntry <span className="text-indigo-600">Portal</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-none">
                Zero-Config SQLite Storage
              </span>
            </div>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-lg transition-all duration-200"
          >
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Admin Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Persistent Data Entry System</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Record Your Information
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Submit your contact details and message. Everything is securely stored in a local, zero-setup SQLite database.
          </p>
        </div>

        {/* Card Form or Success State */}
        <div className="w-full max-w-xl">
          {submitSuccess ? (
            <div className="bg-white border border-emerald-200 rounded-2xl p-8 shadow-xl shadow-emerald-500/5 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Submission Successful!
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Your entry has been persistently recorded with reference ID:
                <span className="font-semibold text-emerald-700 ml-1">
                  #{submitSuccess.id}
                </span>
              </p>

              {/* Submitted Data Summary Box */}
              <div className="mt-6 bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left text-sm space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-medium text-slate-900">
                    {submitSuccess.name}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-medium text-slate-900">
                    {submitSuccess.email}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Phone Number</span>
                  <span className="font-medium text-slate-900">
                    {submitSuccess.phone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Details</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                    {submitSuccess.details}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/20 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Submit Another Entry</span>
                </button>
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all duration-200"
                >
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>View in Admin Table</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
              {serverError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Johnson"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:bg-white input-focus ${
                        errors.name
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. alex@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:bg-white input-focus ${
                        errors.email
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +1 (555) 019-2834"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:bg-white input-focus ${
                        errors.phone
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
                  )}
                </div>

                {/* Details Field */}
                <div>
                  <label
                    htmlFor="details"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Details & Notes <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      id="details"
                      name="details"
                      rows={4}
                      value={formData.details}
                      onChange={handleChange}
                      placeholder="Enter submission notes, project requirements, or relevant details..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:bg-white input-focus resize-y ${
                        errors.details
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                          : "border-slate-300"
                      }`}
                    />
                  </div>
                  {errors.details && (
                    <p className="mt-1 text-xs text-rose-600">{errors.details}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Record...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Information</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick info badges */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-slate-900">Zero-Config DB</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Persistent local SQLite storage</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-slate-900">Protected Admin</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Server-side session authentication</p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <div className="w-7 h-7 mx-auto rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-slate-900">Instant Search & Delete</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Real-time table filtering</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 DataEntry Web App. Built with Next.js & SQLite.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-medium">
              <span>Admin Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
