import { ArrowLeft, Sparkles } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router";

type Store = {
  name: string;
  color: string;
  total: number;
  items: string[];
};

export default function Checkout() {
  const navigate = useNavigate();
  const stores: Store[] = [
    {
      name: "Superstore",
      color: "#FF6D00",
      total: 23.85,
      items: ["Milk 2%", "Cheese Slices", "Chicken Breast", "Spinach", "Bananas"],
    },
    {
      name: "Walmart",
      color: "#1E4DB7",
      total: 26.71,
      items: ["Ground Beef", "Greek Yogurt", "Bread"],
    },
    {
      name: "Safeway",
      color: "#D32F2F",
      total: 2.79,
      items: ["Avocados"],
    },
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
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-3"
        onClick={() => navigate(-1)} // goes back to previous page>
      >
        <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        <h1 className="text-[18px] font-semibold text-[#1A1A1A]">
          Checkout
        </h1>
      </div>

      {/* AI Banner */}
      <div className="px-6 pt-3">
        <div className="bg-[#E8F0EA] border border-[#C8DCCB] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
            <p className="text-[13px] font-semibold text-[#2D6A4F]">
              AI Optimized Selection
            </p>
          </div>
          <p className="text-[12px] text-[#4A4A4A]">
            We've selected the cheapest combination across stores, saving you ~$8.47
          </p>
        </div>
      </div>

      {/* Store Cards */}
      <div className="px-6 pt-4 space-y-4">
        {stores.map((store) => (
          <div
            key={store.name}
            className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: store.color }}
                />
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  {store.name}
                </p>
              </div>
              <p className="text-[14px] font-semibold text-[#2D6A4F]">
                ${store.total.toFixed(2)}
              </p>
            </div>

            {/* Items */}
            <ul className="text-[12px] text-[#777777] space-y-1 pl-4 list-disc mb-3">
              {store.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            {/* Button */}
            <button
                onClick={() => {
                if (store.name === "Walmart") {
                    window.open("https://www.walmart.ca/en", "_blank");
                } else if (store.name === "Superstore") {
                    window.open("https://www.realcanadiansuperstore.ca/", "_blank");
                } else if (store.name === "Safeway") {
                    window.open("https://www.safeway.ca/", "_blank");
                }
            }}
              className="w-full py-3 rounded-xl text-[12px] font-semibold border transition-colors"
              style={{
                borderColor: store.color,
                color: store.color,
              }}
            >
              Go to {store.name} →
            </button>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}