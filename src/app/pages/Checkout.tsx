import { ArrowLeft, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import {
  CheckoutPlan,
  formatCurrency,
  PricingRouteState,
  resolveComparisonData,
} from "../utils/pricing";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as PricingRouteState | undefined;
  const comparisonData = resolveComparisonData(routeState);
  const selectedPlan: CheckoutPlan | undefined =
    routeState?.plan ?? comparisonData?.assistantPlan;

  if (!comparisonData || !selectedPlan) {
    return (
      <div className="bg-white min-h-screen pb-[111px] max-w-[608px] mx-auto">
        <div className="px-6 pt-20">
          <h1 className="text-[26px] font-bold text-[#1A1A1A]">Checkout</h1>
          <p className="mt-3 text-[14px] text-[#666666]">
            We could not prepare a checkout plan from the current flow.
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
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <div>
          <h1 className="text-[18px] font-semibold text-[#1A1A1A]">
            Checkout
          </h1>
          <p className="text-[12px] text-[#888888]">{comparisonData.listName}</p>
        </div>
      </div>

      <div className="px-6 pt-3">
        <div className="bg-[#E8F0EA] border border-[#C8DCCB] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
            <p className="text-[13px] font-semibold text-[#2D6A4F]">
              {selectedPlan.title}
            </p>
          </div>
          <p className="text-[12px] text-[#4A4A4A]">{selectedPlan.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
              {selectedPlan.stores.length} store
              {selectedPlan.stores.length === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
              {comparisonData.items.length} items
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A] border border-[#DCE7DE]">
              Total {formatCurrency(selectedPlan.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-4">
        {selectedPlan.stores.map((store) => (
          <div
            key={store.key}
            className="bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: store.color }}
                />
                <p className="text-[14px] font-semibold text-[#1A1A1A]">
                  {store.name}
                </p>
              </div>
              <p className="text-[14px] font-semibold text-[#2D6A4F]">
                {formatCurrency(store.total)}
              </p>
            </div>

            <div className="space-y-2 mb-3">
              {store.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#EEEEEE] bg-white px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold text-[#1A1A1A]">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#666666]">
                        {item.brand} · {item.packageLabel}
                      </p>
                      <p className="text-[11px] text-[#999999]">
                        {item.quantityLabel}
                      </p>
                    </div>
                    <p className="text-[12px] font-semibold text-[#1A1A1A]">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.open(store.url, "_blank")}
              className="w-full py-3 rounded-xl text-[12px] font-semibold border transition-colors"
              style={{
                borderColor: store.color,
                color: store.color,
              }}
            >
              Go to {store.name} →
            </button>
          </div>
        ))}
      </div>

      <div className="px-6 pt-4">
        <div className="rounded-2xl border border-[#EEEEEE] bg-white px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] text-[#888888]">Grand Total</p>
            <p className="text-[20px] font-bold text-[#1A1A1A]">
              {formatCurrency(selectedPlan.total)}
            </p>
          </div>
          {selectedPlan.savings > 0 && (
            <div className="rounded-full bg-[#F0F5F1] px-3 py-2 text-[12px] font-semibold text-[#2D6A4F]">
              Save {formatCurrency(selectedPlan.savings)}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
