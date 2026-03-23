import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router";

interface PriceItem {
  name: string;
  quantity: string;
  walmart: string;
  superstore: string;
  safeway: string;
}

const items: PriceItem[] = [
  { name: "Milk 2%", quantity: "4L × 2", walmart: "$10.98", superstore: "$10.58", safeway: "$11.98" },
  { name: "Cheese Slices", quantity: "300g × 1", walmart: "$4.99", superstore: "$4.79", safeway: "$5.49" },
  { name: "Greek Yogurt", quantity: "750g × 1", walmart: "$6.29", superstore: "$5.99", safeway: "$6.49" },
  { name: "Chicken Breast", quantity: "1kg × 1", walmart: "$12.99", superstore: "$11.49", safeway: "$13.99" },
  { name: "Ground Beef", quantity: "500g × 2", walmart: "$15.98", superstore: "$16.58", safeway: "$14.98" },
  { name: "Bananas", quantity: "bunch × 1", walmart: "$1.49", superstore: "$1.29", safeway: "$1.69" },
  { name: "Spinach", quantity: "300g × 1", walmart: "$3.99", superstore: "$3.49", safeway: "$4.29" },
  { name: "Avocados", quantity: "piece × 3", walmart: "$7.47", superstore: "$6.87", safeway: "$8.37" },
  { name: "Bread", quantity: "loaf × 1", walmart: "$3.49", superstore: "$3.29", safeway: "$3.99" },
];

const total = {
  walmart: "$67.47",
  superstore: "$64.57",
  safeway: "$71.27",
};


export default function PriceComparison() {
  const [selectedItem, setSelectedItem] = useState<PriceItem | null>(null);
  const navigate = useNavigate();
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
      <div className="px-6 pt-6 pb-4 flex items-center mb-4">
        <button className="mr-4 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => navigate(-1)} // goes back to previous page>
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-[26px] font-bold text-[#1A1A1A]">Price Comparison</h1>
      </div>

      {/* Table Header */}
      <div className="px-6 grid grid-cols-4 text-xs font-semibold text-gray-500 border-b border-gray-200 pb-2 mb-2">
        <div>Item</div>
        <div className="text-center">Walmart</div>
        <div className="text-center">Superstore</div>
        <div className="text-center">Safeway</div>
      </div>

      {/* Table Rows */}
      <div className="px-6 space-y-2">
        {items.map((item) => (
          <div key={item.name} className="grid grid-cols-4 text-sm">
            <div>
              <div>{item.name}</div>
              <div className="text-xs text-gray-400">{item.quantity}</div>
            </div>
            <div className="flex justify-center items-center">{item.walmart}</div>
            <div className="flex justify-center items-center bg-green-100 text-green-800 rounded px-2">
              {item.superstore}
            </div>
            <div className="flex justify-center items-center">{item.safeway}</div>
          </div>
        ))}
      </div>

      {/* Total Row */}
      <div className="px-6 grid grid-cols-4 text-sm font-bold border-t border-gray-200 pt-2 mt-3">
        <div>Total</div>
        <div>{total.walmart}</div>
        <div className="bg-green-100 text-green-800 rounded px-2">{total.superstore}</div>
        <div>{total.safeway}</div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-6 space-y-3">
        <button className="w-full py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors">
          ✨ Choose For Me — Cheapest
        </button>
        <button className="w-full py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors">
          Manual Checkout
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
