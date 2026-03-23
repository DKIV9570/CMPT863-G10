import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import {
  formatCurrency,
  PricingRouteState,
  resolveComparisonData,
} from "../utils/pricing";

export default function PriceComparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const comparisonData = resolveComparisonData(
    location.state as PricingRouteState | undefined
  );

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
    <div className="bg-white min-h-screen pb-[111px] max-w-[608px] mx-auto">
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

      {comparisonData.items.length === 0 ? (
        <div className="px-6 pt-8 text-center text-[14px] text-[#888888]">
          This list is empty, so there is nothing to compare yet.
        </div>
      ) : (
        <div className="px-6 pt-5">
          <div className="overflow-x-auto rounded-[28px] border border-[#EEEEEE] bg-white">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-4 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-500">
                <div>Item</div>
                {comparisonData.stores.map((store) => (
                  <div key={store.key} className="text-center">
                    {store.name}
                  </div>
                ))}
              </div>

              <div className="divide-y divide-gray-100">
                {comparisonData.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 px-4 py-3 text-sm">
                    <div>
                      <div className="font-semibold text-[#1A1A1A]">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.quantityLabel}
                      </div>
                    </div>
                    {comparisonData.stores.map((store) => {
                      const isBest = item.bestStoreKey === store.key;
                      return (
                        <div
                          key={store.key}
                          className={`mx-1 flex items-center justify-center rounded-xl px-2 py-2 font-medium ${
                            isBest
                              ? "bg-green-100 text-green-800"
                              : "text-[#1A1A1A]"
                          }`}
                        >
                          {formatCurrency(item.prices[store.key])}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 border-t border-gray-200 px-4 py-3 text-sm font-bold">
                <div>Total</div>
                {comparisonData.stores.map((store) => {
                  const isBest = comparisonData.cheapestTotalStoreKey === store.key;
                  return (
                    <div
                      key={store.key}
                      className={`mx-1 rounded-xl px-2 py-2 text-center ${
                        isBest ? "bg-green-100 text-green-800" : "text-[#1A1A1A]"
                      }`}
                    >
                      {formatCurrency(comparisonData.totals[store.key])}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 mt-6 space-y-3">
        <button
          onClick={() =>
            navigate("/checkout", {
              state: {
                listId: comparisonData.listId,
                plan: comparisonData.assistantPlan,
              },
            })
          }
          className="w-full py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-colors"
        >
          ✨ Choose For Me — Best Value
        </button>
        <button
          onClick={() =>
            navigate("/checkout", {
              state: {
                listId: comparisonData.listId,
                plan: comparisonData.singleStorePlan,
              },
            })
          }
          className="w-full py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          Manual Checkout — One Store
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
