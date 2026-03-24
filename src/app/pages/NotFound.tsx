import { useNavigate } from "react-router";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center px-6 max-w-[608px] mx-auto">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#2D6A4F] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Page Not Found
        </h2>
        <p className="text-[#999999] mb-8">
          The page you're looking for doesn't exist. It is under developement and will be available soon.
        </p>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D6A4F] text-white rounded-xl font-medium hover:bg-[#255940] transition-colors"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </div>
    </div>
  );
}
