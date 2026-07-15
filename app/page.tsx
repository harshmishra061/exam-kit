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
import type { SvgIconComponent } from "@mui/icons-material";
import { siteConfig } from "@/lib/site";

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
      <Container maxWidth="md">
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
              <Grid key={tool.href} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
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
                      <Typography variant="body2" color="text.secondary">
                        {tool.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
