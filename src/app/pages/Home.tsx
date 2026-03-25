import { useState } from "react";
import { Sparkles, Send, Share2 } from "lucide-react";
import BottomNav from "../components/BottomNav";
import ListCard from "../components/ListCard";
import NewListDialog from "../components/NewListDialog";
import { getLists, addList, ShoppingList } from "../store/listsStore";
import { useNavigate } from "react-router";

export default function Home() {
  const [lists, setLists] = useState(getLists());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const navigate = useNavigate();

  const handleCreateList = (name: string, color: string) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name,
      color,
      items: [],
      modifiedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    addList(newList);
    setLists(getLists());
  };

  const handleSubmitPrompt = () => {
    const prompt = aiPrompt.trim();
    navigate("/ai-loading", {
      state: {
        prompt: prompt || "Build a weekly list for 2",
      },
    });
  };
  
  return (
    <div className="bg-white min-h-screen pb-[111px] max-w-[3000px] mx-auto">
      {/* Status Bar */}
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

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[13px] text-[#888888] mb-1">Good morning</p>
            <h1 className="text-[26px] font-bold text-[#1A1A1A]">
              Welcome, Vivek
            </h1>
          </div>
          <button className="w-16 h-16 bg-[#F0F5F1] rounded-full flex items-center justify-center hover:bg-[#E0E8E2] transition-colors"
             onClick={() => navigate("*")} >
            <Share2 className="w-7 h-7 text-[#2D6A4F]" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <div className="flex items-center gap-3 bg-[#F0F5F1] border border-[#E0E8E2] rounded-2xl px-4 py-4">
            <Sparkles className="w-5 h-5 text-[#2D6A4F] opacity-50" />
            <input
              type="text"
              placeholder="What would you like to do?"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmitPrompt();
                }
              }}
              className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
            />
            <button className="w-12 h-12 bg-[#2D6A4F] rounded-xl flex items-center justify-center hover:bg-[#255940] transition-colors"
               onClick={handleSubmitPrompt} >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          <button 
            className="px-5 py-3 bg-[#E8F0EA] border border-[#C8DCCB] rounded-full text-[11px] text-[#2D6A4F] whitespace-nowrap hover:bg-[#D8E4DA] transition-colors"
            onClick={() => navigate("/ai-loading", { state: { prompt: "Build a weekly list for 2" } })}
          >
            Build a weekly list for 2
          </button>
          <button className="px-5 py-3 bg-[#E8F0EA] border border-[#C8DCCB] rounded-full text-[11px] text-[#2D6A4F] whitespace-nowrap hover:bg-[#D8E4DA] transition-colors"
            onClick={() => navigate("/ai-loading", { state: { prompt: "Create a quick breakfast list" } })}
          >
            Create a quick breakfast list
          </button>
        </div>
      </div>

      {/* Lists Section */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-[#1A1A1A]">Your Lists</h2>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-3 bg-[#2D6A4F] rounded-xl text-white text-[12px] font-bold hover:bg-[#255940] transition-colors"
          >
            + New List
          </button>
        </div>

        <div className="space-y-3">
          {lists.length > 0 ? (
            lists.map((list) => <ListCard key={list.id} list={list} />)
          ) : (
            <div className="text-center py-12 text-[#999999]">
              No lists yet. Create your first one!
            </div>
          )}
        </div>
      </div>

      <BottomNav />
      <NewListDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateList={handleCreateList}
      />
    </div>
  );
}
