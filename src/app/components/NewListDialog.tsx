import { useState } from "react";
import { X } from "lucide-react";

interface NewListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateList: (name: string, color: string) => void;
}

const colors = [
  { name: "Green", value: "#4CAF50" },
  { name: "Orange", value: "#FF9800" },
  { name: "Blue", value: "#2196F3" },
  { name: "Purple", value: "#9C27B0" },
  { name: "Pink", value: "#E91E63" },
  { name: "Cyan", value: "#00BCD4" },
  { name: "Teal", value: "#009688" },
  { name: "Red", value: "#F44336" },
];

export default function NewListDialog({
  isOpen,
  onClose,
  onCreateList,
}: NewListDialogProps) {
  const [listName, setListName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (listName.trim()) {
      onCreateList(listName, selectedColor);
      setListName("");
      setSelectedColor(colors[0].value);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-[608px] p-6 pb-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">New List</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-[#666666]" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#666666] mb-2">
              List Name
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Enter list name"
              className="w-full px-4 py-3 border border-[#E0E8E2] rounded-xl bg-[#F0F5F1] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#666666] mb-3">
              Choose Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-12 rounded-xl transition-all ${
                    selectedColor === color.value
                      ? "ring-2 ring-offset-2 ring-[#2D6A4F] scale-105"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2D6A4F] text-white font-bold py-3 rounded-xl hover:bg-[#255940] transition-colors"
          >
            Create List
          </button>
        </form>
      </div>
    </div>
  );
}
