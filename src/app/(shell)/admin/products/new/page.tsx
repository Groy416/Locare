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
  Layers,
  Tag,
} from "lucide-react";

interface AttributeValue {
  id: string;
  value: string;
}

interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

interface Category {
  id: string;
  name: string;
  attributes?: Attribute[];
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("Clothing");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  
  // Rental Rate State
  const [rentalUnit, setRentalUnit] = useState<"day" | "week" | "hour">("day");
  const [price, setPrice] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [inStock, setInStock] = useState("5");

  // Attribute Selections (Size, Color, Brand)
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("");
  const [customColorName, setCustomColorName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // Image Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Form Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Current Selected Category Object
  const currentCategory = categories.find((c) => c.name === selectedCategoryName || c.id === selectedCategoryId);

  // Fetch Categories & Attributes from /api/categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          const firstCat = data.find((c: Category) => c.name === "Clothing") || data[0];
          setSelectedCategoryName(firstCat.name);
          setSelectedCategoryId(firstCat.id);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  // Update selected attributes when category changes
  useEffect(() => {
    if (currentCategory && currentCategory.attributes) {
      const sizeAttr = currentCategory.attributes.find((a) => a.name.toLowerCase() === "size");
      const colorAttr = currentCategory.attributes.find((a) => a.name.toLowerCase() === "color");
      const brandAttr = currentCategory.attributes.find((a) => a.name.toLowerCase() === "brand");

      if (sizeAttr && sizeAttr.values.length > 0) setSelectedSizeId(sizeAttr.values[0].id);
      else setSelectedSizeId("");

      if (colorAttr && colorAttr.values.length > 0) setSelectedColorId(colorAttr.values[0].id);
      else setSelectedColorId("");

      if (brandAttr && brandAttr.values.length > 0) setSelectedBrandId(brandAttr.values[0].id);
      else setSelectedBrandId("");
    }
  }, [selectedCategoryName, currentCategory]);

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

      // Collect attributeValueIds
      const attributeValueIds: string[] = [];
      if (selectedSizeId) attributeValueIds.push(selectedSizeId);
      if (selectedColorId && selectedColorId !== "custom") attributeValueIds.push(selectedColorId);
      if (selectedBrandId) attributeValueIds.push(selectedBrandId);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category: selectedCategoryName,
          categoryId: selectedCategoryId,
          rentalUnit,
          price: parseFloat(price),
          rentalPrice: parseFloat(price),
          securityDeposit: parseFloat(securityDeposit),
          inStock: parseInt(inStock, 10),
          imageUrl: finalImageUrl || null,
          image: finalImageUrl || "/images/placeholder.jpg",
          attributeValueIds,
          customColorName: selectedColorId === "custom" ? customColorName : null,
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

  // Helper for dynamic price label
  const getPriceLabel = () => {
    if (rentalUnit === "day") return "Price per day: ₹";
    if (rentalUnit === "week") return "Price per week: ₹";
    if (rentalUnit === "hour") return "Price per hour: ₹";
    return "Rental Rate: ₹";
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
              Add New Product Listing
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create category-aware product listings with dynamic database attributes, rates, and swatches.
            </p>
          </div>
        </div>
      </div>

      {/* Error & Success Alerts */}
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
        {/* Left Column: Details & Dynamic Attributes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              Product Basic Info
            </h2>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                placeholder="e.g. Premium Linen Formal Shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                placeholder="Describe product specs, material, condition, and included accessories..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category Selector (All 4 DB Categories) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-lime-400" />
                Category (Loaded from DB)
              </label>
              <select
                className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                value={selectedCategoryName}
                onChange={(e) => {
                  const catName = e.target.value;
                  setSelectedCategoryName(catName);
                  const found = categories.find((c) => c.name === catName);
                  if (found) setSelectedCategoryId(found.id);
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
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Dynamic Category-Specific Attributes Section */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              Category Specific Attributes ({selectedCategoryName})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Size Attribute */}
              {currentCategory?.attributes?.some((a) => a.name.toLowerCase() === "size") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Size Option</label>
                  <select
                    className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                    value={selectedSizeId}
                    onChange={(e) => setSelectedSizeId(e.target.value)}
                  >
                    {currentCategory.attributes
                      .find((a) => a.name.toLowerCase() === "size")
                      ?.values.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.value}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Color Attribute */}
              {currentCategory?.attributes?.some((a) => a.name.toLowerCase() === "color") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Color Option</label>
                  <select
                    className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                    value={selectedColorId}
                    onChange={(e) => setSelectedColorId(e.target.value)}
                  >
                    {currentCategory.attributes
                      .find((a) => a.name.toLowerCase() === "color")
                      ?.values.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.value}
                        </option>
                      ))}
                    <option value="custom">+ Add New Custom Color...</option>
                  </select>

                  {selectedColorId === "custom" && (
                    <input
                      type="text"
                      className="mt-2 w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 border border-slate-700 focus:outline-none focus:border-lime-500"
                      placeholder="e.g. Emerald Green"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      required
                    />
                  )}
                </div>
              )}

              {/* Brand Attribute (Mango/Zara/H&M/Levis for Clothing, Nike/Adidas for Footwear, Sony/JBL for Electronics) */}
              {currentCategory?.attributes?.some((a) => a.name.toLowerCase() === "brand") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Brand / Manufacturer</label>
                  <select
                    className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                  >
                    {currentCategory.attributes
                      .find((a) => a.name.toLowerCase() === "brand")
                      ?.values.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.value}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Stock Details */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Rental Rates & Security Deposit
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rental Unit</label>
                <select
                  className="w-full bg-slate-950 text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all font-semibold"
                  value={rentalUnit}
                  onChange={(e) => setRentalUnit(e.target.value as "day" | "week" | "hour")}
                >
                  <option value="day">per Day (Daily)</option>
                  <option value="week">per Week (Weekly)</option>
                  <option value="hour">per Hour (Hourly)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-lime-400 mb-1.5">
                  {getPriceLabel()}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all font-bold"
                  placeholder="25.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Security Deposit (₹ / $)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                  placeholder="100.00"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Stock Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  className="w-full bg-slate-950 text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-lime-500/80 transition-all"
                  placeholder="5"
                  value={inStock}
                  onChange={(e) => setInStock(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload & Submit Action */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Product Image Upload
            </h2>

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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-lime-500 via-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-xl shadow-lime-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              "Creating Product..."
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Publish Product Listing
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
