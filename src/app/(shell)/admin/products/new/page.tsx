"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  Image as ImageIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AV Equipment & Electronics");
  const [categoryId, setCategoryId] = useState("");
  const [rentalUnit, setRentalUnit] = useState<"hour" | "day" | "week" | "month">("day");
  const [price, setPrice] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [inStock, setInStock] = useState("5");

  // Image Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Form Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch Categories from /api/categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setCategory(data[0].name);
            setCategoryId(data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadImage = async () => {
    if (!file) return null;
    setUploadingImage(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image upload failed");
      }

      setUploadedImageUrl(data.url);
      setUploadingImage(false);
      return data.url;
    } catch (err: unknown) {
      setUploadingImage(false);
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj.message || "Failed to upload image");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      let finalImageUrl = uploadedImageUrl;
      if (file && !finalImageUrl) {
        finalImageUrl = await handleUploadImage();
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          rentalUnit,
          price: parseFloat(price),
          securityDeposit: parseFloat(securityDeposit),
          inStock: parseInt(inStock, 10),
          imageUrl: finalImageUrl || null,
          image: finalImageUrl || "/images/placeholder.jpg",
          categoryId: categoryId || null,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to create product");
      } else {
        setSuccessMessage("Product created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      }
    } catch (err: unknown) {
      setSubmitting(false);
      const errorObj = err as { message?: string };
      setErrorMessage(errorObj.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="page-shell animate-fade-in max-w-5xl mx-auto py-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-lime-400" />
              Add New Product Equipment
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create product listings with dynamic category attributes, images, and rental deposits.
            </p>
          </div>
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            {errorMessage}
          </div>
          <button onClick={() => setErrorMessage("")} className="text-rose-400 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              Product Details
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                placeholder="e.g. Sony FX3 Cinema Camera Kit"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea
                required
                rows={4}
                className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                placeholder="Describe equipment condition, included accessories, and usage guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const found = categories.find((c) => c.name === e.target.value);
                  if (found) setCategoryId(found.id);
                }}
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="AV Equipment & Electronics">AV Equipment & Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Heavy Machinery">Heavy Machinery</option>
                    <option value="Access Equipment">Access Equipment</option>
                    <option value="Cleaning Equipment">Cleaning Equipment</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Pricing & Stock Details */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Rental Rates & Deposit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Base Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                  placeholder="45.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rental Unit</label>
                <select
                  className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                  value={rentalUnit}
                  onChange={(e) => setRentalUnit(e.target.value as "hour" | "day" | "week" | "month")}
                >
                  <option value="hour">per Hour</option>
                  <option value="day">per Day</option>
                  <option value="week">per Week</option>
                  <option value="month">per Month</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Security Deposit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                  placeholder="150.00"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                  placeholder="5"
                  value={inStock}
                  onChange={(e) => setInStock(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload & Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Product Image Upload
            </h2>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-800 hover:border-lime-500/60 rounded-2xl p-6 text-center transition-all bg-slate-950/50 relative group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl border border-slate-800"
                  />
                  <p className="text-[11px] text-lime-400 font-semibold">Image selected for upload</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-lime-400 group-hover:border-lime-500/40 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-slate-300">Click or drag image file here</p>
                  <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
            </div>

            {file && !uploadedImageUrl && (
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={uploadingImage}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                {uploadingImage ? "Uploading Image..." : "Upload Image File Now"}
              </button>
            )}

            {uploadedImageUrl && (
              <p className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Uploaded to {uploadedImageUrl}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-lime-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              "Creating Equipment Listing..."
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish Equipment Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
