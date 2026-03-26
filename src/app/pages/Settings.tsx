import {
  Bell,
  HelpCircle,
  Info,
  Lock,
  Settings as SettingsIcon,
  Sparkles,
  User,
} from "lucide-react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";

export default function Settings() {
  const navigate = useNavigate();

  const settingsItems = [
    {
      icon: Sparkles,
      label: "AI Rules",
      description: "Control dietary, brand, and order preferences",
      action: () => navigate("/settings/ai-rules"),
      accent: true,
    },
    {
      icon: User,
      label: "Account",
      description: "Manage your profile",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage notifications",
    },
    {
      icon: Lock,
      label: "Privacy",
      description: "Privacy settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help",
    },
    {
      icon: Info,
      label: "About",
      description: "App information",
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-[111px] max-w-[3000px] mx-auto">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F5F1] flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-[#2D6A4F]" />
          </div>
          <div>
            <h1 className="text-[26px] font-bold text-[#1A1A1A]">Settings</h1>
            <p className="text-[13px] text-[#888888]">
              Manage your app preferences and assistant controls
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-3">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-colors ${
              item.accent
                ? "bg-[#F5FAF6] border border-[#DCE7DE] hover:bg-[#EDF5EF]"
                : "bg-white border border-[#EEEEEE] hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                item.accent ? "bg-white border border-[#DCE7DE]" : "bg-[#F0F5F1]"
              }`}
            >
              <item.icon className="w-6 h-6 text-[#2D6A4F]" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[15px] font-bold text-[#1A1A1A]">
                {item.label}
              </h3>
              <p className="text-[12px] text-[#999999]">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="px-6 pt-8 text-center">
        <p className="text-[12px] text-[#999999]">Version 1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
}
