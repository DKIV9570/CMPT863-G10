import { Settings as SettingsIcon, User, Bell, Lock, HelpCircle, Info } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function Settings() {
  const settingsItems = [
    { icon: User, label: "Account", description: "Manage your profile" },
    { icon: Bell, label: "Notifications", description: "Manage notifications" },
    { icon: Lock, label: "Privacy", description: "Privacy settings" },
    { icon: HelpCircle, label: "Help & Support", description: "Get help" },
    { icon: Info, label: "About", description: "App information" },
  ];

  return (
    <div className="bg-white min-h-screen pb-[111px] max-w-[3000px] mx-auto">
      {/* Status Bar */}
      <div className="h-11 px-6 flex items-center justify-between text-sm font-bold">
        <span>9:41</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm"></div>
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm"></div>
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm opacity-40"></div>
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm opacity-40"></div>
          </div>
          <div className="w-6 h-3 border-2 border-[#1A1A1A] rounded-sm relative">
            <div className="absolute inset-0.5 bg-[#34C759] rounded-[1px]"></div>
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-[#1A1A1A] rounded-r-sm opacity-40"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-[26px] font-bold text-[#1A1A1A]">Settings</h1>
      </div>

      {/* Settings Items */}
      <div className="px-6 space-y-2">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className="w-full bg-white border border-[#EEEEEE] rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-[#F0F5F1] rounded-xl flex items-center justify-center">
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

      {/* Version */}
      <div className="px-6 pt-8 text-center">
        <p className="text-[12px] text-[#999999]">Version 1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
}
