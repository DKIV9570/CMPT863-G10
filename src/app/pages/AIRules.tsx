import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ListChecks,
  Plus,
  RotateCcw,
  Sparkles,
  Tags,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";

type RulesSettings = {
  dietaryPreferences: string[];
  preferredBrands: string[];
  avoidedBrands: string[];
  orderRules: string[];
};

const STORAGE_KEY = "shopbuddy-ai-rules";

const dietaryOptions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Nut-Free",
  "Lactose-Free",
  "Halal",
];

const brandOptions = [
  "President's Choice",
  "Great Value",
  "No Name",
  "Kirkland",
  "Compliments",
  "Organic Valley",
];

const starterRules = [
  "Prefer organic for all produce.",
  "Keep this trip under $80 when possible.",
  "Check Walmart discounts before choosing substitutes.",
];

const ruleTemplates = [
  "Add milk every 2 weeks.",
  "Check discounts at Walmart every Friday.",
  "Prefer Superstore when prices are within $2.",
  "Avoid suggesting high-sugar snacks.",
];

const defaultSettings: RulesSettings = {
  dietaryPreferences: ["Lactose-Free"],
  preferredBrands: ["President's Choice"],
  avoidedBrands: [],
  orderRules: starterRules,
};

function loadSettings(): RulesSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultSettings;
    }

    const parsed = JSON.parse(raw) as Partial<RulesSettings>;
    return {
      dietaryPreferences:
        parsed.dietaryPreferences ?? defaultSettings.dietaryPreferences,
      preferredBrands: parsed.preferredBrands ?? defaultSettings.preferredBrands,
      avoidedBrands: parsed.avoidedBrands ?? defaultSettings.avoidedBrands,
      orderRules: parsed.orderRules ?? defaultSettings.orderRules,
    };
  } catch {
    return defaultSettings;
  }
}

