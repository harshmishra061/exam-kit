"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadDropzone from "@/components/UploadDropzone";
import FaqSection from "@/components/FaqSection";
import {
  downloadBlob,
  drawPhotoCaption,
  loadImageDataUrl,
  loadImageElement,
} from "@/lib/canvas";

const PREVIEW_BOX_SIZE = 300;

const FAQ_ITEMS = [
  {
    question: "Where does the text appear on the photo?",
    answer:
      "Directly on the bottom of the photo itself, over a solid white band that keeps it readable regardless of what's behind it — the photo's dimensions don't change, so it still fits the exact size your form expects.",
  },
  {
    question: "Can I write more than one line?",
    answer:
      "Yes — press Enter in the text box for a new line. Common uses are a name on one line and a date on the next.",
  },
  {
    question: "Can I change the text color or font?",
    answer:
      "Not currently — it's kept deliberately simple with one control (text size) so it stays quick to use. Black text on a solid white band is designed to stay legible on any photo.",
  },
  {
    question: "Is this only for exam photos?",
    answer:
      "No — it works for any photo that needs a name, date, or label printed on it, exam-related or not.",
  },
];

export default function PhotoCaptionPage() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [caption, setCaption] = useState("");
  const [textSizePercent, setTextSizePercent] = useState(4);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { src } = await loadImageDataUrl(file);
    const img = await loadImageElement(src);
    setSourceImage(img);
  };

  const handleReset = () => {
    setSourceImage(null);
    setCaption("");
  };

  const render = useCallback(() => {
    if (!sourceImage) return;
    const { naturalWidth: width, naturalHeight: height } = sourceImage;
    const fontSizePx = Math.round(width * (textSizePercent / 100));
    const canvas = drawPhotoCaption(sourceImage, width, height, caption, fontSizePx);

    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      previewCanvas.width = canvas.width;
      previewCanvas.height = canvas.height;
      previewCanvas.getContext("2d")?.drawImage(canvas, 0, 0);
    }
  }, [sourceImage, caption, textSizePercent]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = () => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;
    previewCanvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "examkit-photo-caption.jpg");
    }, "image/jpeg", 0.92);
  };

  return (
    <Box component="main" sx={{ flex: 1, bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 1 }}>
          Photo Caption
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Write your name, date, or any other label at the bottom of a
          photo — useful for exam photos, ID uploads, or any form that asks
          for a labeled picture.
        </Typography>

        {!sourceImage && (
          <UploadDropzone
            onFiles={handleFiles}
            title="Drag & drop a photo"
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
              <Tooltip title="Upload a different photo">
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
              multiline
              minRows={2}
              maxRows={4}
              label="Text on photo"
              placeholder={"Your Name\n12/07/2026"}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Typography variant="caption" color="text.secondary">
              Text size
            </Typography>
            <Slider
              min={1}
              max={10}
              value={textSizePercent}
              onChange={(_, v) => setTextSizePercent(v as number)}
              sx={{ mb: 3 }}
            />

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
