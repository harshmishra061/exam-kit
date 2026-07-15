import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: 1, borderColor: "divider", py: 3, mt: "auto" }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            Made with <FavoriteIcon sx={{ fontSize: 16, color: "error.main" }} /> by Harsh
            Mishra
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link
              href={siteConfig.feedbackFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              underline="hover"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <FeedbackIcon fontSize="small" />
              <Typography variant="body2">Feedback</Typography>
            </Link>
            <Link
              href="https://github.com/harshmishra061"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              underline="hover"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2">GitHub</Typography>
            </Link>
            <Link
              href="https://linkedin.com/in/harshmishra061"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              underline="hover"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <LinkedInIcon fontSize="small" />
              <Typography variant="body2">LinkedIn</Typography>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
