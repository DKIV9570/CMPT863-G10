import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";

export default function ShareListPage() {
  const navigate = useNavigate();

  const users = [
    {
      name: "William F.",
      email: "wf@email.com",
      role: "Editor",
    },
    {
      name: "Jin N.",
      email: "jn@email.com",
      role: "Viewer",
    },
  ];

  return (
    <div className="bg-white min-h-screen pb-[111px] max-w-[3000px] mx-auto">
      
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-[#F0F5F1] rounded-full flex items-center justify-center hover:bg-[#E0E8E2] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#2D6A4F]" />
          </button>

          <h1 className="text-[20px] font-bold text-[#1A1A1A]">
            Share List
          </h1>
        </div>

        <p className="text-[13px] text-[#888888] mb-4">
          Invite household members to collaborate on this list
        </p>

        {/* Input */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter email or username"
            className="flex-1 bg-[#F0F5F1] border border-[#E0E8E2] rounded-2xl px-4 py-4 text-[14px] text-[#1A1A1A] placeholder:text-[#999999] outline-none"
          />
          <button className="px-5 py-4 bg-[#2D6A4F] rounded-2xl text-white text-[13px] font-bold hover:bg-[#255940] transition-colors">
            Invite
          </button>
        </div>
      </div>

      {/* Shared With */}
      <div className="px-6 pt-2">
        <p className="text-[11px] font-bold text-[#999999] mb-3">
          SHARED WITH
        </p>

        <div className="space-y-4">
          {users.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E8F0EA] rounded-full flex items-center justify-center text-[#2D6A4F] font-bold">
                  {user.name[0]}
                </div>

                <div>
                  <p className="text-[14px] font-bold text-[#1A1A1A]">
                    {user.name}
                  </p>
                  <p className="text-[12px] text-[#999999]">
                    {user.email}
                  </p>
                </div>
              </div>

              <div
                className={`px-3 py-2 rounded-xl text-[11px] font-bold ${
                  user.role === "Editor"
                    ? "bg-[#E8F0EA] text-[#2D6A4F]"
                    : "bg-[#F5F5F5] text-[#999999]"
                }`}
              >
                {user.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}