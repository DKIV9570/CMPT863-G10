import type { ListItem } from "../store/listsStore";

const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();
const AI_RULES_STORAGE_KEY = "shopbuddy-ai-rules";

export type AiRulesContext = {
  dietaryPreferences: string[];
  preferredBrands: string[];
  avoidedBrands: string[];
  orderRules: string[];
  budgetLimit: number | null;
  preferredStores: string[];
  checkoutStrategy: "cheapest" | "single-store" | "preferred-first";
  categoryBrandPreferences: Record<string, string>;
};

export type AiSuggestedItem = {
  item: string;
  category: string;
  quantity: number;
  unit: string;
  badge?: "SALE" | "OUT";
};

export type AiChangeType = "add" | "remove" | "update" | "replace";

export type AiPlanChange = {
  type: AiChangeType;
  targetItem: string;
  updatedItem?: AiSuggestedItem;
  reason: string;
};

export type AiListPlan = {
  summary: string;
  ruleMatches: string[];
  changes: AiPlanChange[];
};

const EMPTY_RULES: AiRulesContext = {
  dietaryPreferences: [],
  preferredBrands: [],
  avoidedBrands: [],
  orderRules: [],
  budgetLimit: null,
  preferredStores: [],
  checkoutStrategy: "cheapest",
  categoryBrandPreferences: {},
};

function normalizeItem(item: ListItem) {
  return {
    item: item.text,
    category: item.category ?? "Other",
    quantity: item.quantity ?? 1,
    unit: item.unit ?? "each",
    completed: item.completed,
    badge: item.badge,
  };
}

function extractJsonBlock(text: string): string {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const startIndex = text.indexOf("{");
  const endIndex = text.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return text.slice(startIndex, endIndex + 1);
  }

  return text.trim();
}

function normalizeSuggestedItem(rawItem: unknown): AiSuggestedItem | null {
  if (!rawItem || typeof rawItem !== "object") {
    return null;
  }

  const item = rawItem as Record<string, unknown>;
  const badgeValue =
    item.badge === "SALE" || item.badge === "OUT" ? item.badge : undefined;

  if (
    typeof item.item !== "string" ||
    typeof item.category !== "string" ||
    typeof item.quantity !== "number" ||
    typeof item.unit !== "string"
  ) {
    return null;
  }

  return {
    item: item.item.trim(),
    category: item.category.trim() || "Other",
    quantity: Math.max(1, Math.round(item.quantity)),
    unit: item.unit.trim() || "each",
    badge: badgeValue,
  };
}

export function parseListAiPlan(text: string): AiListPlan | null {
  const candidate = extractJsonBlock(text);

  try {
    const parsed = JSON.parse(candidate);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "The AI prepared a few updates for this list.";

    const ruleMatches = Array.isArray(parsed.ruleMatches)
      ? parsed.ruleMatches.filter(
          (rule): rule is string => typeof rule === "string" && Boolean(rule.trim())
        )
      : [];

    const changes = Array.isArray(parsed.changes)
      ? parsed.changes
          .map((change) => {
            if (!change || typeof change !== "object") {
              return null;
            }

            const rawChange = change as Record<string, unknown>;
            const type =
              rawChange.type === "add" ||
              rawChange.type === "remove" ||
              rawChange.type === "update" ||
              rawChange.type === "replace"
                ? rawChange.type
                : null;

            if (!type || typeof rawChange.reason !== "string") {
              return null;
            }

            return {
              type,
              targetItem:
                typeof rawChange.targetItem === "string"
                  ? rawChange.targetItem.trim()
                  : "",
              updatedItem: normalizeSuggestedItem(rawChange.updatedItem),
              reason: rawChange.reason.trim(),
            } satisfies AiPlanChange;
          })
          .filter((change): change is AiPlanChange => Boolean(change))
      : [];

    return {
      summary,
      ruleMatches,
      changes,
    };
  } catch {
    return null;
  }
}

