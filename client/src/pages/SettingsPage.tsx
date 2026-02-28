import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { User, Mail, Shield, LogOut, Save, X, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ name: name.trim() })
        .eq("id", user?.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);

      // Refresh the page to update user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#48A111]/10 to-[#2E7D32]/10 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-[#48A111]" />
              Profile Information
            </h2>
          </div>

          <div className="p-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border-4 border-[#48A111] shadow-lg">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.name || "User"}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Message Display */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <Check size={18} />
                ) : (
                  <X size={18} />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </motion.div>
            )}

            {/* Name Field */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing || saving}
                  className={`flex-1 px-4 py-2.5 border rounded-lg transition-all ${
                    isEditing
                      ? "border-[#48A111] focus:ring-2 focus:ring-[#48A111]/20 bg-white"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                  placeholder="Enter your name"
                />
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2.5 bg-[#48A111] text-white rounded-lg hover:bg-[#3d8a0f] transition-colors font-medium"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2.5 bg-[#48A111] text-white rounded-lg hover:bg-[#3d8a0f] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setName(user?.name || "");
                        setMessage(null);
                      }}
                      disabled={saving}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Role Field (Read-only) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Shield size={16} />
                Role
              </label>
              <input
                type="text"
                value={user?.role?.replace("_", " ").toUpperCase() || ""}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Sign Out
                </h3>
                <p className="text-sm text-gray-600">
                  Sign out from your account
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
