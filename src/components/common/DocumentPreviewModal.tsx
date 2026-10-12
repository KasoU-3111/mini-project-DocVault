// src/components/common/DocumentPreviewModal.tsx
import { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Clock,
  XCircle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Info,
  Maximize2,
  RefreshCcw,
} from "lucide-react";
import { downloadData, getUrl } from "aws-amplify/storage";
import { downloadDocument } from "../../services/storageService";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    fileName: string;
    filePath: string;
    contentType?: string;
    category?: string;
    status?: string;
    studentId?: string;
    fileSize?: number;
    issueDate?: string;
    expiryDate?: string;
    purpose?: string;
  } | null;
}

export default function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
}: DocumentPreviewModalProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Viewer controls state
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showMetadata, setShowMetadata] = useState<boolean>(false);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset zoom & rotation when modal or document changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [document]);

  useEffect(() => {
    if (!isOpen || !document || !document.filePath) {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      return;
    }

    let isMounted = true;

    const loadPreview = async () => {
      try {
        setLoading(true);
        setError("");

        // Direct binary blob download via Amplify
        const downloadResult = await downloadData({
          path: document.filePath,
        }).result;

        const blob = await downloadResult.body.blob();
        if (isMounted) {
          const previewObjectUrl = URL.createObjectURL(blob);
          setFileUrl(previewObjectUrl);
        }
      } catch (err: unknown) {
        console.warn("Direct blob preview failed, fetching presigned URL...", err);

        try {
          const urlResult = await getUrl({
            path: document.filePath,
          });
          if (isMounted && urlResult.url) {
            setFileUrl(urlResult.url.toString());
          }
        } catch (fallbackErr: unknown) {
          console.error("Presigned URL generation failed:", fallbackErr);
          if (isMounted) {
            const message =
              fallbackErr instanceof Error
                ? fallbackErr.message
                : "Unable to fetch document preview from storage.";
            setError(message);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadPreview();

    return () => {
      isMounted = false;
    };
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const isImage =
    document.contentType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(document.fileName);

  const isPdf =
    document.contentType === "application/pdf" ||
    document.fileName.endsWith(".pdf");

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDocument(document.filePath);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes < 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/80 backdrop-blur-md p-3 sm:p-5 transition-all">
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl border border-[#14213d]/20 overflow-hidden">
        
        {/* Header - Executive Prussian Blue */}
        <div className="flex items-center justify-between border-b border-[#14213d]/10 px-5 py-3.5 bg-[#14213d] text-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fca311] text-[#14213d] shadow-md font-bold">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-white text-base truncate max-w-md tracking-tight">
                {document.fileName}
              </h3>
              <p className="text-xs text-[#e5e5e5]/70 flex items-center gap-2 mt-0.5">
                <span>
                  Category:{" "}
                  <strong className="font-semibold text-[#fca311]">
                    {document.category || "General"}
                  </strong>
                </span>
                {document.studentId && (
                  <>
                    <span className="text-[#e5e5e5]/30">•</span>
                    <span className="truncate">Student ID: {document.studentId}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Status Indicator Badges */}
            {document.status === "Approved" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck size={14} /> Approved
              </span>
            )}
            {document.status === "Pending" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#fca311]/20 px-3 py-1 text-xs font-bold text-[#fca311] border border-[#fca311]/30">
                <Clock size={14} /> Pending
              </span>
            )}
            {document.status === "Rejected" && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
                <XCircle size={14} /> Rejected
              </span>
            )}

            {/* Toggle Metadata Drawer */}
            <button
              type="button"
              onClick={() => setShowMetadata(!showMetadata)}
              title="Toggle Document Details"
              className={`rounded-xl p-2 transition cursor-pointer ${
                showMetadata
                  ? "bg-[#fca311] text-[#14213d]"
                  : "text-[#e5e5e5]/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Info size={18} />
            </button>

            {/* Open in New Tab */}
            {fileUrl && (
              <button
                type="button"
                onClick={handleOpenNewTab}
                title="Open original file in new tab"
                className="hidden sm:flex rounded-xl p-2 text-[#e5e5e5]/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <ExternalLink size={18} />
              </button>
            )}

            {/* Vibrant Orange Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#fca311] px-3.5 py-2 text-xs font-bold text-[#14213d] shadow-md hover:bg-[#e08e03] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {downloading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span>Download</span>
            </button>

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#e5e5e5]/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body Layout */}
        <div className="relative flex-1 bg-[#e5e5e5] overflow-hidden flex">
          
          {/* Main Preview Container */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-auto">
            
            {loading && (
              <div className="flex flex-col items-center gap-3 text-[#14213d] bg-white p-8 rounded-2xl shadow-md border border-[#14213d]/10">
                <LoaderCircle size={36} className="animate-spin text-[#fca311]" />
                <p className="text-xs font-bold text-[#14213d]">Loading document stream...</p>
                <p className="text-[11px] text-[#14213d]/60">Fetching file securely from AWS S3</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-[#14213d]/10 max-w-md">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-100">
                  <XCircle size={24} />
                </div>
                <p className="text-rose-700 font-bold text-xs mb-1.5">{error}</p>
                <p className="text-[11px] text-[#14213d]/70 mb-5 leading-relaxed">
                  Unable to render in-browser preview. You can still download the document directly to your device.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#14213d] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0d1629] transition cursor-pointer"
                >
                  <Download size={14} /> Download Document
                </button>
              </div>
            )}

            {!loading && !error && fileUrl && (
              <>
                {/* Floating Image Control Toolbar */}
                {isImage && (
                  <div className="absolute top-4 z-20 flex items-center gap-1.5 rounded-xl border border-[#14213d]/15 bg-white/90 p-1.5 shadow-lg backdrop-blur-md">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                      title="Zoom In"
                      className="rounded-lg p-1.5 text-[#14213d] hover:bg-[#e5e5e5] transition cursor-pointer"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                      title="Zoom Out"
                      className="rounded-lg p-1.5 text-[#14213d] hover:bg-[#e5e5e5] transition cursor-pointer"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      title="Rotate Clockwise"
                      className="rounded-lg p-1.5 text-[#14213d] hover:bg-[#e5e5e5] transition cursor-pointer"
                    >
                      <RotateCw size={16} />
                    </button>
                    <div className="h-4 w-px bg-[#14213d]/15 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => {
                        setZoom(1);
                        setRotation(0);
                      }}
                      title="Reset View"
                      className="rounded-lg p-1.5 text-[#14213d] hover:bg-[#e5e5e5] transition cursor-pointer"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                )}

                {/* Render Image */}
                {isImage && (
                  <div className="h-full w-full flex items-center justify-center p-2 overflow-auto">
                    <img
                      src={fileUrl}
                      alt={document.fileName}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: "transform 0.2s ease-out",
                      }}
                      className="max-h-full max-w-full rounded-xl object-contain shadow-md border border-[#14213d]/10 bg-white"
                    />
                  </div>
                )}

                {/* Render PDF */}
                {isPdf && (
                  <iframe
                    src={fileUrl}
                    title={document.fileName}
                    className="h-full w-full rounded-xl border border-[#14213d]/10 bg-white shadow-sm"
                  />
                )}

                {/* Unsupported formats fallback */}
                {!isImage && !isPdf && (
                  <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-[#14213d]/10 max-w-md">
                    <div className="w-16 h-16 bg-[#e5e5e5] text-[#14213d]/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText size={32} />
                    </div>
                    <h4 className="font-extrabold text-[#14213d] text-sm">
                      In-browser preview unavailable
                    </h4>
                    <p className="text-xs text-[#14213d]/70 mt-1.5 mb-5 leading-relaxed">
                      This file format cannot be directly previewed inside the browser modal.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#fca311] px-5 py-2.5 text-xs font-bold text-[#14213d] hover:bg-[#e08e03] transition shadow-md cursor-pointer"
                    >
                      <Download size={15} /> Download File
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Collapsible Metadata Drawer */}
          {showMetadata && (
            <aside className="w-72 border-l border-[#14213d]/10 bg-white p-5 flex flex-col justify-between shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between border-b border-[#14213d]/10 pb-3 mb-4">
                  <h4 className="font-extrabold text-[#14213d] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Info size={15} className="text-[#fca311]" /> Document Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowMetadata(false)}
                    className="text-[#14213d]/40 hover:text-[#14213d] cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                      File Name
                    </span>
                    <span className="font-bold text-[#14213d] break-all">
                      {document.fileName}
                    </span>
                  </div>

                  <div>
                    <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                      Category
                    </span>
                    <span className="inline-block rounded-md bg-[#fca311]/20 px-2 py-0.5 font-bold text-[#14213d] mt-0.5">
                      {document.category || "General"}
                    </span>
                  </div>

                  {document.studentId && (
                    <div>
                      <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                        Student ID
                      </span>
                      <span className="font-mono font-bold text-[#14213d]">
                        {document.studentId}
                      </span>
                    </div>
                  )}

                  {document.purpose && (
                    <div>
                      <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                        Purpose
                      </span>
                      <span className="font-semibold text-[#14213d]">
                        {document.purpose}
                      </span>
                    </div>
                  )}

                  {document.fileSize && (
                    <div>
                      <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                        File Size
                      </span>
                      <span className="font-semibold text-[#14213d]">
                        {formatFileSize(document.fileSize)}
                      </span>
                    </div>
                  )}

                  {document.contentType && (
                    <div>
                      <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                        Content Type
                      </span>
                      <span className="font-mono text-[11px] text-[#14213d]/70">
                        {document.contentType}
                      </span>
                    </div>
                  )}

                  {document.issueDate && (
                    <div>
                      <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                        Issue Date
                      </span>
                      <span className="font-semibold text-[#14213d]">
                        {document.issueDate}
                      </span>
                    </div>
                  )}

                  {document.expiryDate && (
                    <div>
                      <span className="block font-bold text-[#14213d]/50 uppercase tracking-wider text-[10px]">
                        Expiry Date
                      </span>
                      <span className="font-semibold text-[#14213d]">
                        {document.expiryDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#14213d]/10">
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  disabled={!fileUrl}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#14213d]/20 bg-[#e5e5e5]/30 px-3 py-2 text-xs font-bold text-[#14213d] hover:bg-[#14213d] hover:text-white transition disabled:opacity-40 cursor-pointer"
                >
                  <Maximize2 size={14} /> Fullscreen Tab
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}