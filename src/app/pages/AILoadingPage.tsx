import React, { useEffect, useState } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useLocation, useNavigate } from "react-router";
import { addList, ShoppingList } from "../store/listsStore";

const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();

type GroceryItem = {
  category: string;
  item: string;
  quantity: number;
  unit: string;
};

type ParsedAIResponse = {
  title?: string;
  items: GroceryItem[];
};

type ReviewItem = GroceryItem & {
  id: string;
};

type ReviewList = {
  title: string;
  items: ReviewItem[];
};

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function getRequestedItemCount(prompt: string) {
  const digitMatch = prompt.match(/\b(\d+)\s+items?\b/i);
  if (digitMatch) {
    return Math.max(1, Math.min(10, Number(digitMatch[1])));
  }

  const wordMatch = prompt.match(
    /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s+items?\b/i
  );

  if (wordMatch) {
    return NUMBER_WORDS[wordMatch[1].toLowerCase()] ?? null;
  }

  return null;
}

function toTitleCase(text: string) {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function buildFallbackTitle(prompt: string, requestedItemCount: number | null) {
  const cleanedPrompt = prompt
    .replace(/^(build|create|make|generate|give me|help me make)\s+/i, "")
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/\b(grocery|shopping)\s+list\b/i, "")
    .replace(/\blist\b/i, "")
    .replace(/\bwith\s+\d+\s+items?\b/i, "")
    .replace(
      /\bwith\s+(one|two|three|four|five|six|seven|eight|nine|ten)\s+items?\b/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedPrompt) {
    if (requestedItemCount === 1) {
      return "Single Item List";
    }

    return "Custom Grocery List";
  }

  const title = toTitleCase(cleanedPrompt);
  return /\b(list|groceries|grocery|breakfast|lunch|dinner|snacks|ingredients)\b/i.test(
    title
  )
    ? title
    : `${title} List`;
}

function normalizeItems(rawItems: unknown[], requestedItemCount: number | null): GroceryItem[] {
  const normalized = rawItems
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .filter(
      (item) =>
        typeof item.item === "string" &&
        typeof item.category === "string" &&
        typeof item.quantity === "number" &&
        typeof item.unit === "string"
    )
    .map((item) => ({
      item: item.item as string,
      category: item.category as string,
      quantity: item.quantity as number,
      unit: item.unit as string,
    }));

  return requestedItemCount ? normalized.slice(0, requestedItemCount) : normalized;
}

function parseAiResponse(text: string, requestedItemCount: number | null): ParsedAIResponse | null {
  if (!text.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return {
        items: normalizeItems(parsed, requestedItemCount),
      };
    }

    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return {
        title: typeof parsed.title === "string" ? parsed.title.trim() : undefined,
        items: normalizeItems(parsed.items, requestedItemCount),
      };
    }
  } catch {
    return null;
  }

  return null;
}

function toReviewItems(items: GroceryItem[]): ReviewItem[] {
  return items.map((item, index) => ({
    ...item,
    id: `${item.category}-${item.item}-${index}`,
  }));
}

