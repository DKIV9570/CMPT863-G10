import { ShoppingCart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { ShoppingList } from "../store/listsStore";

interface ListCardProps {
  list: ShoppingList;
}

export default function ListCard({ list }: ListCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/list/${list.id}`)}
      className="w-full bg-white border border-[#EEEEEE] rounded-2xl p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
    >
      <div
        className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${list.color}18` }}
      >
        <ShoppingCart className="w-8 h-8" style={{ color: list.color }} />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-1">
          {list.name}
        </h3>
        <p className="text-[12px] text-[#999999]">
          {list.items.length} items · Modified {list.modifiedDate}
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-[#CCCCCC]" />
    </button>
  );
}
