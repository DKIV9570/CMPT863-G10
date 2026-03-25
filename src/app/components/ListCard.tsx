import {
  ShoppingCart,
  ChevronRight,
  GripVertical,
  PencilLine,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { ShoppingList } from "../store/listsStore";

interface ListCardProps {
  list: ShoppingList;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDelete?: (listId: string) => void;
  onRename?: (list: ShoppingList) => void;
  onDragStart?: (listId: string) => void;
  onDragOver?: (listId: string) => void;
  onDrop?: (listId: string) => void;
  onDragEnd?: () => void;
}

export default function ListCard({
  list,
  isDragging = false,
  isDropTarget = false,
  onDelete,
  onRename,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ListCardProps) {
  const navigate = useNavigate();

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", list.id);
        onDragStart?.(list.id);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDragOver?.(list.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.(list.id);
      }}
      onDragEnd={onDragEnd}
      className={`w-full rounded-2xl border p-4 transition-all ${
        isDropTarget
          ? "border-[#2D6A4F] bg-[#F7FAF8] shadow-[0_8px_20px_rgba(45,106,79,0.08)]"
          : "border-[#EEEEEE] bg-white hover:bg-gray-50"
      } ${isDragging ? "opacity-60 scale-[0.98]" : ""}`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(`/list/${list.id}`)}
          className="flex flex-1 items-center gap-4 text-left"
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

        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRename?.(list);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E4E4] bg-white text-[#8A8A8A] transition-colors hover:border-[#2D6A4F] hover:text-[#2D6A4F]"
            aria-label={`Rename ${list.name}`}
          >
            <PencilLine className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(list.id);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E4E4] bg-white text-[#8A8A8A] transition-colors hover:border-[#D9534F] hover:text-[#D9534F]"
            aria-label={`Delete ${list.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E0E8E2] bg-[#F7FAF8] text-[#9AA8A0] cursor-grab active:cursor-grabbing"
            aria-hidden="true"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
