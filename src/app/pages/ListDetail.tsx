import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Share2, Sparkles, Send } from "lucide-react";
import {
  getListById,
  addItemToList,
  updateItemInList,
  deleteItemFromList,
  ListItem,
} from "../store/listsStore";
import BottomNav from "../components/BottomNav";

export interface GroceryItem extends ListItem {
  category: string;
  quantity: number;
  unit: string;
  badge?: "SALE" | "OUT";
  suggested?: boolean;
}

function normalizeGroceryItem(item: ListItem): GroceryItem {
  return {
    ...item,
    category: item.category ?? "Other",
    quantity: item.quantity ?? 1,
    unit: item.unit ?? "each",
  };
}

export default function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(() => getListById(listId || ""));
  const [newItemText, setNewItemText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    if (!list) {
      navigate("/");
    }
  }, [list, navigate]);

  if (!list) return null;

  const isWeeklyGroceries = list.id === "1";
  const groceryItems = isWeeklyGroceries
    ? list.items.map(normalizeGroceryItem)
    : [];

  const handleToggleItem = (itemId: string) => {
    if (listId) {
      const item = list.items.find((i) => i.id === itemId);
      if (item) {
        updateItemInList(listId, itemId, { completed: !item.completed });
        setList(getListById(listId));
      }
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    if (!listId) return;

    const item = groceryItems.find((entry) => entry.id === itemId);
    if (!item) return;

    updateItemInList(listId, itemId, {
      quantity: Math.max(1, item.quantity + delta),
    });
    setList(getListById(listId));
  };


  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() && listId) {
      const newItem: ListItem = {
        id: `${listId}-${Date.now()}`,
        text: newItemText.trim(),
        completed: false,
      };
      addItemToList(listId, newItem);
      setList(getListById(listId));
      setNewItemText("");
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (listId) {
      deleteItemFromList(listId, itemId);
      setList(getListById(listId));
    }
  };

  // Group items by category for Weekly Groceries
  const categories = isWeeklyGroceries
    ? Array.from(new Set(groceryItems.map((item) => item.category)))
    : [];

  const getItemsByCategory = (category: string) =>
    groceryItems.filter((item) => item.category === category);

  const getCategoryProgress = (category: string) => {
    const items = getItemsByCategory(category);
    const completed = items.filter((item) => item.completed).length;
    return `${completed}/${items.length}`;
  };

  const totalItems = isWeeklyGroceries ? groceryItems.length : list.items.length;
  const completedCount = isWeeklyGroceries
    ? groceryItems.filter((item) => item.completed).length
    : list.items.filter((item) => item.completed).length;

  return (
    <div className="bg-white min-h-screen pb-[260px] max-w-[3000px] mx-auto">
      {/* Header */}
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
              {completedCount}/{totalItems} items checked · Modified {list.modifiedDate}
            </p>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
            <Share2 className="w-6 h-6 text-[#1A1A1A]" />
          </button>
        </div>
      </div>

      {/* Items List - Weekly Groceries Special Layout */}
      {isWeeklyGroceries ? (
        <div className="px-6 py-4">
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
                {getItemsByCategory(category).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-1"
                    style={{ opacity: item.completed ? 0.5 : 1 }}
                  >
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="flex-shrink-0"
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
                        {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-2 py-1.5">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="text-[#888888] hover:text-[#1A1A1A] text-[16px] font-bold px-2"
                      >
                        −
                      </button>
                      <span className="text-[14px] font-bold text-[#1A1A1A] min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="text-[#2D6A4F] hover:text-[#1F4F38] text-[16px] font-bold px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}


          {/* Add Item */}
          <div className="mt-6">
            
            <button className="text-[#2D6A4F] text-[14px] font-medium hover:text-[#1F4F38]"
              onClick={() => navigate(`/list/${listId}/add-item`)}>
              + Add Item
            </button>
          </div>
          
        </div>
      ) : (
        /* Regular List Layout */
        <div className="px-6 py-4">
          <div className="mb-4">
            <form onSubmit={handleAddItem} className="flex gap-3">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add new item..."
                className="flex-1 px-4 py-3 border border-[#E0E8E2] rounded-xl bg-[#F0F5F1] text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </form>
          </div>
          {list.items.length === 0 ? (
            <div className="text-center py-12 text-[#999999]">
              No items yet. Add your first item above!
            </div>
          ) : (
            <div className="space-y-2">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className="flex-shrink-0"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? "border-transparent"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{
                        backgroundColor: item.completed
                          ? list.color
                          : "transparent",
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Input & Actions */}
      {list.items.length > 0 && (
        <div className="fixed bottom-[111px] left-0 right-0 bg-white border-t border-[#F5F5F5] p-4 max-w-[3000px] mx-auto">
          <div className="mb-3">
            <div className="flex items-center gap-3 bg-[#F0F5F1] rounded-2xl px-4 py-3 border border-[#E0E8E2]">
              <Sparkles className="w-5 h-5 text-[#2D6A4F] opacity-50" />
              <input
                type="text"
                placeholder="What would you like to do?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
              />
              <button className="w-10 h-10 bg-[#2D6A4F] rounded-xl flex items-center justify-center hover:bg-[#255940] transition-colors">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 px-4 border-2 border-[#2D6A4F] rounded-2xl text-[#2D6A4F] font-bold hover:bg-[#F0F5F1] transition-colors"
              onClick={() =>
                navigate("/price-comparison", {
                  state: {
                    listId,
                    items: isWeeklyGroceries ? groceryItems : list.items,
                  },
                })
              }
              >
              Compare Prices
            </button>
            <button className="flex-1 py-3 px-4 bg-[#2D6A4F] rounded-2xl text-white font-bold hover:bg-[#255940] transition-colors"
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    listId,
                    items: isWeeklyGroceries ? groceryItems : list.items,
                  },
                })
              }
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
