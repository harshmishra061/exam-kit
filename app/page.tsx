"use client";

import Link from "next/link";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import GridViewIcon from "@mui/icons-material/GridView";
import PhotoSizeSelectLargeIcon from "@mui/icons-material/PhotoSizeSelectLarge";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { SvgIconComponent } from "@mui/icons-material";
import { siteConfig } from "@/lib/site";
import FaqSection from "@/components/FaqSection";

const FAQ_ITEMS = [
  {
    question: "What can I actually do with ExamKit?",
    answer:
      "Four things, all aimed at the fiddly parts of filling out any form: the Signature Maker turns a photo of your signature into a clean, white-background image ready to upload. The Image Resizer shrinks any photo to fit a file-size or pixel-dimension limit. Photo Caption lets you write a name, date, or label directly onto a photo. The A4 Sheet Layout tool lets you arrange multiple documents — like the front and back of an ID card, or several certificates — onto a single A4 sheet, so you can export one file or print one page instead of juggling several.",
  },
  {
    question: "Is ExamKit only for exam forms?",
    answer:
      "No — despite the name, all four tools work for any form that asks for a signature photo, a correctly sized or labeled image, or scanned/printed documents: government and exam applications, job applications, visa forms, bank KYC, college admissions, and more.",
  },
  {
    question: "Can I put the front and back of my ID or documents on one page?",
    answer:
      "Yes — that's exactly what the A4 Sheet Layout tool is for. Add the front and back images (or any number of documents), drag them into place on the sheet, and export as a single PDF or image. It's also handy for printing everything as one physical page instead of separate printouts.",
  },
  {
    question: "Is ExamKit really free?",
    answer:
      "Yes. Every tool is free to use, with no account, sign-up, or watermark.",
  },
  {
    question: "Do you upload or store my photos and documents?",
    answer:
      "No. Every tool runs entirely in your browser using the Canvas API — your signature photo, ID scans, and documents never leave your device or touch a server. Closing the tab clears everything.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No installation needed — ExamKit works directly in your mobile or desktop browser.",
  },
];

const TOOLS: {
  href: string;
  title: string;
  description: string;
  icon: SvgIconComponent;
}[] = [
  {
    href: "/signature-maker",
    title: "Signature Maker",
    description:
      "Upload a photo of your signature and clean it up into crisp black ink on a plain white background.",
    icon: BorderColorIcon,
  },
  {
    href: "/a4-layout",
    title: "A4 Sheet Layout",
    description:
      "Arrange photos, signatures, and scanned documents on an A4 sheet with proper margins before printing.",
    icon: GridViewIcon,
  },
  {
    href: "/image-resizer",
    title: "Image Resizer",
    description:
      "Shrink any photo to a target file size, with optional exact pixel dimensions, for any upload with a size limit.",
    icon: PhotoSizeSelectLargeIcon,
  },
  {
    href: "/photo-caption",
    title: "Photo Caption",
    description:
      "Write your name, date, or any label directly at the bottom of a photo.",
    icon: TextFieldsIcon,
  },
];

export default function Home() {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        py: 10,
        background: (theme) =>
          `radial-gradient(circle at 15% 0%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 45%), ${theme.palette.background.default}`,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom>
          {siteConfig.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 560, mb: 6, fontWeight: 400 }}>
          {siteConfig.description}
        </Typography>

        <Grid container spacing={3}>
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Grid key={tool.href} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                    boxShadow: "0 1px 3px rgba(30,27,46,0.06)",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(30,27,46,0.08)",
                      transform: "translateY(-2px)",
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardActionArea component={Link} href={tool.href} sx={{ height: "100%", p: 1 }}>
                    <CardContent>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 2.5,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          mb: 2,
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {tool.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tool.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "primary.contrastText",
                          bgcolor: "primary.main",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          borderRadius: 999,
                          px: 2,
                          py: 0.75,
                          boxShadow: "0 1px 2px rgba(30,27,46,0.15)",
                        }}
                      >
                        Open tool
                        <ArrowForwardIcon sx={{ fontSize: 18 }} />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 8, maxWidth: 640 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1.5 }}>
            Why ExamKit exists
          </Typography>
          <Typography color="text.secondary">
            Filling out any form — a government exam application, a job
            application, a visa form — is rarely just filling out a form. It's
            fighting with signature photos that won't turn white, and
            figuring out how to get the front and back of an ID, or several
            documents, onto one sheet correctly. ExamKit is a small, free,
            no-signup toolkit for exactly those fiddly steps.
          </Typography>
        </Box>

        <FaqSection items={FAQ_ITEMS} />
      </Container>
    </Box>
  );
}