function toSnapshot(reviewList: ReviewList, title: string): ParsedAIResponse {
  return {
    title,
    items: reviewList.items.map(({ id: _id, ...item }) => item),
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

function buildAiPrompt(
  activePrompt: string,
  requestedItemCount: number | null,
  submittedContext: ParsedAIResponse | null
) {
  const isEditingExistingList = Boolean(submittedContext?.items.length);
  const currentListContextText = submittedContext
    ? JSON.stringify(submittedContext, null, 2)
    : "";

  return `
  You are a helpful assistant that suggests grocery items based on a user's meal plan.
  ${
    isEditingExistingList
      ? "Update the user's existing grocery list based on their follow-up request. Return the full revised list, not just the changed items."
      : "Generate a personalized grocery list - including breakfast, lunch, and dinner. Items ONLY."
  }
  Include a variety of items across different food groups when appropriate.
  Only provide the list of items and how many they should purchase, without any additional commentary or explanations.
  Please give specific items and quantities, such as '2 lbs of chicken breast' or '1 dozen eggs'.
  Label each item with its category (e.g., Produce, Dairy, Meat, Pantry) for easy organization.
  Please only suggest items that fall into these categories and label them as such.
  ${
    isEditingExistingList
      ? `This is the user's current grocery list:
${currentListContextText}

This is the follow-up edit request from the user: ${activePrompt}
Preserve existing items unless the new request changes them.
Keep the current list title exactly the same unless the user explicitly asks to rename it.`
      : `This is the prompt the user gives: ${activePrompt}`
  }
  ${
    requestedItemCount
      ? `The user explicitly asked for ${requestedItemCount} item${
          requestedItemCount === 1 ? "" : "s"
        }. Return exactly ${requestedItemCount} item${
          requestedItemCount === 1 ? "" : "s"
        }, no more and no fewer.`
      : "Return up to 10 items."
  }
  Return a JSON object and do not include markdown:
    {
      title: string; a short, human-friendly list title in 2-5 words,
      items: [
        {
          category: string; (e.g., 'Produce', 'Dairy', 'Meat', 'Pantry')
          item: string; (e.g., 'Chicken Breast', 'Eggs', 'Milk', 'Bread')
          quantity: number; (e.g., 2, 1, 3)
          unit: string; (e.g., 'lbs', 'dozen', 'cups')
        }
      ]
    }
  ${requestedItemCount ? "" : "Limit the amount of items to 10."}
  `;
}

export default function LoadingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrompt =
    typeof location.state?.prompt === "string" && location.state.prompt.trim()
      ? location.state.prompt.trim()
      : "Build a weekly list for 2";

  const [activePrompt, setActivePrompt] = useState(initialPrompt);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([initialPrompt]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rawAiText, setRawAiText] = useState("");
  const [reviewList, setReviewList] = useState<ReviewList | null>(null);
  const [listTitle, setListTitle] = useState("");
  const [hasEditedTitle, setHasEditedTitle] = useState(false);
  const [submittedContext, setSubmittedContext] = useState<ParsedAIResponse | null>(null);

  const requestedItemCount = getRequestedItemCount(activePrompt);
  const parsedResponse = parseAiResponse(rawAiText, requestedItemCount);
  const hasValidItems = Boolean(reviewList?.items.length);
  const isEditingExistingList = Boolean(submittedContext?.items.length);
  const headerTitle = isLoading
    ? isEditingExistingList
      ? "Updating your list..."
      : "Generating your list..."
    : hasValidItems
      ? "Review your list"
      : "Something went wrong";
  const headerSubtitle = isLoading
    ? isEditingExistingList
      ? "Applying your latest change to the current list"
      : "Creating a grocery list based on what you asked for"
    : hasValidItems
      ? "Check the title and items before creating it"
      : "We couldn't finish the AI update";
  const finalListTitle =
    listTitle.trim() ||
    reviewList?.title ||
    buildFallbackTitle(activePrompt, requestedItemCount);

  const groupedCategories = reviewList
    ? Array.from(new Set(reviewList.items.map((item) => item.category)))
    : [];

  const getItemsByCategory = (category: string) =>
    reviewList?.items.filter((item) => item.category === category) ?? [];

  useEffect(() => {
    setActivePrompt(initialPrompt);
    setDraftPrompt("");
    setPromptHistory([initialPrompt]);
    setProgress(0);
    setIsLoading(true);
    setRawAiText("");
    setReviewList(null);
    setListTitle("");
    setHasEditedTitle(false);
    setSubmittedContext(null);
  }, [initialPrompt]);

  useEffect(() => {
    let isCancelled = false;
    let currentProgress = 0;

    setProgress(0);
    setIsLoading(true);

    const tick = () => {
      if (isCancelled) return;
      currentProgress += Math.random() * 1 + 2;
      if (currentProgress > 95) currentProgress = 95;
      setProgress(currentProgress);
      if (!isCancelled) {
        window.setTimeout(tick, 200);
      }
    };

    tick();

    (async () => {
      try {
        if (!OPENAI_API_KEY) {
          if (isCancelled) return;

          setRawAiText(
            "Missing Open API key. Add it to a local .env file and restart the dev server."
          );
          setReviewList(null);
          setProgress(0);
          return;
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: buildAiPrompt(activePrompt, requestedItemCount, submittedContext),
              },
            ],
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `OpenAI request failed (${response.status}): ${errorText || "Unknown error"}`
          );
        }

        const data = await response.json();
        const message = data.choices?.[0]?.message?.content || "No response from AI";

        if (isCancelled) return;

        setRawAiText(message);
        const nextResponse = parseAiResponse(message, requestedItemCount);

        if (nextResponse?.items.length) {
          const preservedTitle =
            submittedContext?.title ||
            (hasEditedTitle ? finalListTitle : "");
          const nextTitle =
            preservedTitle ||
            nextResponse.title ||
            buildFallbackTitle(activePrompt, requestedItemCount);

          setReviewList({
            title: nextTitle,
            items: toReviewItems(nextResponse.items),
          });

          if (!submittedContext && !hasEditedTitle) {
            setListTitle(nextTitle);
          }
        }

        setProgress(100);
      } catch (err) {
        console.error("AI fetch error:", err);
        if (!isCancelled) {
          setRawAiText("Failed to generate AI content.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activePrompt, submittedContext]);

  const handleSubmitPrompt = () => {
    const nextPrompt = draftPrompt.trim();
    if (!nextPrompt) return;

    setSubmittedContext(
      reviewList ? toSnapshot(reviewList, finalListTitle) : null
    );
    setActivePrompt(nextPrompt);
    setPromptHistory((current) => [...current, nextPrompt]);
    setDraftPrompt("");
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setReviewList((current) => {
      if (!current) return current;

      return {
        ...current,
        items: current.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        ),
      };
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setReviewList((current) => {
      if (!current) return current;

      return {
        ...current,
        items: current.items.filter((item) => item.id !== itemId),
      };
    });
  };

  const handleCreateList = () => {
    if (!reviewList?.items.length) return;

    const mappedItems = reviewList.items.map((item, index) => ({
      id: (index + 1).toString(),
      text: item.item,
      completed: false,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
    }));

    const newList: ShoppingList = {
      id: Date.now().toString(),
      name: finalListTitle,
      color: "green",
      items: mappedItems,
      modifiedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    addList(newList);
    navigate("/");
  };

  return (
    <div className="bg-white min-h-screen pb-[700px] max-w-[3000px] mx-auto">
      <div className="sticky top-0 bg-white z-10 border-b border-[#F5F5F5]">
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

        <div className="px-6 py-4 text-center">
          <h1 className="text-[18px] font-bold text-[#1A1A1A]">
            {headerTitle}
          </h1>
          <p className="text-[12px] text-[#999999] mt-1">
            {headerSubtitle}
          </p>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-4">
        {promptHistory.map((message, index) => (
          <div key={`${message}-${index}`} className="flex justify-end">
            <div className="max-w-[85%] rounded-[24px] rounded-br-[8px] bg-[#2D6A4F] px-4 py-3 text-white shadow-[0_8px_20px_rgba(45,106,79,0.2)]">
              <p className="text-[14px] leading-6">{message}</p>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 bg-[#F0F5F1] border border-[#E0E8E2] rounded-2xl px-4 py-4">
          <Sparkles className="w-5 h-5 text-[#2D6A4F] opacity-50" />
          <input
            type="text"
            placeholder="Ask the AI to adjust this list"
            value={draftPrompt}
            onChange={(event) => setDraftPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmitPrompt();
              }
            }}
            className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
          />
          <button
            className="w-12 h-12 bg-[#2D6A4F] rounded-xl flex items-center justify-center hover:bg-[#255940] transition-colors disabled:bg-[#9DB9AA] disabled:cursor-not-allowed"
            onClick={handleSubmitPrompt}
            disabled={!draftPrompt.trim() || isLoading}
            type="button"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-[#F7FAF8] border border-[#DDE8DF] rounded-2xl px-4 py-3">
          <input
            type="text"
            value={listTitle}
            onChange={(event) => {
              setHasEditedTitle(true);
              setListTitle(event.target.value);
              setReviewList((current) =>
                current ? { ...current, title: event.target.value } : current
              );
            }}
            placeholder="AI-Generated List"
            className="w-full rounded-2xl border border-[#D4E1D7] bg-white px-4 py-3 text-[15px] font-semibold text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
          />
        </div>
      </div>

      {reviewList?.items.length ? (
        <div className="px-6 py-4">
          {groupedCategories.map((category) => (
            <div key={category} className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1A1A1A]">
                  • {category}
                </h3>
                <span className="text-[11px] text-[#999999]">
                  {getItemsByCategory(category).length} items
                </span>
              </div>
              <div className="space-y-3">
                {getItemsByCategory(category).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-1">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#CCCCCC] text-[#8A8A8A] transition-colors hover:border-[#D9534F] hover:text-[#D9534F]"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex-1">
                      <span className="text-[14px] font-bold text-[#1A1A1A]">
                        {item.item}
                      </span>
                      <div className="text-[11.5px] text-[#888888]">
                        {formatAmountLabel(item.quantity, item.unit)}
                      </div>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : rawAiText ? (
        <div className="px-6 py-4 bg-[#F0F5F1] rounded-xl mt-4">
          <p className="text-[18px] text-[#1A1A1A]">{rawAiText}</p>
        </div>
      ) : null}

      {isLoading && (
        <div className="px-6 mt-6">
          <div className="w-full h-2 bg-[#E0E8E2] rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#2D6A4F] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="fixed bottom-[111px] left-0 right-0 bg-white p-4 border-t border-[#F5F5F5] max-w-[3000px] mx-auto flex gap-3">
        <button
          className="flex-1 py-3 px-4 border-2 border-[#2D6A4F] rounded-2xl text-[#2D6A4F] font-bold hover:bg-[#F0F5F1] transition-colors"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-3 px-4 bg-[#2D6A4F] rounded-2xl text-white font-bold hover:bg-[#255940] transition-colors disabled:bg-[#9DB9AA] disabled:cursor-not-allowed disabled:hover:bg-[#9DB9AA]"
          onClick={handleCreateList}
          disabled={!reviewList?.items.length || isLoading}
        >
          Create list
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
