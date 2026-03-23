import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, PackagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import BottomNav from "../components/BottomNav";
import { addItemToList, getListById, ListItem } from "../store/listsStore";

type CatalogItem = {
  name: string;
  category: string;
  sizes: string[];
};

const CUSTOM_ITEM_VALUE = "__custom_item__";
const CUSTOM_SIZE_VALUE = "__custom_size__";

const catalogItems: CatalogItem[] = [
  { name: "Milk 2%", category: "Dairy", sizes: ["1L", "2L", "4L"] },
  { name: "Cheese Slices", category: "Dairy", sizes: ["200g", "300g", "500g"] },
  { name: "Greek Yogurt", category: "Dairy", sizes: ["500g", "750g", "1kg"] },
  { name: "Eggs", category: "Dairy", sizes: ["6 pack", "12 pack", "18 pack"] },
  { name: "Bananas", category: "Produce", sizes: ["bunch", "2 bunches", "bag"] },
  { name: "Spinach", category: "Produce", sizes: ["150g", "300g", "500g"] },
  { name: "Avocados", category: "Produce", sizes: ["each", "bag of 4", "bag of 6"] },
  { name: "Tomatoes", category: "Produce", sizes: ["4 pack", "500g", "1kg"] },
  { name: "Chicken Breast", category: "Meat", sizes: ["500g", "1kg", "family pack"] },
  { name: "Ground Beef", category: "Meat", sizes: ["500g", "750g", "1kg"] },
  { name: "Salmon Fillet", category: "Meat", sizes: ["2 fillets", "500g", "1kg"] },
  { name: "Bread", category: "Pantry", sizes: ["loaf", "2 loaves"] },
  { name: "Rice", category: "Pantry", sizes: ["1kg", "2kg", "5kg"] },
  { name: "Pasta", category: "Pantry", sizes: ["454g", "900g"] },
  { name: "Dish Soap", category: "Household", sizes: ["500mL", "1L"] },
  { name: "Paper Towels", category: "Household", sizes: ["2 rolls", "6 rolls", "12 rolls"] },
];

const allCategories = [
  "Dairy",
  "Produce",
  "Meat",
  "Pantry",
  "Household",
  "Other",
];

const fallbackSizesByCategory: Record<string, string[]> = {
  Dairy: ["250mL", "500mL", "1L", "each"],
  Produce: ["each", "bunch", "bag", "500g"],
  Meat: ["250g", "500g", "1kg", "pack"],
  Pantry: ["each", "box", "bag", "1kg"],
  Household: ["each", "500mL", "1L", "pack"],
  Other: ["each", "pack", "box", "bag"],
};

const quantityOptions = [1, 2, 3, 4, 5, 6];

