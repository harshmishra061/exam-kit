"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UploadDropzone from "@/components/UploadDropzone";
import {
  downloadBlob,
  loadImageDataUrl,
  loadImageElement,
  renderSignatureCanvas,
} from "@/lib/canvas";

const PREVIEW_BOX_SIZE = 300;

export default function SignatureMakerPage() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [intensity, setIntensity] = useState(50);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const { src } = await loadImageDataUrl(file);
    const img = await loadImageElement(src);
    setSourceImage(img);
  };

  const render = useCallback(() => {
    if (!sourceImage) return;
    const canvas = renderSignatureCanvas(
      sourceImage,
      sourceImage.naturalWidth,
      sourceImage.naturalHeight,
      intensity
    );

    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      previewCanvas.width = canvas.width;
      previewCanvas.height = canvas.height;
      previewCanvas.getContext("2d")?.drawImage(canvas, 0, 0);
    }
  }, [sourceImage, intensity]);

  useEffect(() => {
    render();
  }, [render]);

  const handleDownload = () => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;
    previewCanvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, "signature.jpg");
    }, "image/jpeg", 0.92);
  };

  return (
    <Box component="main" sx={{ flex: 1, bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Signature Maker
        </Typography>

        {!sourceImage && (
          <UploadDropzone
            onFiles={handleFiles}
            title="Drag & drop your signature image"
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
                <IconButton size="small" onClick={() => setSourceImage(null)}>
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
              }}
            >
              <Box sx={{ display: "inline-block", lineHeight: 0 }}>
                <canvas
                  ref={previewCanvasRef}
                  style={{ maxWidth: "100%", maxHeight: PREVIEW_BOX_SIZE - 32, display: "block" }}
                />
              </Box>
            </Box>

            <Slider
              min={0}
              max={100}
              value={intensity}
              onChange={(_, v) => setIntensity(v as number)}
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
      </Container>
    </Box>
  );
}