export default function AIRules() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<RulesSettings>(() => loadSettings());
  const [newRule, setNewRule] = useState("");
  const [customBrand, setCustomBrand] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const activeCount = useMemo(() => {
    return (
      settings.dietaryPreferences.length +
      settings.preferredBrands.length +
      settings.avoidedBrands.length +
      settings.orderRules.length
    );
  }, [settings]);

  const toggleDietaryPreference = (preference: string) => {
    setSettings((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter((item) => item !== preference)
        : [...prev.dietaryPreferences, preference],
    }));
  };

  const toggleBrand = (
    bucket: "preferredBrands" | "avoidedBrands",
    brand: string
  ) => {
    setSettings((prev) => {
      const current = prev[bucket];
      const oppositeBucket =
        bucket === "preferredBrands" ? "avoidedBrands" : "preferredBrands";

      return {
        ...prev,
        [bucket]: current.includes(brand)
          ? current.filter((item) => item !== brand)
          : [...current, brand],
        [oppositeBucket]: prev[oppositeBucket].filter((item) => item !== brand),
      };
    });
  };

  const addCustomBrand = (bucket: "preferredBrands" | "avoidedBrands") => {
    const brand = customBrand.trim();
    if (!brand) return;

    toggleBrand(bucket, brand);
    setCustomBrand("");
  };

  const addRule = (ruleText: string) => {
    const trimmed = ruleText.trim();
    if (!trimmed) return;

    setSettings((prev) => ({
      ...prev,
      orderRules: prev.orderRules.includes(trimmed)
        ? prev.orderRules
        : [...prev.orderRules, trimmed],
    }));
    setNewRule("");
  };

  const removeRule = (ruleText: string) => {
    setSettings((prev) => ({
      ...prev,
      orderRules: prev.orderRules.filter((rule) => rule !== ruleText),
    }));
  };

  const resetRules = () => {
    setSettings(defaultSettings);
    setNewRule("");
    setCustomBrand("");
  };

  return (
    <div className="bg-white min-h-screen pb-[132px] max-w-[3000px] mx-auto">
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

      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => navigate("/settings")}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E4EAE5] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D6A4F]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <p className="text-[13px] text-[#888888] mb-1">Guide the assistant</p>
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1A1A]">AI Rules</h1>
          <p className="text-[13px] text-[#6D6D6D] mt-1 max-w-[320px]">
            These preferences shape recommendations, substitutions, and store
            selection.
          </p>
          <button
            onClick={resetRules}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#DCE7DE] bg-[#F5FAF6] px-4 py-2 text-[12px] font-semibold text-[#2D6A4F] transition-colors hover:bg-[#ECF4EE]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <div className="rounded-[28px] border border-[#DCE7DE] bg-[linear-gradient(135deg,#F5FAF6_0%,#EDF6EF_100%)] p-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center border border-[#DCE7DE]">
              <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-[#1A1A1A]">
                Active Global Rules
              </p>
              <p className="text-[12px] text-[#66736A] mt-1">
                ShopBuddy will use these rules every time it suggests items,
                compares prices, and prepares checkout.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
              {activeCount} active preferences
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
              {settings.orderRules.length} order rules
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
              Applies to all lists
            </span>
          </div>
        </div>

        <section className="rounded-[28px] border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#F0F5F1] flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1A1A1A]">
                Dietary Preferences
              </h2>
              <p className="text-[12px] text-[#888888] mt-1">
                Help the AI avoid unsuitable ingredients and suggest better
                alternatives.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => {
              const isActive = settings.dietaryPreferences.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietaryPreference(option)}
                  className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                    isActive
                      ? "bg-[#2D6A4F] text-white"
                      : "bg-[#F4F7F4] text-[#496050] border border-[#E2E9E3]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#F0F5F1] flex items-center justify-center">
              <Tags className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1A1A1A]">
                Brand Choices
              </h2>
              <p className="text-[12px] text-[#888888] mt-1">
                Tell the AI which brands to prioritize and which ones to avoid.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6B7E71] mb-2">
                Preferred Brands
              </p>
              <div className="flex flex-wrap gap-2">
                {brandOptions.map((brand) => {
                  const isSelected = settings.preferredBrands.includes(brand);
                  return (
                    <button
                      key={`preferred-${brand}`}
                      type="button"
                      onClick={() => toggleBrand("preferredBrands", brand)}
                      className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#E5F4E8] text-[#1F5A40] border border-[#BCD9C2]"
                          : "bg-[#F8F9F8] text-[#5F6D63] border border-[#E6EBE7]"
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#7E6666] mb-2">
                Avoid Brands
              </p>
              <div className="flex flex-wrap gap-2">
                {brandOptions.map((brand) => {
                  const isSelected = settings.avoidedBrands.includes(brand);
                  return (
                    <button
                      key={`avoided-${brand}`}
                      type="button"
                      onClick={() => toggleBrand("avoidedBrands", brand)}
                      className={`rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                        isSelected
                          ? "bg-[#FDECEC] text-[#A33B3B] border border-[#F3CDCD]"
                          : "bg-[#F8F9F8] text-[#5F6D63] border border-[#E6EBE7]"
                      }`}
                    >
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F7FAF7] border border-[#E5ECE6] p-3">
              <p className="text-[12px] font-semibold text-[#1A1A1A] mb-2">
                Add a custom brand
              </p>
              <input
                type="text"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="e.g. Silk, Heinz, Oatly"
                className="w-full rounded-xl border border-[#E2E9E3] bg-white px-4 py-3 text-[13px] text-[#1A1A1A] placeholder:text-[#999999] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => addCustomBrand("preferredBrands")}
                  className="flex-1 rounded-xl bg-[#2D6A4F] px-4 py-3 text-[12px] font-bold text-white"
                >
                  Prefer
                </button>
                <button
                  type="button"
                  onClick={() => addCustomBrand("avoidedBrands")}
                  className="flex-1 rounded-xl border border-[#E3CACA] bg-white px-4 py-3 text-[12px] font-bold text-[#A33B3B]"
                >
                  Avoid
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#EEEEEE] bg-white p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-[#F0F5F1] flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1A1A1A]">
                Order Rules
              </h2>
              <p className="text-[12px] text-[#888888] mt-1">
                Add plain-language instructions that stay with the assistant
                across trips.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {settings.orderRules.map((rule) => (
              <div
                key={rule}
                className="flex items-start gap-3 rounded-2xl border border-[#E6ECE7] bg-[#FAFCFA] px-4 py-3"
              >
                <span className="mt-1 w-2 h-2 rounded-full bg-[#2D6A4F]" />
                <p className="flex-1 text-[13px] leading-5 text-[#2D3A30]">
                  {rule}
                </p>
                <button
                  type="button"
                  onClick={() => removeRule(rule)}
                  className="text-[#9AA69D] hover:text-[#66736A]"
                  aria-label={`Remove rule: ${rule}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-[12px] font-semibold text-[#1A1A1A] mb-2">
              Quick templates
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {ruleTemplates.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => addRule(template)}
                  className="shrink-0 rounded-full border border-[#DCE7DE] bg-[#F7FAF7] px-4 py-2 text-left text-[12px] font-semibold text-[#2D6A4F]"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F7FAF7] border border-[#E5ECE6] p-3">
            <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2">
              Write a new rule
            </label>
            <textarea
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="e.g. Prefer store brands unless the price difference is under $1."
              rows={3}
              className="w-full resize-none rounded-xl border border-[#E2E9E3] bg-white px-4 py-3 text-[13px] text-[#1A1A1A] placeholder:text-[#999999] outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <button
              type="button"
              onClick={() => addRule(newRule)}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-4 py-3 text-[13px] font-bold text-white"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </section>
      </div>

      <div className="px-6 pt-6 text-center">
        <p className="text-[12px] text-[#7A867E]">
          These preferences are stored locally in this prototype and applied
          globally.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
