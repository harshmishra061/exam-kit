"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export default function UploadDropzone({
  onFiles,
  multiple = false,
  accept = "image/*",
  title = "Drag & drop an image here",
  subtitle = "or click to browse",
  compact = false,
}: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const extractFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) onFiles(files);
  };

  return (
    <Box
      component="label"
      onDragOver={(e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        extractFiles(e.dataTransfer.files);
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        py: compact ? 3 : 7,
        px: 3,
        textAlign: "center",
        cursor: "pointer",
        borderRadius: 3,
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "divider",
        bgcolor: isDragActive
          ? (theme) => alpha(theme.palette.primary.main, 0.06)
          : "background.paper",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
        },
      }}
    >
      <CloudUploadIcon
        sx={{ fontSize: compact ? 32 : 48, color: "primary.main", mb: 1 }}
      />
      <Typography variant={compact ? "body2" : "subtitle1"} sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          extractFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </Box>
  );
}
