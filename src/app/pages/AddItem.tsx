import React, { useState } from "react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import { GroceryItem } from "./ListDetail"; // Import the interface from ListDetail

interface Item {
  name: string;
  size: string;
  category: "Meat" | "Dairy" | "Produce";
}

interface AddItemPageProps {
  onAddItem?: (item: GroceryItem) => void; // Optional callback to parent
}

export default function AddItemPage({ onAddItem }: AddItemPageProps) {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [form, setForm] = useState({
    item: "",
    size: "",
    category: "",
    meat: false,
    dairy: false,
    produce: false,
  });

  const toggleItem = (name: string) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const items: Item[] = [
    { name: "Milk 2%", size: "4L", category: "Dairy" },
    { name: "Cheese Slices", size: "300g", category: "Dairy" },
    { name: "Greek Yogurt", size: "750g", category: "Dairy" },
    { name: "Bananas", size: "300g", category: "Produce" },
    { name: "Spinach", size: "300g", category: "Produce" },
    { name: "Avocados", size: "piece", category: "Produce" },
    { name: "Chicken Breast", size: "1kg", category: "Meat" },
    { name: "Ground Beef", size: "500g", category: "Meat" },
  ];

  const categories: Array<"Dairy" | "Produce" | "Meat"> = ["Dairy", "Produce", "Meat"];
  const getItemsByCategory = (category: string) =>
    items.filter((item) => item.category === category);

  // Handle adding item to the grocery list
  const handleAddToList = () => {
    const selectedCategory = form.meat
      ? "Meat"
      : form.dairy
      ? "Dairy"
      : form.produce
      ? "Produce"
      : "";

    if (!form.item.trim() || !selectedCategory) {
      alert("Please enter an item name and select a category.");
      return;
    }

    const newItem: GroceryItem = {
      id: `custom-${Date.now()}`,
      text: form.item.trim(),
      completed: false,
      category: selectedCategory,
      quantity: 1,
      unit: form.size || "each",
    };

    // Call parent callback if provided
    if (onAddItem) onAddItem(newItem);

    // Reset form and selections
    setForm({ item: "", size: "", category: "", meat: false, dairy: false, produce: false });
    setSelectedItems([]);
    alert(`${newItem.text} added to list!`);
  };

  return (
    <div className="bg-white min-h-screen pb-[150px] max-w-[608px] mx-auto">
      {/* Status Bar with Time & Battery */}
      <div className="h-11 px-6 flex items-center justify-between text-sm font-bold">
        <span>9:41</span>
        <div className="flex items-center gap-2">
          {/* Cellular signal */}
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm"></div>
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm"></div>
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm opacity-40"></div>
            <div className="w-1 h-3 bg-[#1A1A1A] rounded-sm opacity-40"></div>
          </div>
          {/* Battery */}
          <div className="w-6 h-3 border-2 border-[#1A1A1A] rounded-sm relative">
            <div className="absolute inset-0.5 bg-[#34C759] rounded-[1px]"></div>
            <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0.5 h-1 bg-[#1A1A1A] rounded-r-sm opacity-40"></div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-[#F5F5F5]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-[26px] font-bold text-[#1A1A1A]">Add Items</h1>
          <p className="text-[13px] text-[#888888]">Select items or add custom ones below</p>
        </div>
      </div>

      {/* Items by Category */}
      <div className="px-6 py-4">
        {categories.map((cat) => (
          <div key={cat} className="mb-6">
            <h2 className="text-green-700 font-semibold mb-3">▾ {cat}</h2>
            <div className="grid grid-cols-2 gap-3">
              {getItemsByCategory(cat).map((item) => {
                const completed = selectedItems.includes(item.name);
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleItem(item.name)}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                        completed
                          ? "bg-[#2D6A4F] border-[#2D6A4F]"
                          : "border-[#CCCCCC] hover:border-[#2D6A4F]"
                      }`}
                    >
                      {completed && (
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
                    <div>
                      <p
                        className={`font-medium text-[14px] ${
                          completed ? "line-through text-[#1A1A1A]" : "text-[#1A1A1A]"
                        }`}
                      >
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Form Inputs */}
      <div className="px-6 space-y-4 mt-4">
        <input
          type="text"
          placeholder='Item e.g. "Oranges"'
          value={form.item}
          onChange={(e) => setForm({ ...form, item: e.target.value })}
          className="w-full border rounded-lg p-3 text-sm"
        />
        <input
          type="text"
          placeholder='Size e.g. "Bag"'
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="w-full border rounded-lg p-3 text-sm"
        />
        <input
          type="text"
          placeholder='Category e.g. "Snacks"'
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border rounded-lg p-3 text-sm"
        />
      </div>

      {/* Green Tick Category Buttons */}
      <div className="px-6 flex items-center gap-6 mt-4">
        {(["meat", "dairy", "produce"] as const).map((cat) => {
          const checked = form[cat];
          return (
            <div
              key={cat}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                if (checked) {
                  setForm({ ...form, meat: false, dairy: false, produce: false });
                } else {
                  setForm({
                    ...form,
                    meat: cat === "meat",
                    dairy: cat === "dairy",
                    produce: cat === "produce",
                  });
                }
              }}
            >
              <div
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all ${
                  checked
                    ? "bg-[#2D6A4F] border-[#2D6A4F]"
                    : "border-[#CCCCCC] hover:border-[#2D6A4F]"
                }`}
              >
                {checked && (
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="mt-2 text-sm font-medium capitalize text-[#1A1A1A]">{cat}</span>
            </div>
          );
        })}
      </div>


      {/* Selected Items Preview */}
      {selectedItems.length > 0 && (
        <div className="px-6 py-4">
          <h3 className="font-bold text-[#1A1A1A] mb-2">Items Added:</h3>
          <ul className="list-disc list-inside text-[#1A1A1A]">
            {selectedItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

        {/* Add to List Button */}
      <div className="px-6 mt-6">
        <button
          onClick={handleAddToList}
          className="w-full py-3 bg-[#2D6A4F] text-white text-lg font-bold rounded-xl hover:bg-[#255940] transition-colors"
        >
          + Add to List
        </button>
      </div>

      <BottomNav />
    </div>
  );
}