export function getAiRulesContext(): AiRulesContext {
  if (typeof window === "undefined") {
    return EMPTY_RULES;
  }

  try {
    const rawRules = window.localStorage.getItem(AI_RULES_STORAGE_KEY);
    if (!rawRules) {
      return EMPTY_RULES;
    }

    const parsed = JSON.parse(rawRules) as Partial<AiRulesContext>;
    const checkoutStrategy =
      parsed.checkoutStrategy === "cheapest" ||
      parsed.checkoutStrategy === "single-store" ||
      parsed.checkoutStrategy === "preferred-first"
        ? parsed.checkoutStrategy
        : "cheapest";

    return {
      dietaryPreferences: Array.isArray(parsed.dietaryPreferences)
        ? parsed.dietaryPreferences.filter(
            (rule): rule is string => typeof rule === "string"
          )
        : [],
      preferredBrands: Array.isArray(parsed.preferredBrands)
        ? parsed.preferredBrands.filter(
            (rule): rule is string => typeof rule === "string"
          )
        : [],
      avoidedBrands: Array.isArray(parsed.avoidedBrands)
        ? parsed.avoidedBrands.filter(
            (rule): rule is string => typeof rule === "string"
          )
        : [],
      orderRules: Array.isArray(parsed.orderRules)
        ? parsed.orderRules.filter(
            (rule): rule is string => typeof rule === "string"
          )
        : [],
      budgetLimit:
        typeof parsed.budgetLimit === "number" ? parsed.budgetLimit : null,
      preferredStores: Array.isArray(parsed.preferredStores)
        ? parsed.preferredStores.filter(
            (s): s is string => typeof s === "string"
          )
        : [],
      checkoutStrategy,
      categoryBrandPreferences:
        parsed.categoryBrandPreferences &&
        typeof parsed.categoryBrandPreferences === "object" &&
        !Array.isArray(parsed.categoryBrandPreferences)
          ? parsed.categoryBrandPreferences
          : {},
    };
  } catch {
    return EMPTY_RULES;
  }
}

function buildListAiPrompt(
  prompt: string,
  items: ListItem[],
  rules: AiRulesContext
) {
  return `
You are helping a user edit an existing grocery list in a mobile shopping app.

Current list:
${JSON.stringify(items.map(normalizeItem), null, 2)}

Persistent AI rules:
${JSON.stringify(rules, null, 2)}

Brand guidance:
- Prefer these brands when possible: ${
   rules.preferredBrands.length ? rules.preferredBrands.join(", ") : "None saved"
 }
- Avoid these brands: ${
   rules.avoidedBrands.length ? rules.avoidedBrands.join(", ") : "None saved"
 }
- Treat any custom brands in those lists as real brand rules, even if they are not common household names.
- Category-specific brand preferences: ${
   Object.entries(rules.categoryBrandPreferences).filter(([, v]) => v.trim()).map(([cat, brand]) => `${cat}: prefer ${brand}`).join("; ") || "None set"
 }

Budget & store guidance:
- Budget limit: ${rules.budgetLimit !== null ? `Keep total under $${rules.budgetLimit} per trip` : "No limit set"}
- Preferred stores: ${rules.preferredStores.length ? rules.preferredStores.join(", ") : "No preference"}
- Checkout strategy: ${
   rules.checkoutStrategy === "cheapest" ? "Cheapest overall — split cart across stores to minimize cost" :
   rules.checkoutStrategy === "single-store" ? "Single store only — buy everything from one store" :
   "Preferred stores first — prioritize the user's preferred stores"
 }

User request:
${prompt}

Instructions:
- Make small, focused edits to the current list.
- Preserve existing items unless the request clearly changes them.
- Prefer 1 to 4 changes, unless the user explicitly asks for more.
- Explain each change briefly.
- Mention any rules that influenced your decision.
- Do not rename the list.
- Return JSON only, without markdown.

JSON format:
{
  "summary": "short summary of the update",
  "ruleMatches": ["list any rules that affected the result"],
  "changes": [
    {
      "type": "add" | "remove" | "update" | "replace",
      "targetItem": "existing item name for remove/update/replace; empty string for add",
      "updatedItem": {
        "item": "new item name",
        "category": "Produce | Dairy | Meat | Pantry | Other",
        "quantity": 1,
        "unit": "each",
        "badge": "SALE | OUT | omit"
      },
      "reason": "short explanation"
    }
  ]
}

For remove changes, omit updatedItem.
For add changes, include updatedItem.
For update and replace changes, include the full updatedItem.
If no change is needed, return an empty changes array with a helpful summary.
`;
}

export async function requestListAiPlan(
  prompt: string,
  items: ListItem[],
  rules: AiRulesContext
): Promise<AiListPlan> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "Missing VITE_OPENAI_API_KEY. Add it to a local .env file and restart the dev server."
    );
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
          content: buildListAiPrompt(prompt, items, rules),
        },
      ],
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI request failed (${response.status}): ${errorText || "Unknown error"}`
    );
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content;

  if (typeof message !== "string" || !message.trim()) {
    throw new Error("No response from AI.");
  }

  const plan = parseListAiPlan(message);
  if (!plan) {
    throw new Error("The AI response could not be parsed into list changes.");
  }

  return plan;
}
