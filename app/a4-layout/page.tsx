"use client";

import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import UploadDropzone from "@/components/UploadDropzone";
import { downloadBlob, loadImageDataUrl, loadImageElement } from "@/lib/canvas";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const BASE_PX_PER_MM = 96 / 25.4;
// Caps how big the editing sheet gets on wide screens; on narrow ones it
// shrinks further to fit the available width instead of overflowing.
const MAX_DISPLAY_SCALE = 0.55;
const EXPORT_DPI = 300;

interface DocItem {
  id: string;
  src: string;
  name: string;
  mime: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

function mimeToPdfFormat(mime: string): "PNG" | "JPEG" {
  return mime === "image/png" ? "PNG" : "JPEG";
}

export default function A4LayoutPage() {
  const [items, setItems] = useState<DocItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const dragState = useRef<{
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    startItem: DocItem;
  } | null>(null);

  const sheetContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = sheetContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pxPerMm =
    containerWidth > 0
      ? Math.min(BASE_PX_PER_MM * MAX_DISPLAY_SCALE, containerWidth / A4_WIDTH_MM)
      : BASE_PX_PER_MM * MAX_DISPLAY_SCALE;

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const loaded = await Promise.all(files.map(loadImageDataUrl));
    const newItems: DocItem[] = loaded.map((img, i) => {
      const defaultWidthMm = 50;
      const aspect = img.height / img.width;
      const cascade = (items.length + i) % 6;
      return {
        id: crypto.randomUUID(),
        src: img.src,
        name: files[i].name,
        mime: img.mime,
        xMm: 10 + cascade * 8,
        yMm: 10 + cascade * 8,
        widthMm: defaultWidthMm,
        heightMm: defaultWidthMm * aspect,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    setSelectedId(newItems[0]?.id ?? null);
  };

  const updateItem = (id: string, patch: Partial<DocItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const onPointerDownItem = (e: React.PointerEvent, item: DocItem, mode: "move" | "resize") => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setSelectedId(item.id);
    dragState.current = { id: item.id, mode, startX: e.clientX, startY: e.clientY, startItem: item };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    const deltaXMm = (e.clientX - drag.startX) / pxPerMm;
    const deltaYMm = (e.clientY - drag.startY) / pxPerMm;

    if (drag.mode === "move") {
      const xMm = Math.min(
        Math.max(drag.startItem.xMm + deltaXMm, 0),
        A4_WIDTH_MM - drag.startItem.widthMm
      );
      const yMm = Math.min(
        Math.max(drag.startItem.yMm + deltaYMm, 0),
        A4_HEIGHT_MM - drag.startItem.heightMm
      );
      updateItem(drag.id, { xMm, yMm });
    } else {
      const widthMm = Math.min(Math.max(drag.startItem.widthMm + deltaXMm, 10), A4_WIDTH_MM - drag.startItem.xMm);
      const heightMm = Math.min(Math.max(drag.startItem.heightMm + deltaYMm, 10), A4_HEIGHT_MM - drag.startItem.yMm);
      updateItem(drag.id, { widthMm, heightMm });
    }
  };

  const onPointerUp = () => {
    dragState.current = null;
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    items.forEach((item) => {
      doc.addImage(item.src, mimeToPdfFormat(item.mime), item.xMm, item.yMm, item.widthMm, item.heightMm);
    });
    doc.save("a4-layout.pdf");
  };

  const handleExportImage = async () => {
    const pxPerMm = EXPORT_DPI / 25.4;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(A4_WIDTH_MM * pxPerMm);
    canvas.height = Math.round(A4_HEIGHT_MM * pxPerMm);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const item of items) {
      const img = await loadImageElement(item.src);
      ctx.drawImage(
        img,
        item.xMm * pxPerMm,
        item.yMm * pxPerMm,
        item.widthMm * pxPerMm,
        item.heightMm * pxPerMm
      );
    }

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "a4-layout.png");
    }, "image/png");
  };

  return (
    <Box component="main" sx={{ flex: 1, bgcolor: "background.default", py: { xs: 3, sm: 6 } }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600 }} gutterBottom>
          A4 Sheet Layout
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 640 }}>
          Add your photos, signature, and scanned documents, drag them onto
          the sheet, then export as a PDF or image.
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              ref={sheetContainerRef}
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: "flex",
                justifyContent: "center",
                overflow: "auto",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Box
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
                sx={{
                  position: "relative",
                  width: A4_WIDTH_MM * pxPerMm,
                  height: A4_HEIGHT_MM * pxPerMm,
                  bgcolor: "#fff",
                  boxShadow: 1,
                  flexShrink: 0,
                }}
              >
                {items.map((item) => {
                  const isSelected = item.id === selectedId;
                  return (
                    <Box
                      key={item.id}
                      onPointerDown={(e) => onPointerDownItem(e, item, "move")}
                      sx={{
                        position: "absolute",
                        left: item.xMm * pxPerMm,
                        top: item.yMm * pxPerMm,
                        width: item.widthMm * pxPerMm,
                        height: item.heightMm * pxPerMm,
                        border: "2px solid",
                        borderColor: isSelected ? "primary.main" : "transparent",
                        cursor: "move",
                        touchAction: "none",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.src}
                        alt={item.name}
                        draggable={false}
                        sx={{ width: "100%", height: "100%", objectFit: "fill", display: "block", pointerEvents: "none" }}
                      />
                      {isSelected && (
                        <Box
                          onPointerDown={(e) => onPointerDownItem(e, item, "resize")}
                          sx={{
                            position: "absolute",
                            right: -12,
                            bottom: -12,
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "nwse-resize",
                            touchAction: "none",
                            "&::after": {
                              content: '""',
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                            },
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                <UploadDropzone
                  onFiles={handleUpload}
                  multiple
                  compact
                  title="Drag & drop documents"
                  subtitle="or click to browse — photos, signature, scans"
                />

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={handleExportPdf}
                    disabled={items.length === 0}
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={handleExportImage}
                    disabled={items.length === 0}
                  >
                    Export Image
                  </Button>
                </Stack>
              </Paper>

              {items.length > 0 && (
                <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Documents ({items.length})
                  </Typography>
                  <Stack spacing={0.5}>
                    {items.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        onClick={() => setSelectedId(item.id)}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: item.id === selectedId ? "action.selected" : "transparent",
                        }}
                      >
                        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                          {item.name}
                        </Typography>
                        <IconButton size="small" sx={{ p: 1 }} onClick={() => removeItem(item.id)}>
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
