import React, { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useLocation, useNavigate } from "react-router";
import { getLists, addList, ShoppingList } from "../store/listsStore";

export default function LoadingPage() {
  type GroceryItem = {
    category: string;
    item: string;
    quantity: number;
    unit: string;
  };
  const location = useLocation();
  const prompt = location.state?.prompt;
  const navigate = useNavigate();

  const [progress, setProgress] = useState(0);
  const [aiText, setAiText] = useState<string>("");
  const [lists, setLists] = useState(getLists());

  const PROMPT = `
  You are a helpful assistant that suggests grocery items based on a user's meal plan.
  Generate a personalized grocery list - including breakfast, lunch, and dinner. Items ONLY.
  Include a variety of items across different food groups.
  Please describe the suggested items in bullet point format that is easy to read and understand.
  Only provide the list of items and how many they should purchase, without any additional commentary or explanations.
  Please give specific items and quantities, such as '2 lbs of chicken breast' or '1 dozen eggs'.
  Label each item with its category (e.g., Produce, Dairy, Meat, Pantry) for easy organization. 
  Please only suggest items that fall into these categories and label them as such.
  This is the prompt the user gives: ${prompt}
  Format the list as follows in a JSON array of objects, where each object has the following structure and do not include any markdowns:
    {
      category: string; (e.g., 'Produce', 'Dairy', 'Meat', 'Pantry')
      item: string; (e.g., 'Chicken Breast', 'Eggs', 'Milk', 'Bread', etc.)
      quantity: number; (e.g., 2, 1, 3, etc.)
      unit: string; (e.g., 'lbs', 'dozen', 'cups', etc.)
    };
  Limit the amount of items to 10.
  `;
  

  useEffect(() => {
    let isCancelled = false;
    let currentProgress = 0;

    const tick = () => {
      if (isCancelled) return;
        currentProgress += Math.random() * 1 + 2;
      if (currentProgress > 99) currentProgress = 99;
        setProgress(currentProgress)
      if (!isCancelled) setTimeout(tick, 200);
    };

    tick();

    (async () => {
      try {
        console.log("Using AI prompt:", PROMPT);

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer OPENAI_API_KEY`, // Replace with your actual API key
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: PROMPT }],
            max_tokens: 500,
          }),
        });

        const data = await response.json();
        const message = data.choices?.[0]?.message?.content || "No response from AI";
        setAiText(message);
        
      } catch (err) {
        console.error("AI fetch error:", err);
        setAiText("Failed to generate AI content.");
      } finally {
        if (!isCancelled) setTimeout(tick, 200);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [PROMPT]);

  return (
    <div className="bg-white min-h-screen pb-[700px] max-w-[3000px] mx-auto">
      {/* Header / Status Bar */}
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
            Building your weekly list...
          </h1>
          <p className="text-[12px] text-[#999999] mt-1">
            Preparing your personalized grocery list based on your meal plan and preferences
          </p>
        </div>
      </div>

      {/* AI Text */}
        {aiText && (
          <div className="px-6 py-4 bg-[#F0F5F1] rounded-xl mt-4 h-[50vh] overflow-y-auto">
            <h2 className="text-sm font-bold mb-2">Suggested Items:</h2>

            {(() => {
              let parsedItems: GroceryItem[] = [];
              try {
                parsedItems = JSON.parse(aiText);
              } catch (e) {
                // fallback to raw text if parsing fails
                return <p className="text-[28px] text-[#1A1A1A]">{aiText}</p>;
              }

              return (
                <div className="space-y-2">
                  {parsedItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-[25px] text-[#1A1A1A] font-semibold">
                      <span>{item.item} ({item.category})</span>
                      <span>{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

      {/* Progress Bar */}
      {progress <= 95 && (
        <div className="px-6 mt-6">
          <div className="w-full h-2 bg-[#E0E8E2] rounded-full overflow-hidden">
            <div
              className="h-2 bg-[#2D6A4F] transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}


      {/* Action Buttons */}
      <div className="fixed bottom-[111px] left-0 right-0 bg-white p-4 border-t border-[#F5F5F5] max-w-[3000px] mx-auto flex gap-3">
        <button
          className="flex-1 py-3 px-4 border-2 border-[#2D6A4F] rounded-2xl text-[#2D6A4F] font-bold hover:bg-[#F0F5F1] transition-colors"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          className="flex-1 py-3 px-4 bg-[#2D6A4F] rounded-2xl text-white font-bold hover:bg-[#255940] transition-colors"
          onClick={() => {
            const parsedItems: GroceryItem[] = JSON.parse(aiText);
            // Map AI items to your ShoppingList item format
            const mappedItems = parsedItems.map((item, index) => ({
              id: (index + 1).toString(), // unique id for each item
              text: item.item,
              completed: false,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
            }));

            const newList: ShoppingList = {
              id: Date.now().toString(),
              name: "AI-Generated List",
              color: "green",
              items: mappedItems,
              modifiedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            };
            addList(newList);
            setLists(getLists());
            navigate("/")}
          }
        >
          Create list
        </button>
      </div>

      <BottomNav />
    </div>
  );
}