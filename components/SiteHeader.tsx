"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import { siteConfig } from "@/lib/site";

const NAV_LINKS = [
  { href: "/signature-maker", label: "Signature Maker" },
  { href: "/a4-layout", label: "A4 Layout" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Toolbar sx={{ maxWidth: "lg", width: "100%", mx: "auto" }}>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ flexGrow: 1, color: "text.primary", textDecoration: "none", fontWeight: 600 }}
        >
          {siteConfig.name}
        </Typography>
        <Stack direction="row" spacing={1}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                color="inherit"
                sx={{
                  color: isActive ? "primary.main" : "inherit",
                  bgcolor: isActive
                    ? (theme) => alpha(theme.palette.primary.main, 0.1)
                    : "transparent",
                  "&:hover": {
                    bgcolor: isActive
                      ? (theme) => alpha(theme.palette.primary.main, 0.16)
                      : undefined,
                  },
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
