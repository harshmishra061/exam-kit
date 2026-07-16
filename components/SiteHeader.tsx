"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import { alpha } from "@mui/material/styles";
import { siteConfig } from "@/lib/site";

const NAV_LINKS = [
  { href: "/signature-maker", label: "Signature Maker" },
  { href: "/a4-layout", label: "A4 Layout" },
  { href: "/image-resizer", label: "Image Resizer" },
  { href: "/photo-caption", label: "Photo Caption" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                variant={isActive ? "contained" : "outlined"}
                disableElevation
                sx={{
                  borderRadius: 999,
                  color: isActive ? "primary.contrastText" : "primary.main",
                  bgcolor: isActive
                    ? "primary.main"
                    : (theme) => alpha(theme.palette.primary.main, 0.06),
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                  "&:hover": {
                    bgcolor: isActive
                      ? "primary.dark"
                      : (theme) => alpha(theme.palette.primary.main, 0.14),
                  },
                }}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>

        <IconButton
          aria-label="Open navigation menu"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <ListItemButton
                  key={link.href}
                  component={Link}
                  href={link.href}
                  selected={isActive}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    color: isActive ? "primary.main" : "text.primary",
                    "&.Mui-selected": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