export default function AddItemPage() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const list = useMemo(() => getListById(listId || ""), [listId]);

  const categoryOptions = useMemo(() => {
    if (list?.id === "1") {
      return ["Dairy", "Produce", "Meat", "Pantry"];
    }

    return allCategories;
  }, [list?.id]);

  const [category, setCategory] = useState(categoryOptions[0] ?? "Dairy");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customName, setCustomName] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const availableItems = useMemo(
    () => catalogItems.filter((item) => item.category === category),
    [category]
  );

  const selectedCatalogItem = useMemo(
    () => availableItems.find((item) => item.name === selectedItemName),
    [availableItems, selectedItemName]
  );

  const sizeOptions = useMemo(() => {
    return (
      selectedCatalogItem?.sizes ??
      fallbackSizesByCategory[category] ??
      fallbackSizesByCategory.Other
    );
  }, [category, selectedCatalogItem]);

  const isCustomItem = selectedItemName === CUSTOM_ITEM_VALUE;
  const isCustomSize = selectedSize === CUSTOM_SIZE_VALUE;

  useEffect(() => {
    if (!list) {
      navigate("/");
    }
  }, [list, navigate]);

  useEffect(() => {
    const defaultItem = availableItems[0]?.name ?? CUSTOM_ITEM_VALUE;
    setSelectedItemName(defaultItem);
    setErrorMessage("");
  }, [availableItems]);

  useEffect(() => {
    setSelectedSize(sizeOptions[0] ?? "each");
  }, [sizeOptions]);

  if (!list || !listId) return null;

  const handleAddToList = () => {
    const itemName = isCustomItem ? customName.trim() : selectedItemName;
    const unit = isCustomSize ? customSize.trim() : selectedSize;

    if (!itemName) {
      setErrorMessage("Choose an item or enter a custom name before adding.");
      return;
    }

    if (!unit) {
      setErrorMessage("Pick a size or provide a custom package.");
      return;
    }

    const newItem: ListItem = {
      id: `${listId}-${Date.now()}`,
      text: itemName,
      completed: false,
      category,
      quantity: Number(quantity),
      unit,
    };

    addItemToList(listId, newItem);
    navigate(`/list/${listId}`, {
      state: {
        feedback: {
          title: "Added to list",
          message: `${itemName} was added to ${list.name}.`,
          tone: "success",
        },
      },
    });
  };

  return (
    <div className="bg-white min-h-screen pb-[132px] max-w-[608px] mx-auto">
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
          onClick={() => navigate(`/list/${listId}`)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E4EAE5] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D6A4F]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F5F1] flex items-center justify-center">
            <PackagePlus className="w-6 h-6 text-[#2D6A4F]" />
          </div>
          <div>
            <p className="text-[13px] text-[#888888]">Add to current list</p>
            <h1 className="text-[26px] font-bold text-[#1A1A1A]">Add Items</h1>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <div className="rounded-[28px] border border-[#DCE7DE] bg-[linear-gradient(135deg,#F5FAF6_0%,#EDF6EF_100%)] p-5">
          <p className="text-[15px] font-bold text-[#1A1A1A]">{list.name}</p>
          <p className="text-[12px] text-[#66736A] mt-1">
            New selections are added straight into this list and will appear
            when you return.
          </p>
        </div>

        <section className="rounded-[28px] border border-[#EEEEEE] bg-white p-5 space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-[#666666]">
              Category
            </label>
            <div className="relative mt-2">
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#DCE7DE] bg-[#F7FAF8] px-4 py-3 text-[15px] font-medium text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D6D6D]" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#666666]">
              Item
            </label>
            <div className="relative mt-2">
              <select
                value={selectedItemName}
                onChange={(event) => setSelectedItemName(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#DCE7DE] bg-[#F7FAF8] px-4 py-3 text-[15px] font-medium text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
              >
                {availableItems.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
                <option value={CUSTOM_ITEM_VALUE}>Custom item</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D6D6D]" />
            </div>
            {isCustomItem && (
              <input
                type="text"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Enter custom item name"
                className="mt-3 w-full rounded-2xl border border-[#DCE7DE] bg-white px-4 py-3 text-[15px] text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#666666]">
                Size
              </label>
              <div className="relative mt-2">
                <select
                  value={selectedSize}
                  onChange={(event) => setSelectedSize(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#DCE7DE] bg-[#F7FAF8] px-4 py-3 text-[15px] font-medium text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
                >
                  {sizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value={CUSTOM_SIZE_VALUE}>Custom size</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D6D6D]" />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-[#666666]">
                Quantity
              </label>
              <div className="relative mt-2">
                <select
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-[#DCE7DE] bg-[#F7FAF8] px-4 py-3 text-[15px] font-medium text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
                >
                  {quantityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D6D6D]" />
              </div>
            </div>
          </div>

          {isCustomSize && (
            <div>
              <label className="text-[12px] font-semibold text-[#666666]">
                Custom Package
              </label>
              <input
                type="text"
                value={customSize}
                onChange={(event) => setCustomSize(event.target.value)}
                placeholder="Example: family pack or 12 rolls"
                className="mt-2 w-full rounded-2xl border border-[#DCE7DE] bg-white px-4 py-3 text-[15px] text-[#1A1A1A] outline-none focus:border-[#2D6A4F]"
              />
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[#EEEEEE] bg-white p-5">
          <p className="text-[12px] font-semibold text-[#666666]">Preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#DCE7DE] bg-[#F7FAF8] px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A]">
              {category}
            </span>
            <span className="rounded-full border border-[#DCE7DE] bg-[#F7FAF8] px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A]">
              {quantity} x{" "}
              {isCustomItem ? customName.trim() || "Custom item" : selectedItemName}
            </span>
            <span className="rounded-full border border-[#DCE7DE] bg-[#F7FAF8] px-3 py-1.5 text-[12px] font-semibold text-[#1A1A1A]">
              {isCustomSize ? customSize.trim() || "Custom size" : selectedSize}
            </span>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-2xl bg-[#FFF4F4] px-4 py-3 text-[12px] font-medium text-[#B42318]">
              {errorMessage}
            </p>
          )}
        </section>

        <button
          onClick={handleAddToList}
          className="w-full rounded-2xl bg-[#2D6A4F] px-4 py-4 text-[16px] font-bold text-white transition-colors hover:bg-[#255940]"
        >
          Add to {list.name}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
