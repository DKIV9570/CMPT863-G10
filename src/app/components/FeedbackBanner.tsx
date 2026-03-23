import { CheckCircle2, Info, X } from "lucide-react";
import type { ActionFeedback } from "../types/feedback";

type FeedbackBannerProps = {
  feedback: ActionFeedback;
  onDismiss: () => void;
};

export default function FeedbackBanner({
  feedback,
  onDismiss,
}: FeedbackBannerProps) {
  const isSuccess = feedback.tone !== "info";

  return (
    <div
      className={`mx-6 mt-4 rounded-[24px] border p-4 ${
        isSuccess
          ? "border-[#D5E5DA] bg-[#F3FAF5]"
          : "border-[#D9E2E8] bg-[#F5F8FA]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isSuccess ? "bg-white text-[#2D6A4F]" : "bg-white text-[#3A6A8F]"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-[#1A1A1A]">
            {feedback.title}
          </p>
          <p className="mt-1 text-[12px] text-[#66736A]">{feedback.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/70 transition-colors"
        >
          <X className="w-4 h-4 text-[#66736A]" />
        </button>
      </div>
    </div>
  );
}
