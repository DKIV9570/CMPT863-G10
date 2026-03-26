import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import FeedbackBanner from "../components/FeedbackBanner";
import { useTransientFeedback } from "../hooks/useTransientFeedback";
import {
  buildManualSelectionPlan,
  formatCurrency,
  PricingRouteState,
  resolveComparisonData,
  StoreKey,
  UserPreferences,
} from "../utils/pricing";
import { getAiRulesContext } from "../utils/listAi";

export default function PriceComparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as PricingRouteState | undefined;

  const userPrefs = useMemo<UserPreferences>(() => {
    const rules = getAiRulesContext();
    return {
      checkoutStrategy: rules.checkoutStrategy,
      preferredStoreKeys: rules.preferredStores
        .map((s) => s.toLowerCase() as StoreKey)
        .filter((k): k is StoreKey =>
          k === "walmart" || k === "superstore" || k === "safeway"
        ),
      categoryBrandPreferences: rules.categoryBrandPreferences,
    };
  }, []);

  const comparisonData = resolveComparisonData(routeState, userPrefs);
  const { activeFeedback, dismissFeedback } = useTransientFeedback(
    routeState?.feedback
  );
  const [manualSelections, setManualSelections] = useState<
    Partial<Record<string, StoreKey>>
  >({});

  useEffect(() => {
    setManualSelections({});
  }, [comparisonData?.listId]);

  const manualPlan = useMemo(() => {
    if (!comparisonData) return null;
    return buildManualSelectionPlan(comparisonData, manualSelections);
  }, [comparisonData, manualSelections]);

  const handleChooseForMe = () => {
    if (!comparisonData) return;

    navigate("/checkout", {
      state: {
        listId: comparisonData.listId,
        items: routeState?.items,
        plan: comparisonData.assistantPlan,
        feedback: {
          title: "Best-value basket ready",
          message: "The AI prepared the lowest combined basket across stores.",
          tone: "success",
        },
      },
    });
  };

  const handleManualOfferSelect = (itemId: string, storeKey: StoreKey) => {
    setManualSelections((current) => ({
      ...current,
      [itemId]: storeKey,
    }));
  };

  const handleManualCheckout = () => {
    if (!comparisonData || !manualPlan) return;

    navigate("/checkout", {
      state: {
        listId: comparisonData.listId,
        items: routeState?.items,
        plan: manualPlan,
        feedback: {
          title: "Manual basket ready",
          message: "Your selected offers are ready for checkout.",
          tone: "success",
        },
      },
    });
  };

  if (!comparisonData) {
    return (
      <div className="bg-white min-h-screen pb-[111px] max-w-[608px] mx-auto">
        <div className="px-6 pt-20">
          <h1 className="text-[26px] font-bold text-[#1A1A1A]">
            Price Comparison
          </h1>
          <p className="mt-3 text-[14px] text-[#666666]">
            We could not find a list to compare right now.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-2xl bg-[#2D6A4F] px-4 py-3 text-[14px] font-bold text-white"
          >
            Back to Lists
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-[111px] max-w-[3000px] mx-auto">
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

      <div className="px-6 pt-6 pb-4 flex items-center mb-4">
        <button
          className="mr-4 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1A1A]">
            Price Comparison
          </h1>
          <p className="text-[13px] text-[#888888]">
            {comparisonData.listName} · {comparisonData.items.length} items
          </p>
        </div>
      </div>

      <div className="px-6">
        <div className="rounded-[28px] border border-[#DCE7DE] bg-[linear-gradient(135deg,#F5FAF6_0%,#EDF6EF_100%)] p-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center border border-[#DCE7DE]">
              <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1A1A1A]">
                {comparisonData.assistantPlan.title}
              </p>
              <p className="mt-1 text-[12px] text-[#66736A]">
                {comparisonData.assistantPlan.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeFeedback && (
        <FeedbackBanner
          feedback={activeFeedback}
          onDismiss={dismissFeedback}
        />
      )}

      {comparisonData.items.length === 0 ? (
        <div className="px-6 pt-8 text-center text-[14px] text-[#888888]">
          This list is empty, so there is nothing to compare yet.
        </div>
      ) : (
        <div className="px-6 pt-5 space-y-5">
          <section>
            <div className="mb-3">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">
                Store totals
              </h2>
              <p className="text-[12px] text-[#888888]">
                Best full-cart total is highlighted below.
              </p>
            </div>

            <div className="-mx-6 px-6 overflow-x-auto">
              <div className="flex gap-3 min-w-max pb-1">
                {comparisonData.stores.map((store) => {
                  const isBest = comparisonData.cheapestTotalStoreKey === store.key;

                  return (
                    <div
                      key={store.key}
                      className={`min-w-[164px] rounded-[24px] border p-4 ${
                        isBest
                          ? "border-[#B7D7C2] bg-[#F3FAF5]"
                          : "border-[#EEEEEE] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: store.color }}
                          />
                          <p className="text-[14px] font-semibold text-[#1A1A1A]">
                            {store.name}
                          </p>
                        </div>
                        {isBest && (
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#2D6A4F] border border-[#DCE7DE]">
                            Best total
                          </span>
                        )}
                      </div>
                      <p className="mt-4 text-[22px] font-bold text-[#1A1A1A]">
                        {formatCurrency(comparisonData.totals[store.key])}
                      </p>
                      <p className="mt-1 text-[12px] text-[#888888]">
                        {isBest
                          ? "Lowest price for the whole list"
                          : "Alternative full-cart price"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-[#DCE7DE] bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-bold text-[#1A1A1A]">
                  Manual selection
                </h2>
                <p className="mt-1 text-[12px] text-[#888888]">
                  Tap any offer below to build your own basket. Brand is shown
                  as part of each store option, but it is not a separate
                  control.
                </p>
              </div>
              <div className="rounded-full bg-[#F5FAF6] px-3 py-2 text-[12px] font-bold text-[#2D6A4F] border border-[#DCE7DE] whitespace-nowrap">
                {manualPlan ? formatCurrency(manualPlan.total) : "--"}
              </div>
            </div>

            {manualPlan && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
                  {manualPlan.stores.length} store
                  {manualPlan.stores.length === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
                  {comparisonData.items.length} selected offers
                </span>
                {manualPlan.savings > 0 && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#2D6A4F] border border-[#DCE7DE]">
                    Saves {formatCurrency(manualPlan.savings)}
                  </span>
                )}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">
                Item-by-item breakdown
              </h2>
              <p className="text-[12px] text-[#888888]">
                Each card lists store offers with brand, package, and price.
              </p>
            </div>

            <div className="space-y-3">
              {comparisonData.items.map((item) => {
                const selectedStoreKey =
                  manualSelections[item.id] ?? comparisonData.cheapestTotalStoreKey;
                const orderedStores = [...comparisonData.stores].sort(
                  (firstStore, secondStore) =>
                    item.prices[firstStore.key] - item.prices[secondStore.key]
                );

                return (
                  <div
                    key={item.id}
                    className="rounded-[26px] border border-[#EEEEEE] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-bold text-[#1A1A1A]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[12px] text-[#888888]">
                          {item.quantityLabel}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F5FAF6] px-3 py-1.5 text-[11px] font-semibold text-[#2D6A4F] border border-[#DCE7DE]">
                        {item.category}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {orderedStores.map((store) => {
                        const offer = item.offers[store.key];
                        const isBest = item.bestStoreKey === store.key;
                        const isSelected = selectedStoreKey === store.key;

                        return (
                          <button
                            key={store.key}
                            type="button"
                            onClick={() => handleManualOfferSelect(item.id, store.key)}
                            className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                              isSelected
                                ? "border-[#2D6A4F] bg-[#F3FAF5] shadow-[0_0_0_1px_rgba(45,106,79,0.08)]"
                                : "border-[#EEEEEE] bg-[#FCFCFC] hover:border-[#D8E2DB]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    isSelected ? "ring-4 ring-[#DCEDE3]" : ""
                                  }`}
                                  style={{ backgroundColor: store.color }}
                                />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-[14px] font-semibold text-[#1A1A1A]">
                                      {store.name}
                                    </p>
                                    {isBest && (
                                      <span className="rounded-full border border-[#DCE7DE] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#5A8A66]">
                                        Lowest price
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#666666]">
                                    {offer.brand} · {offer.packageLabel}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[15px] font-bold text-[#1A1A1A]">
                                  {formatCurrency(offer.price)}
                                </p>
                                <p
                                  className={`text-[11px] font-semibold ${
                                    isSelected
                                      ? "text-[#2D6A4F]"
                                      : isBest
                                      ? "text-[#6F7D74]"
                                      : "text-[#888888]"
                                  }`}
                                >
                                  {isSelected
                                    ? isBest
                                      ? "Selected for manual checkout"
                                      : "Selected for manual checkout"
                                    : isBest
                                    ? "Best-value alternative"
                                    : "Tap to select"}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <div className="px-6 mt-6 space-y-3">
        <button
          onClick={handleChooseForMe}
          className="w-full py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors"
        >
          ✨ Choose For Me — Best Value
        </button>
        <button
          onClick={handleManualCheckout}
          className="w-full py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          Manual Checkout — Selected Offers
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
