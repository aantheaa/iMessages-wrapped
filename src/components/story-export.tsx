import React, { useState, useCallback, ReactNode } from "react";
import html2canvas from "html2canvas-pro";
import { Download, Share2, Loader2, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

async function captureElement(element: HTMLElement): Promise<string> {
  console.log("[story-export] Capturing element", element.innerHTML.slice(0, 200));
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#0a0a0f",
    useCORS: true,
    logging: true,
    allowTaint: true,
    width: STORY_WIDTH,
    height: STORY_HEIGHT,
    windowWidth: STORY_WIDTH,
    windowHeight: STORY_HEIGHT,
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
  });
  console.log("[story-export] Canvas created", canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/png");
  console.log("[story-export] DataURL length", dataUrl.length);
  return dataUrl;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  // Convert data URL to Blob for more reliable downloads (especially in iframes)
  try {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    
    // For iframe contexts, we need to add to document and use a real click
    document.body.appendChild(a);
    
    // Use a slight delay and manual click event
    setTimeout(() => {
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      a.dispatchEvent(clickEvent);
      
      // Cleanup after a delay
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 200);
    }, 100);
  } catch (err) {
    console.error("Download failed, opening in new tab:", err);
    // Fallback: open in new tab so user can right-click save
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html>
          <head><title>${filename}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111;">
            <div style="text-align:center;">
              <p style="color:white;margin-bottom:16px;">Right-click the image and select "Save Image As..."</p>
              <img src="${dataUrl}" style="max-width:100%;max-height:90vh;" />
            </div>
          </body>
        </html>
      `);
      newTab.document.close();
    }
  }
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title: string;
  isLoading: boolean;
}

function PreviewModal({ isOpen, onClose, imageUrl, title, isLoading }: PreviewModalProps) {
  const [downloaded, setDownloaded] = useState(false);
  
  // Reset downloaded state when modal opens with new content
  React.useEffect(() => {
    if (isOpen) {
      setDownloaded(false);
    }
  }, [isOpen, title]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (imageUrl) {
      const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadDataUrl(imageUrl, `wrapped-${safeName}.png`);
      setDownloaded(true);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a1a1a",
          borderRadius: "16px",
          maxWidth: "400px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ 
          padding: "16px 20px", 
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ fontWeight: 600, color: "white" }}>Story Preview</span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ 
          flex: 1, 
          overflow: "auto",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
        }}>
          {isLoading ? (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              minHeight: "300px",
              color: "rgba(255,255,255,0.5)",
            }}>
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            />
          ) : (
            <div style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Failed to generate preview
            </div>
          )}
        </div>

        <div style={{ 
          padding: "16px 20px", 
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <Button
            onClick={handleDownload}
            disabled={!imageUrl || isLoading}
            className="w-full"
            style={{ 
              gap: "8px",
              background: downloaded ? "linear-gradient(135deg, #22c55e, #16a34a)" : undefined,
              borderColor: downloaded ? "#22c55e" : undefined,
            }}
          >
            {downloaded ? (
              <>
                <span style={{ fontSize: "18px" }}>✓</span>
                Downloaded!
              </>
            ) : (
              <>
                <Download size={18} />
                Download for Instagram
              </>
            )}
          </Button>
          <p style={{ 
            fontSize: "12px", 
            color: "rgba(255,255,255,0.4)", 
            textAlign: "center",
            marginTop: "8px",
          }}>
            1080 × 1920px — perfect for Stories
          </p>
        </div>
      </div>
    </div>
  );
}

interface ExportableCardProps {
  children: ReactNode;
  cardId: string;
  title: string;
  storyContent: ReactNode;
  className?: string;
}

export function ExportableCard({
  children,
  cardId,
  title,
  storyContent,
  className = "",
}: ExportableCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setShowPreview(true);
    setDataUrl(null);
    
    // Create a temporary container for the story card
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "-9999px";
    container.style.width = `${STORY_WIDTH}px`;
    container.style.height = `${STORY_HEIGHT}px`;
    container.style.zIndex = "-9999";
    container.style.pointerEvents = "none";
    
    document.body.appendChild(container);

    try {
      // Use createRoot to render the story card into the container
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);
      
      // We need to wait for Recharts to render.
      await new Promise<void>((resolve) => {
        root.render(storyContent);
        setTimeout(resolve, 1500);
      });

      const url = await captureElement(container);
      setDataUrl(url);
      
      // Cleanup
      root.unmount();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      document.body.removeChild(container);
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className={`relative ${className}`} data-exportable-card={cardId}>
        {children}

        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          title="Export as Story"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s",
            color: "rgba(255,255,255,0.8)",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(139,92,246,0.8)";
            e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.6)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
          }}
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Camera size={18} />
          )}
        </button>
      </div>

      {/* Preview modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        imageUrl={dataUrl}
        title={title}
        isLoading={isExporting}
      />
    </>
  );
}

interface CardInfo {
  id: string;
  title: string;
  category: "vibes" | "messages" | "personality";
  storyContent: ReactNode;
}

interface ShareModalProps {
  cards: CardInfo[];
}

export function ShareModal({ cards }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<Set<string>>(new Set());
  const [exportedImages, setExportedImages] = useState<Map<string, string>>(new Map());
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportCard = useCallback(async (card: CardInfo): Promise<string | null> => {
    setExporting((prev) => new Set(prev).add(card.id));
    
    // Create a temporary container
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "-9999px";
    container.style.width = `${STORY_WIDTH}px`;
    container.style.height = `${STORY_HEIGHT}px`;
    container.style.zIndex = "-9999";
    container.style.pointerEvents = "none";
    
    document.body.appendChild(container);

    try {
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(container);
      
      await new Promise<void>((resolve) => {
        root.render(card.storyContent);
        setTimeout(resolve, 1500);
      });

      const dataUrl = await captureElement(container);
      root.unmount();
      
      if (dataUrl) {
        setExportedImages((prev) => new Map(prev).set(card.id, dataUrl));
        return dataUrl;
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      document.body.removeChild(container);
      setExporting((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
    }
    return null;
  }, []);

  const downloadCard = useCallback((id: string, title: string) => {
    const dataUrl = exportedImages.get(id);
    if (dataUrl) {
      const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      downloadDataUrl(dataUrl, `wrapped-${safeName}.png`);
    }
  }, [exportedImages]);

  const exportAll = useCallback(async () => {
    setIsExportingAll(true);
    setProgress(0);
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      await exportCard(card);
      setProgress(Math.round(((i + 1) / cards.length) * 100));
      await new Promise((r) => setTimeout(r, 200));
    }
    
    setIsExportingAll(false);
  }, [cards, exportCard]);

  const downloadAll = useCallback(() => {
    cards.forEach((card, i) => {
      const dataUrl = exportedImages.get(card.id);
      if (dataUrl) {
        setTimeout(() => {
          const safeName = card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          downloadDataUrl(dataUrl, `wrapped-${safeName}.png`);
        }, i * 100);
      }
    });
  }, [cards, exportedImages]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const vibesCards = cards.filter(c => c.category === "vibes");
  const messagesCards = cards.filter(c => c.category === "messages");
  const personalityCards = cards.filter(c => c.category === "personality");
  const allExported = cards.every(c => exportedImages.has(c.id));

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        style={{ gap: "8px" }}
      >
        <Share2 size={16} />
        Share Stories
      </Button>

      {isOpen && (
        <div
          onClick={handleBackdropClick}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: "16px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: "20px 24px", 
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontWeight: 600, color: "white", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Share2 size={20} />
                  Export as Instagram Stories
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
                  Pre-render all your cards at 1080×1920 for sharing
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  display: "flex",
                  color: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
              {/* Export all button */}
              <div style={{ marginBottom: "20px" }}>
                {!allExported ? (
                  <Button
                    onClick={exportAll}
                    disabled={isExportingAll}
                    className="w-full"
                    style={{ height: "48px", gap: "8px" }}
                  >
                    {isExportingAll ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Rendering... {progress}%
                      </>
                    ) : (
                      <>
                        <Camera size={18} />
                        Render All {cards.length} Stories
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={downloadAll}
                    className="w-full"
                    style={{ height: "48px", gap: "8px" }}
                  >
                    <Download size={18} />
                    Download All {cards.length} Stories
                  </Button>
                )}
              </div>

              {/* Progress bar when exporting */}
              {isExportingAll && (
                <div style={{ 
                  marginBottom: "20px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  overflow: "hidden",
                  height: "4px",
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #ec4899, #a855f7)",
                    transition: "width 0.2s",
                  }} />
                </div>
              )}

              {/* Preview grid of exported images */}
              {exportedImages.size > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "12px" }}>
                    Click any preview to download individually
                  </p>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "12px",
                  }}>
                    {cards.map(card => {
                      const imgUrl = exportedImages.get(card.id);
                      if (!imgUrl) return null;
                      return (
                        <button
                          key={card.id}
                          onClick={() => downloadCard(card.id, card.title)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            borderRadius: "8px",
                            overflow: "hidden",
                            aspectRatio: "9/16",
                            position: "relative",
                          }}
                          title={card.title}
                        >
                          <img
                            src={imgUrl}
                            alt={card.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(transparent 60%, rgba(0,0,0,0.8))",
                            display: "flex",
                            alignItems: "flex-end",
                            padding: "8px",
                          }}>
                            <span style={{ 
                              fontSize: "10px", 
                              color: "white",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {card.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Card categories for individual exports */}
              {[
                { name: "✨ Vibes", cards: vibesCards },
                { name: "💌 Messages", cards: messagesCards },
                { name: "🔮 Personality", cards: personalityCards },
              ].map(({ name, cards: categoryCards }) => categoryCards.length > 0 && (
                <div key={name} style={{ marginBottom: "20px" }}>
                  <p style={{ 
                    fontSize: "14px", 
                    fontWeight: 600, 
                    color: "white", 
                    marginBottom: "12px",
                  }}>
                    {name} ({categoryCards.length})
                  </p>
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "8px",
                  }}>
                    {categoryCards.map((card) => {
                      const isExported = exportedImages.has(card.id);
                      const isLoading = exporting.has(card.id);
                      
                      return (
                        <button
                          key={card.id}
                          onClick={() => isExported ? downloadCard(card.id, card.title) : exportCard(card)}
                          disabled={isLoading}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 12px",
                            background: isExported ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${isExported ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "12px",
                            cursor: isLoading ? "wait" : "pointer",
                            textAlign: "left",
                            transition: "all 0.2s",
                          }}
                        >
                          {isLoading ? (
                            <Loader2 size={14} className="animate-spin" style={{ flexShrink: 0 }} />
                          ) : isExported ? (
                            <Download size={14} style={{ flexShrink: 0, color: "#22c55e" }} />
                          ) : (
                            <Camera size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                          )}
                          <span style={{ 
                            overflow: "hidden", 
                            textOverflow: "ellipsis", 
                            whiteSpace: "nowrap",
                          }}>
                            {card.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}






