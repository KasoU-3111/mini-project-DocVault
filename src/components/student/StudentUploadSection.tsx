// src/components/student/StudentUploadSection.tsx
import { useState, useEffect } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { CloudUpload, Upload, RefreshCw, CheckCircle2, X, FileText, AlertCircle } from "lucide-react";

interface UploadSectionProps {
  category: string;
  setCategory: (val: string) => void;
  purpose: string;
  setPurpose: (val: string) => void;
  issueDate: string;
  setIssueDate: (val: string) => void;
  hasExpiry: boolean;
  setHasExpiry: (val: boolean) => void;
  expiryDate: string;
  setExpiryDate: (val: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  uploading: boolean;
  handleUpload: () => void;
}

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatBytes = (bytes: number) => {
  if (!bytes || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export default function StudentUploadSection({
  category,
  setCategory,
  purpose,
  setPurpose,
  issueDate,
  setIssueDate,
  hasExpiry,
  setHasExpiry,
  expiryDate,
  setExpiryDate,
  selectedFile,
  setSelectedFile,
  uploading,
  handleUpload,
}: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (!selectedFile) {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setTimeout(() => setImagePreviewUrl(null), 0);
      }
      return;
    }

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedFile]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (uploading) {
      setTimeout(() => setUploadProgress(10), 0);
      interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 15));
      }, 200);
    } else {
      setUploadProgress(0);
    }
    return () => clearInterval(interval);
  }, [uploading]);

  const validateAndSetFile = (file: File | null) => {
    setValidationError("");
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(
        `File is too large (${formatBytes(file.size)}). Maximum size allowed is ${MAX_FILE_SIZE_MB}MB.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0] || null;
    validateAndSetFile(droppedFile);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    validateAndSetFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError("");
    const fileInput = document.getElementById("document") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  const getExtension = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase();
    return ext || "FILE";
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-[#14213d]/10 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative overflow-hidden bg-[#14213d] p-6 text-white sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[25px] border-[#fca311]/10" />
          <div className="relative z-10">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fca311] text-[#14213d] font-bold shadow-md">
              <CloudUpload size={28} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#fca311]">
              Add to your vault
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">Upload your documents</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#e5e5e5]/80">
              Keep your important documents safe, organized, and accessible whenever you need them.
            </p>
            <div className="mt-7 space-y-3 text-xs font-semibold text-[#e5e5e5]">
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#fca311]" /> Private cloud storage
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#fca311]" /> Track expiry dates
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#fca311]" /> Monitor verification status
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h3 className="text-lg font-extrabold text-[#14213d]">Document Details</h3>
            <p className="mt-0.5 text-xs text-[#14213d]/60 font-medium">
              Provide necessary metadata to keep your files organized.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1.5 block text-xs font-bold text-[#14213d]">
                Document Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2.5 text-xs font-bold text-[#14213d] outline-none focus:border-[#14213d] focus:ring-2 focus:ring-[#fca311] cursor-pointer"
              >
                <option value="Academic">Academic</option>
                <option value="Identity">Identity</option>
                <option value="Financial">Financial</option>
                <option value="Scholarships">Scholarships</option>
                <option value="Certificates">Certificates</option>
                <option value="Government Documents">Government Documents</option>
                <option value="Resume">Resume</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div>
              <label htmlFor="purpose" className="mb-1.5 block text-xs font-bold text-[#14213d]">
                Document Purpose
              </label>
              <select
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2.5 text-xs font-bold text-[#14213d] outline-none focus:border-[#14213d] focus:ring-2 focus:ring-[#fca311] cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Internship">Internship</option>
                <option value="Placement">Placement</option>
                <option value="Admission">Admission</option>
                <option value="Examination">Examination</option>
              </select>
            </div>

            <div>
              <label htmlFor="issueDate" className="mb-1.5 block text-xs font-bold text-[#14213d]">
                Issue Date
              </label>
              <input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2.5 text-xs font-medium text-[#14213d] outline-none focus:border-[#14213d] focus:ring-2 focus:ring-[#fca311]"
              />
            </div>

            <div>
              <label htmlFor="hasExpiry" className="mb-1.5 block text-xs font-bold text-[#14213d]">
                Does it Expire?
              </label>
              <select
                id="hasExpiry"
                value={hasExpiry ? "yes" : "no"}
                onChange={(e) => {
                  const value = e.target.value === "yes";
                  setHasExpiry(value);
                  if (!value) setExpiryDate("");
                }}
                className="w-full rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2.5 text-xs font-bold text-[#14213d] outline-none focus:border-[#14213d] focus:ring-2 focus:ring-[#fca311] cursor-pointer"
              >
                <option value="no">No Expiry Date</option>
                <option value="yes">Yes, it Expires</option>
              </select>
            </div>

            {hasExpiry && (
              <div className="sm:col-span-2">
                <label htmlFor="expiryDate" className="mb-1.5 block text-xs font-bold text-[#14213d]">
                  Expiry Date
                </label>
                <input
                  id="expiryDate"
                  type="date"
                  min={issueDate || undefined}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-[#14213d]/20 bg-white px-3.5 py-2.5 text-xs font-medium text-[#14213d] outline-none focus:border-[#14213d] focus:ring-2 focus:ring-[#fca311]"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#14213d]">Upload File</label>
                <div className="flex gap-1.5">
                  {["PDF", "PNG", "JPG", "DOCX"].map((ext) => (
                    <span
                      key={ext}
                      className="rounded bg-[#14213d]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#14213d]"
                    >
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              <input
                id="document"
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />

              {validationError && (
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("document")?.click()}
                  className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-[#fca311] bg-[#fca311]/10 scale-[1.01]"
                      : "border-[#14213d]/20 bg-[#e5e5e5]/30 hover:border-[#14213d] hover:bg-white"
                  }`}
                >
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl font-bold transition-all ${
                      isDragging
                        ? "bg-[#fca311] text-[#14213d] scale-110"
                        : "bg-[#14213d] text-[#fca311] group-hover:scale-105"
                    }`}
                  >
                    <Upload size={22} />
                  </div>
                  <p className="text-xs font-extrabold text-[#14213d]">
                    {isDragging ? "Drop your file here!" : "Click or drag & drop file to upload"}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#14213d]/50">
                    Supports PDF, Images, or Office Documents (Max {MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-[#14213d]/20 bg-[#14213d]/5 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {imagePreviewUrl ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#14213d]/20 bg-white shadow-xs">
                          <img src={imagePreviewUrl} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#14213d] text-[#fca311] font-bold shadow-xs">
                          <FileText size={22} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-extrabold text-[#14213d]">
                            {selectedFile.name}
                          </p>
                          <span className="shrink-0 rounded-md bg-[#14213d] px-2 py-0.5 text-[9px] font-bold text-[#fca311]">
                            {getExtension(selectedFile.name)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] font-medium text-[#14213d]/60">
                          {formatBytes(selectedFile.size)} • Ready to upload
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={uploading}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#14213d]/10 bg-white text-[#14213d]/70 transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer disabled:opacity-50"
                      title="Remove selected file"
                      aria-label="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {uploading && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#14213d] mb-1">
                        <span>Uploading file...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#14213d]/10">
                        <div
                          className="h-full bg-[#fca311] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#14213d]/50 font-medium">
              Saved directly to your private DocVault storage.
            </p>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14213d] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0d1629] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <RefreshCw size={15} className="animate-spin text-[#fca311]" />
              ) : (
                <CloudUpload size={15} className="text-[#fca311]" />
              )}
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}