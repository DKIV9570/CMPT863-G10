import { Home, Receipt, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname.startsWith("/list/");
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#FAFAFA] border-t border-[#E8E8E8] h-[111px] flex items-center justify-around px-8">
      <button
        onClick={() => navigate("/")}
        className="flex flex-col items-center gap-1"
      >
        <Home
          className={`w-7 h-7 ${
            isActive("/") ? "text-[#2D6A4F] fill-[#2D6A4F]" : "text-[#666666]"
          }`}
        />
        <span
          className={`text-[11px] font-bold ${
            isActive("/") ? "text-[#2D6A4F]" : "text-[#666666]"
          }`}
        >
          Lists
        </span>
      </button>
      <button
        onClick={() => navigate("/receipt")}
        className="flex flex-col items-center gap-1"
      >
        <Receipt
          className={`w-7 h-7 ${
            isActive("/receipt") ? "text-[#2D6A4F]" : "text-[#666666]"
          }`}
        />
        <span
          className={`text-[11px] ${
            isActive("/receipt")
              ? "text-[#2D6A4F] font-bold"
              : "text-[#666666]"
          }`}
        >
          Receipt
        </span>
      </button>
      <button
        onClick={() => navigate("/settings")}
        className="flex flex-col items-center gap-1"
      >
        <Settings
          className={`w-7 h-7 ${
            isActive("/settings") ? "text-[#2D6A4F]" : "text-[#666666]"
          }`}
        />
        <span
          className={`text-[11px] ${
            isActive("/settings")
              ? "text-[#2D6A4F] font-bold"
              : "text-[#666666]"
          }`}
        >
          Settings
        </span>
      </button>
    </div>
  );
}
