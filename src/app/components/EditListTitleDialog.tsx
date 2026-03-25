import { useEffect, useState } from "react";
import { PencilLine, X } from "lucide-react";

interface EditListTitleDialogProps {
  isOpen: boolean;
  initialTitle: string;
  onClose: () => void;
  onSave: (title: string) => void;
}

export default function EditListTitleDialog({
  isOpen,
  initialTitle,
  onClose,
  onSave,
}: EditListTitleDialogProps) {
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
    }
  }, [initialTitle, isOpen]);

  if (!isOpen) {
    return null;
  }

  const normalizedTitle = title.trim();
  const isUnchanged = normalizedTitle === initialTitle.trim();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!normalizedTitle || isUnchanged) {
      return;
    }

    onSave(normalizedTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-[608px] rounded-t-3xl bg-white p-6 pb-8 animate-slide-up">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F5F1] text-[#2D6A4F]">
              <PencilLine className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Edit List Title</h2>
              <p className="text-sm text-[#666666]">
                Choose a new name for this list.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close rename dialog"
          >
            <X className="h-5 w-5 text-[#666666]" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-[#666666]">
              List Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter list title"
              className="w-full rounded-xl border border-[#E0E8E2] bg-[#F0F5F1] px-4 py-3 text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#D5DDD7] px-4 py-3 font-semibold text-[#55635A] transition-colors hover:bg-[#F7FAF8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!normalizedTitle || isUnchanged}
              className="flex-1 rounded-xl bg-[#2D6A4F] px-4 py-3 font-bold text-white transition-colors hover:bg-[#255940] disabled:cursor-not-allowed disabled:bg-[#9DB9AA]"
            >
              Save Title
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
