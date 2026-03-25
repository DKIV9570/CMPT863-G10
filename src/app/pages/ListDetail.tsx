import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  deleteItemFromList,
  getListById,
  ListItem,
  updateItemInList,
  updateList,
} from "../store/listsStore";
import BottomNav from "../components/BottomNav";
import FeedbackBanner from "../components/FeedbackBanner";
import { useTransientFeedback } from "../hooks/useTransientFeedback";
import type { ActionFeedback } from "../types/feedback";
import {
  AiChangeType,
  AiListPlan,
  AiPlanChange,
  getAiRulesContext,
  requestListAiPlan,
} from "../utils/listAi";

export interface GroceryItem extends ListItem {
  category: string;
  quantity: number;
  unit: string;
  badge?: "SALE" | "OUT";
  suggested?: boolean;
}

type PreviewChange = {
  id: string;
  type: AiChangeType;
  targetItemId?: string;
  targetItemLabel: string;
  previousItem?: GroceryItem;
  updatedItem?: GroceryItem;
  reason: string;
  canApply: boolean;
};

type UndoState = {
  items: ListItem[];
  message: string;
};

const AI_LOADING_STEPS = [
  "Reviewing your current items",
  "Checking your AI rules",
  "Preparing a safe set of edits",
];

const QUICK_AI_ACTIONS = [
  {
    label: "Add essentials",
    prompt: "Add a few missing essentials to this list.",
  },
  {
    label: "Make cheaper",
    prompt: "Make this list cheaper with minimal changes.",
  },
  {
    label: "Apply my rules",
    prompt: "Adjust this list to better match my saved AI rules.",
  },
  {
    label: "Tidy quantities",
    prompt: "Clean up the quantities and remove anything unnecessary.",
  },
];

function normalizeGroceryItem(item: ListItem): GroceryItem {
  return {
    ...item,
    category: item.category ?? "Other",
    quantity: item.quantity ?? 1,
    unit: item.unit ?? "each",
  };
}

function formatAmountLabel(quantity: number, unit: string) {
  const normalizedUnit = unit.trim();

  if (!normalizedUnit) {
    return `${quantity}`;
  }

  if (/^(ml|l|g|kg)$/i.test(normalizedUnit)) {
    return `${quantity}${normalizedUnit}`;
  }

  return `${quantity} ${normalizedUnit}`;
}

