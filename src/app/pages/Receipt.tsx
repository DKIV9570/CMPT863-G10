import { Receipt as ReceiptIcon } from "lucide-react";
import BottomNav from "../components/BottomNav";

export default function Receipt() {
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
        <h1 className="text-[26px] font-bold text-[#1A1A1A]">Receipt</h1>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-[#F0F5F1] rounded-full flex items-center justify-center mb-4">
          <ReceiptIcon className="w-10 h-10 text-[#2D6A4F]" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          Coming Soon
        </h2>
        <p className="text-[#999999] text-center max-w-sm">
          The receipt scanning feature will help you track your shopping expenses.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
