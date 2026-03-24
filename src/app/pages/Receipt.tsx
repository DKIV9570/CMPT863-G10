import { Camera } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router";
import { useRef, useState } from "react";

export default function Receipt() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // optional chaining for safety

    if (file) {
      console.log("Uploaded:", file);

      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
};

  return (
    <div className="bg-white min-h-screen pb-[111px] max-w-[608px] mx-auto">
      {/* Hidden Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

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
      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          ←
        </button>
        <h1 className="text-[20px] font-semibold text-[#1A1A1A]">
          Upload Receipt
        </h1>
      </div>

      {/* Upload Area */}
      <div className="px-6 mt-4">
        <div className="w-full h-[60vh] border-2 border-dashed border-[#CFE3D6] rounded-2xl flex flex-col items-center justify-center text-center px-6">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
              
            />
          
          ) : (
            <>
              <div className="w-20 h-20 bg-[#E8F2EC] rounded-2xl flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-[#2D6A4F]" />
              </div>

              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-1">
                Snap or upload a receipt
              </h2>

              <p className="text-[13px] text-[#9CA3AF] max-w-[240px]">
                Our AI will extract items, quantities, and prices to build your list
              </p>
            </>
          )}
          
        </div>
        
      </div>


      {/* Actions */}
      <div className="px-6 mt-6 flex gap-4">
        <button className="flex-1 bg-[#2D6A4F] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">
          📷 Take Photo
        </button>

        <button
          onClick={handleUploadClick}
          className="flex-1 border border-[#E5E7EB] text-[#1A1A1A] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#F9FAFB]"
        >
          📤 Upload File
        </button>
      </div>

      {/* Preview Image for upload */}
      {preview && (
        <p className="mt-3 text-center text-green-600 font-medium">
          ✓ Receipt uploaded successfully
        </p>
      )}

      <BottomNav />
    </div>
  );
}