function getModifiedDateLabel() {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildPreviewChange(
  change: AiPlanChange,
  items: ListItem[],
  index: number
): PreviewChange {
  const previousItem = items
    .map(normalizeGroceryItem)
    .find(
      (item) =>
        item.text.toLowerCase() === change.targetItem.toLowerCase() ||
        item.text.toLowerCase().includes(change.targetItem.toLowerCase())
    );

  const updatedItem = change.updatedItem
    ? normalizeGroceryItem({
        id: previousItem?.id ?? `preview-${index}`,
        text: change.updatedItem.item,
        completed: previousItem?.completed ?? false,
        category: change.updatedItem.category,
        quantity: change.updatedItem.quantity,
        unit: change.updatedItem.unit,
        badge: change.updatedItem.badge,
      })
    : undefined;

  const canApply =
    change.type === "add"
      ? Boolean(updatedItem)
      : change.type === "remove"
        ? Boolean(previousItem)
        : Boolean(previousItem && updatedItem);

  return {
    id: `preview-${index}-${change.type}`,
    type: change.type,
    targetItemId: previousItem?.id,
    targetItemLabel:
      previousItem?.text ||
      change.targetItem ||
      updatedItem?.text ||
      "List item",
    previousItem,
    updatedItem,
    reason: change.reason,
    canApply,
  };
}

function findItemIndex(
  items: ListItem[],
  targetItemId?: string,
  targetItemLabel?: string
) {
  if (targetItemId) {
    const itemIndex = items.findIndex((item) => item.id === targetItemId);
    if (itemIndex !== -1) {
      return itemIndex;
    }
  }

  if (!targetItemLabel) {
    return -1;
  }

  const normalizedTarget = targetItemLabel.toLowerCase();

  return items.findIndex(
    (item) =>
      item.text.toLowerCase() === normalizedTarget ||
      item.text.toLowerCase().includes(normalizedTarget)
  );
}

function createAiListItem(change: PreviewChange): ListItem | null {
  if (!change.updatedItem) {
    return null;
  }

  return {
    id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: change.updatedItem.text,
    completed: false,
    category: change.updatedItem.category,
    quantity: change.updatedItem.quantity,
    unit: change.updatedItem.unit,
    badge: change.updatedItem.badge,
  };
}

function getChangeLabel(change: PreviewChange) {
  switch (change.type) {
    case "add":
      return "Add";
    case "remove":
      return "Remove";
    case "update":
      return "Update";
    case "replace":
      return "Replace";
    default:
      return "Change";
  }
}

export default function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { feedback?: ActionFeedback } | undefined;
  const [list, setList] = useState(() => getListById(listId || ""));
  const [aiPrompt, setAiPrompt] = useState("");
  const [lastAiPrompt, setLastAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [aiPlan, setAiPlan] = useState<AiListPlan | null>(null);
  const [previewChanges, setPreviewChanges] = useState<PreviewChange[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [highlightedItemIds, setHighlightedItemIds] = useState<string[]>([]);
  const { activeFeedback, dismissFeedback } = useTransientFeedback(
    routeState?.feedback
  );

  useEffect(() => {
    setList(getListById(listId || ""));
  }, [listId]);

  useEffect(() => {
    if (!list) {
      navigate("/");
    }
  }, [list, navigate]);

  useEffect(() => {
    if (!isAiLoading) {
      setLoadingStepIndex(0);
      return;
    }

    setLoadingStepIndex(0);
    const timer = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        current >= AI_LOADING_STEPS.length - 1 ? current : current + 1
      );
    }, 900);

    return () => window.clearInterval(timer);
  }, [isAiLoading]);

  useEffect(() => {
    if (!highlightedItemIds.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHighlightedItemIds([]);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [highlightedItemIds]);

  if (!list) {
    return null;
  }

  const refreshList = () => {
    setList(getListById(listId || ""));
  };

  const normalizedItems = list.items.map(normalizeGroceryItem);
  const usesDetailedLayout =
    list.id === "1" ||
    list.items.some(
      (item) =>
        Boolean(item.category) ||
        Boolean(item.quantity) ||
        Boolean(item.unit) ||
        Boolean(item.badge)
    );
  const categories = usesDetailedLayout
    ? Array.from(new Set(normalizedItems.map((item) => item.category)))
    : [];

  const getItemsByCategory = (category: string) =>
    normalizedItems.filter((item) => item.category === category);

  const getCategoryProgress = (category: string) => {
    const items = getItemsByCategory(category);
    const completed = items.filter((item) => item.completed).length;
    return `${completed}/${items.length}`;
  };

  const totalItems = list.items.length;
  const completedCount = list.items.filter((item) => item.completed).length;
  const hasPendingAiChanges = previewChanges.length > 0;

  const commitListItems = (nextItems: ListItem[]) => {
    if (!listId) {
      return;
    }

    updateList(listId, {
      items: nextItems,
      modifiedDate: getModifiedDateLabel(),
    });
    refreshList();
  };

  const handleToggleItem = (itemId: string) => {
    if (!listId) {
      return;
    }

    const item = list.items.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    updateItemInList(listId, itemId, { completed: !item.completed });
    refreshList();
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    if (!listId) {
      return;
    }

    const item = normalizedItems.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    updateItemInList(listId, itemId, {
      quantity: Math.max(1, item.quantity + delta),
    });
    refreshList();
  };

  const handleDeleteItem = (itemId: string) => {
    if (!listId) {
      return;
    }

    deleteItemFromList(listId, itemId);
    refreshList();
  };

  const handleUndoLastAiAction = () => {
    if (!undoState) {
      return;
    }

    commitListItems(undoState.items);
    setUndoState(null);
    setHighlightedItemIds([]);
  };

  const applyPreviewChanges = (changesToApply: PreviewChange[]) => {
    if (!changesToApply.length) {
      return;
    }

    const previousItems = list.items.map((item) => ({ ...item }));
    const nextItems = list.items.map((item) => ({ ...item }));
    const highlightedIds: string[] = [];

    changesToApply.forEach((change) => {
      const targetIndex = findItemIndex(
        nextItems,
        change.targetItemId,
        change.previousItem?.text ?? change.targetItemLabel
      );

      switch (change.type) {
        case "add": {
          const createdItem = createAiListItem(change);
          if (!createdItem) {
            break;
          }

          nextItems.push(createdItem);
          highlightedIds.push(createdItem.id);
          break;
        }
        case "remove": {
          if (targetIndex === -1) {
            break;
          }

          nextItems.splice(targetIndex, 1);
          break;
        }
        case "update":
        case "replace": {
          if (targetIndex === -1 || !change.updatedItem) {
            break;
          }

          nextItems[targetIndex] = {
            ...nextItems[targetIndex],
            text: change.updatedItem.text,
            category: change.updatedItem.category,
            quantity: change.updatedItem.quantity,
            unit: change.updatedItem.unit,
            badge: change.updatedItem.badge,
          };
          highlightedIds.push(nextItems[targetIndex].id);
          break;
        }
      }
    });

    commitListItems(nextItems);
    setUndoState({
      items: previousItems,
      message:
        changesToApply.length === 1
          ? `Applied 1 AI change`
          : `Applied ${changesToApply.length} AI changes`,
    });
    setHighlightedItemIds(highlightedIds);

    const remainingChanges = previewChanges.filter(
      (change) => !changesToApply.some((applied) => applied.id === change.id)
    );

    setPreviewChanges(remainingChanges);
    if (!remainingChanges.length) {
      setAiPlan(null);
    }
  };

  const handleSubmitAiPrompt = async (promptOverride?: string) => {
    const nextPrompt = (promptOverride ?? aiPrompt).trim();
    if (!nextPrompt || isAiLoading) {
      return;
    }

    setLastAiPrompt(nextPrompt);
    setAiPrompt("");
    setIsAiLoading(true);
    setAiError(null);
    setAiPlan(null);
    setPreviewChanges([]);

    try {
      const plan = await requestListAiPlan(
        nextPrompt,
        list.items,
        getAiRulesContext()
      );

      setAiPlan(plan);
      setPreviewChanges(
        plan.changes.map((change, index) =>
          buildPreviewChange(change, list.items, index)
        )
      );
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "The AI could not update this list."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const addItemCallout = (
    <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#E0E8E2] bg-[#F5FAF6] p-4">
      <div>
        <p className="text-[14px] font-semibold text-[#1A1A1A]">
          Need to add something?
        </p>
      </div>
      <button
        onClick={() => navigate(`/list/${listId}/add-item`)}
        className="rounded-xl bg-[#2D6A4F] px-4 py-3 text-[12px] font-bold text-white transition-colors hover:bg-[#255940]"
      >
        + Add Item
      </button>
    </div>
  );

  const deleteButton = (itemId: string) => (
    <button
      onClick={() => handleDeleteItem(itemId)}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#CCCCCC] text-[#8A8A8A] transition-colors hover:border-[#D9534F] hover:text-[#D9534F]"
      type="button"
      aria-label="Delete item"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );

  const renderAiAssistant = () => {
    const shouldRenderAssistant =
      Boolean(lastAiPrompt) ||
      isAiLoading ||
      Boolean(aiError) ||
      Boolean(aiPlan) ||
      Boolean(undoState);

    if (!shouldRenderAssistant) {
      return null;
    }

    return (
      <div className="px-6 pt-4 space-y-3">
        {lastAiPrompt && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-[24px] rounded-br-[8px] bg-[#2D6A4F] px-4 py-3 text-white shadow-[0_8px_20px_rgba(45,106,79,0.16)]">
              <p className="text-[14px] leading-6">{lastAiPrompt}</p>
            </div>
          </div>
        )}

        {isAiLoading && (
          <div className="rounded-[28px] border border-[#DCE7DE] bg-[linear-gradient(135deg,#F5FAF6_0%,#EDF6EF_100%)] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE7DE] bg-white/80">
                <LoaderCircle className="h-5 w-5 animate-spin text-[#2D6A4F]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#1A1A1A]">
                  AI is adjusting this list
                </p>
                <p className="mt-1 text-[12px] text-[#66736A]">
                  Your list stays visible while the assistant prepares a small set
                  of safe edits.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {AI_LOADING_STEPS.map((step, index) => {
                const isComplete = index < loadingStepIndex;
                const isActive = index === loadingStepIndex;

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                        isComplete
                          ? "border-[#2D6A4F] bg-[#2D6A4F] text-white"
                          : isActive
                            ? "border-[#2D6A4F] bg-white text-[#2D6A4F]"
                            : "border-[#D0DAD3] bg-white text-[#9AA69D]"
                      }`}
                    >
                      {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </div>
                    <p
                      className={`text-[13px] ${
                        isActive || isComplete
                          ? "text-[#1A1A1A]"
                          : "text-[#8A9790]"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {aiError && !isAiLoading && (
          <div className="rounded-[28px] border border-[#E8D6D6] bg-[#FFF7F7] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F1DDDD] bg-white text-[#B14B4B]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#1A1A1A]">
                  The AI could not finish that request
                </p>
                <p className="mt-1 text-[12px] text-[#7A6666]">{aiError}</p>
              </div>
            </div>
          </div>
        )}

        {undoState && !hasPendingAiChanges && !isAiLoading && (
          <div className="rounded-[28px] border border-[#DCE7DE] bg-[#F5FAF6] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE7DE] bg-white text-[#2D6A4F]">
                <Check className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#1A1A1A]">
                  {undoState.message}
                </p>
                <p className="mt-1 text-[12px] text-[#66736A]">
                  Updated rows are highlighted in the list below.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUndoLastAiAction}
                className="inline-flex items-center gap-2 rounded-full border border-[#DCE7DE] bg-white px-4 py-2 text-[12px] font-bold text-[#2D6A4F] transition-colors hover:bg-[#ECF4EE]"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </button>
            </div>
          </div>
        )}

        {aiPlan && !isAiLoading && !aiError && (
          <div className="rounded-[28px] border border-[#DCE7DE] bg-white p-5 shadow-[0_12px_32px_rgba(26,26,26,0.04)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE7DE] bg-[#F5FAF6]">
                <Sparkles className="h-5 w-5 text-[#2D6A4F]" />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#1A1A1A]">
                  AI Suggestions
                </p>
                <p className="mt-1 text-[12px] text-[#66736A]">
                  {aiPlan.summary}
                </p>
              </div>
            </div>

            {aiPlan.ruleMatches.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {aiPlan.ruleMatches.map((rule) => (
                  <span
                    key={rule}
                    className="rounded-full border border-[#DCE7DE] bg-[#F5FAF6] px-3 py-1.5 text-[11px] font-semibold text-[#2D6A4F]"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            )}

            {previewChanges.length > 0 ? (
              <div className="mt-4 space-y-3">
                {previewChanges.map((change) => (
                  <div
                    key={change.id}
                    className={`rounded-2xl border p-4 ${
                      change.canApply
                        ? "border-[#E6ECE7] bg-[#FAFCFA]"
                        : "border-[#F0DCDC] bg-[#FFF8F8]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#2D6A4F] border border-[#DCE7DE]">
                            {getChangeLabel(change)}
                          </span>
                          <p className="text-[14px] font-bold text-[#1A1A1A]">
                            {change.targetItemLabel}
                          </p>
                        </div>
                        <p className="mt-2 text-[12px] text-[#66736A]">
                          {change.reason}
                        </p>
                        <div className="mt-3 space-y-2">
                          {change.previousItem && (
                            <div className="rounded-xl border border-[#EEEEEE] bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A8A8A]">
                                Current
                              </p>
                              <p className="mt-1 text-[13px] font-semibold text-[#1A1A1A]">
                                {change.previousItem.text}
                              </p>
                              <p className="text-[11px] text-[#888888]">
                                {formatAmountLabel(
                                  change.previousItem.quantity,
                                  change.previousItem.unit
                                )}
                              </p>
                            </div>
                          )}
                          {change.updatedItem && (
                            <div className="rounded-xl border border-[#DCE7DE] bg-[#F5FAF6] px-3 py-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5D7D67]">
                                Proposed
                              </p>
                              <p className="mt-1 text-[13px] font-semibold text-[#1A1A1A]">
                                {change.updatedItem.text}
                              </p>
                              <p className="text-[11px] text-[#66736A]">
                                {formatAmountLabel(
                                  change.updatedItem.quantity,
                                  change.updatedItem.unit
                                )}{" "}
                                · {change.updatedItem.category}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyPreviewChanges([change])}
                        disabled={!change.canApply}
                        className="rounded-xl border border-[#2D6A4F] px-4 py-3 text-[12px] font-bold text-[#2D6A4F] transition-colors hover:bg-[#F0F5F1] disabled:cursor-not-allowed disabled:border-[#D0DAD3] disabled:text-[#9AA69D] disabled:hover:bg-transparent"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[#E6ECE7] bg-[#FAFCFA] p-4">
                <p className="text-[13px] text-[#66736A]">
                  No list changes were suggested. Try a more specific prompt if
                  you want the assistant to make edits.
                </p>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  applyPreviewChanges(
                    previewChanges.filter((change) => change.canApply)
                  )
                }
                disabled={!previewChanges.some((change) => change.canApply)}
                className="flex-1 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#255940] disabled:cursor-not-allowed disabled:bg-[#9DB9AA]"
              >
                Apply All
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiPlan(null);
                  setPreviewChanges([]);
                  setAiError(null);
                }}
                className="flex-1 rounded-2xl border border-[#DCE7DE] px-4 py-3 text-[13px] font-bold text-[#66736A] transition-colors hover:bg-[#F7FAF8]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen pb-[320px] max-w-[608px] mx-auto">
      <div className="sticky top-0 bg-white z-10">
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
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#F5F5F5]">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-[18px] font-bold text-[#1A1A1A]">
              {list.name}
            </h1>
            <p className="text-[12px] text-[#999999]">
              {completedCount}/{totalItems} items checked · Modified{" "}
              {list.modifiedDate}
            </p>
          </div>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={() => navigate("*")}
          >
            <Share2 className="w-6 h-6 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {activeFeedback && (
        <FeedbackBanner feedback={activeFeedback} onDismiss={dismissFeedback} />
      )}

      {renderAiAssistant()}

      {usesDetailedLayout ? (
        <div className="px-6 py-4">
          {addItemCallout}
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1A1A1A]">
                  • {category}
                </h3>
                <span className="text-[11px] text-[#999999]">
                  {getCategoryProgress(category)}
                </span>
              </div>
              <div className="space-y-3">
                {getItemsByCategory(category).map((item) => {
                  const isHighlighted = highlightedItemIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 rounded-2xl py-1 transition-all ${
                        isHighlighted
                          ? "bg-[#F5FAF6] px-3 ring-1 ring-[#DCE7DE]"
                          : ""
                      }`}
                      style={{ opacity: item.completed ? 0.5 : 1 }}
                    >
                      {deleteButton(item.id)}
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className="flex-shrink-0"
                        type="button"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                            item.completed
                              ? "bg-[#2D6A4F] border-[#2D6A4F]"
                              : "border-[#CCCCCC] hover:border-[#2D6A4F]"
                          }`}
                        >
                          {item.completed && (
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-[14px] font-bold ${
                              item.completed
                                ? "line-through text-[#1A1A1A]"
                                : "text-[#1A1A1A]"
                            }`}
                          >
                            {item.text}
                          </span>
                          {item.badge && (
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                item.badge === "SALE"
                                  ? "bg-[#FFF3E0] text-[#F57C00]"
                                  : "bg-[#FFEBEE] text-[#D32F2F]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11.5px] text-[#888888]">
                          {formatAmountLabel(item.quantity, item.unit)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-2 py-1.5">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="text-[#888888] hover:text-[#1A1A1A] text-[16px] font-bold px-2"
                          type="button"
                        >
                          −
                        </button>
                        <span className="text-[14px] font-bold text-[#1A1A1A] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="text-[#2D6A4F] hover:text-[#1F4F38] text-[16px] font-bold px-2"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-4">
          {addItemCallout}
          {list.items.length === 0 ? (
            <div className="text-center py-12 text-[#999999]">
              No items yet. Ask the AI to build a few starter items, or use the
              add-item flow.
            </div>
          ) : (
            <div className="space-y-2">
              {list.items.map((item) => {
                const isHighlighted = highlightedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                      isHighlighted
                        ? "bg-[#F5FAF6] ring-1 ring-[#DCE7DE]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {deleteButton(item.id)}
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="flex-shrink-0"
                      type="button"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          item.completed
                            ? "border-transparent"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{
                          backgroundColor: item.completed ? list.color : "transparent",
                        }}
                      >
                        {item.completed && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                    <span
                      className={`flex-1 text-[15px] ${
                        item.completed
                          ? "text-[#999999] line-through"
                          : "text-[#1A1A1A]"
                      }`}
                    >
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-[111px] left-0 right-0 bg-white border-t border-[#F5F5F5] p-4 max-w-[608px] mx-auto">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {QUICK_AI_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => handleSubmitAiPrompt(action.prompt)}
              disabled={isAiLoading}
              className="shrink-0 rounded-full border border-[#DCE7DE] bg-[#F7FAF7] px-4 py-2 text-[12px] font-semibold text-[#2D6A4F] transition-colors hover:bg-[#EDF5EF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E0E8E2] bg-[#F0F5F1] px-4 py-3">
            <Sparkles className="w-5 h-5 text-[#2D6A4F] opacity-50" />
            <input
              type="text"
              placeholder="Ask the AI to adjust this list"
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmitAiPrompt();
                }
              }}
              className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
            />
            <button
              className="w-10 h-10 rounded-xl bg-[#2D6A4F] flex items-center justify-center transition-colors hover:bg-[#255940] disabled:cursor-not-allowed disabled:bg-[#9DB9AA]"
              onClick={() => handleSubmitAiPrompt()}
              disabled={!aiPrompt.trim() || isAiLoading}
              type="button"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {list.items.length > 0 && (
          <div className="flex gap-3">
            <button
              className="flex-1 py-3 px-4 border-2 border-[#2D6A4F] rounded-2xl text-[#2D6A4F] font-bold hover:bg-[#F0F5F1] transition-colors"
              onClick={() =>
                navigate("/price-comparison", {
                  state: {
                    listId,
                    items: normalizedItems,
                    feedback: {
                      title: "Comparison ready",
                      message: `Comparing ${normalizedItems.length} items across 3 stores.`,
                      tone: "info",
                    },
                  },
                })
              }
              type="button"
            >
              Compare Prices
            </button>
            <button
              className="flex-1 py-3 px-4 bg-[#2D6A4F] rounded-2xl text-white font-bold hover:bg-[#255940] transition-colors"
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    listId,
                    items: normalizedItems,
                    feedback: {
                      title: "Checkout ready",
                      message: "Your basket is ready to review and continue.",
                      tone: "success",
                    },
                  },
                })
              }
              type="button"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
