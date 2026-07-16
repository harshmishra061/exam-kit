"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";
import UploadDropzone from "@/components/UploadDropzone";
import FaqSection from "@/components/FaqSection";
import {
  compressToTargetKB,
  downloadBlob,
  loadImageDataUrl,
  loadImageElement,
  resizeToCanvas,
} from "@/lib/canvas";

const PREVIEW_BOX_SIZE = 300;

const FAQ_ITEMS = [
  {
    question: "How do I get my photo under a specific file size?",
    answer:
      "Upload the image, type the target size in KB, and download — it automatically finds the highest JPEG quality that still fits under that limit, so the photo looks as good as possible while meeting the size requirement.",
  },
  {
    question: "Can I resize to exact pixel dimensions too?",
    answer:
      "Yes — click \"Edit dimensions\" to reveal width and height fields. Leave them as-is to keep the original dimensions and only reduce file size, or set exact pixel values if your form requires a specific size.",
  },
  {
    question: "Is this only for exam or government forms?",
    answer:
      "No — this works for any photo that needs to fit a file-size or pixel-dimension limit: exam applications, job applications, ID uploads, visa forms, or any website with an upload limit.",
  },
  {
    question: "What if it can't reach my target size?",
    answer:
      "If even the lowest quality setting is still above your target, the tool downloads the smallest file it can produce and lets you know it couldn't quite hit the target — try reducing the pixel dimensions as well for a smaller result.",
  },
];

export default function ImageResizerPage() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [targetKBInput, setTargetKBInput] = useState("100");
  const [widthInput, setWidthInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [showDimensions, setShowDimensions] = useState(false);
  const [result, setResult] = useState<{ sizeKB: number; hitTarget: boolean } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderIdRef = useRef(0);

  const targetKB = Number(targetKBInput) || 0;
  const width = Number(widthInput) || 0;
  const height = Number(heightInput) || 0;

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { src, width: w, height: h } = await loadImageDataUrl(file);
    const img = await loadImageElement(src);
    setSourceImage(img);
    setWidthInput(String(w));
    setHeightInput(String(h));
    setShowDimensions(false);
  };

  const handleReset = () => {
    setSourceImage(null);
    setResult(null);
  };

  const render = useCallback(async () => {
    if (!sourceImage || width <= 0 || height <= 0) return;
    const renderId = ++renderIdRef.current;
    const canvas = resizeToCanvas(sourceImage, width, height);

    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      previewCanvas.width = canvas.width;
      previewCanvas.height = canvas.height;
      previewCanvas.getContext("2d")?.drawImage(canvas, 0, 0);
    }

    const compressed = await compressToTargetKB(canvas, targetKB, "image/jpeg");
    // A newer render may have started (and even finished) while this one was
    // still compressing — ignore this result if it's no longer the latest.
    if (renderId !== renderIdRef.current) return;
    setResult({ sizeKB: compressed.sizeKB, hitTarget: compressed.hitTarget });
  }, [sourceImage, width, height, targetKB]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = () => {
    if (!sourceImage || width <= 0 || height <= 0) return;
    const canvas = resizeToCanvas(sourceImage, width, height);
    compressToTargetKB(canvas, targetKB, "image/jpeg").then(({ blob }) => {
      downloadBlob(blob, "examkit-resized-image.jpg");
    });
  };

  return (
    <Box component="main" sx={{ flex: 1, bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Image Resizer
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Shrink any photo to fit a file-size limit, with optional exact
          pixel dimensions — ready for exam forms, job applications, or any
          upload with a size restriction.
        </Typography>

        {!sourceImage && (
          <UploadDropzone
            onFiles={handleFiles}
            title="Drag & drop an image"
            subtitle="or click to browse — JPG or PNG"
          />
        )}

        {sourceImage && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 4,
              boxShadow: "0 1px 3px rgba(30,27,46,0.06)",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <Tooltip title="Upload a different image">
                <IconButton size="small" onClick={handleReset}>
                  <RestartAltIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                height: PREVIEW_BOX_SIZE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                mb: 3,
              }}
            >
              <Box sx={{ display: "inline-block", lineHeight: 0 }}>
                <canvas
                  ref={previewCanvasRef}
                  style={{ maxWidth: "100%", maxHeight: PREVIEW_BOX_SIZE, display: "block" }}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Target size (KB)"
              value={targetKBInput}
              onChange={(e) => setTargetKBInput(e.target.value)}
              error={result ? !result.hitTarget : false}
              helperText={
                result && !result.hitTarget
                  ? `Can't get under this — smallest possible is ${result.sizeKB.toFixed(1)} KB`
                  : undefined
              }
              sx={{ mb: 2 }}
            />

            <Button
              size="small"
              startIcon={<TuneIcon />}
              onClick={() => setShowDimensions((v) => !v)}
              sx={{ mb: showDimensions ? 2 : 3 }}
            >
              {showDimensions ? "Hide dimensions" : "Edit dimensions"}
            </Button>

            <Collapse in={showDimensions}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Width (px)"
                    value={widthInput}
                    onChange={(e) => setWidthInput(e.target.value)}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Height (px)"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Collapse>

            <Button
              variant="contained"
              size="large"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              fullWidth
            >
              Download
            </Button>
          </Paper>
        )}

        <FaqSection items={FAQ_ITEMS} />
      </Container>
    </Box>
  );
}
