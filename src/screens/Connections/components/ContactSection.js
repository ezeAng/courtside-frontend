import { useMemo } from "react";
import { useSelector } from "react-redux";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

function ContactRow({ icon, label, value, href }) {
  const handleClick = () => {
    if (value) {
      navigator.clipboard?.writeText(value);
    }
  };

  return (
    <Grid
      container
      alignItems="center"
      columnSpacing={1}
      wrap="nowrap"
      sx={{ width: "100%" }}
    >
      {/* Icon */}
      <Grid
        item
        sx={{
          display: "flex",
          alignItems: "center",
          color: "text.secondary",
        }}
      >
        {icon}
      </Grid>

      {/* Label */}
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Grid>

      {/* Value (tap to copy) */}
      <Grid item xs>
        <Box
          component={href ? "a" : "div"}
          href={href}
          onClick={handleClick}
          sx={{
            display: "block",
            cursor: "pointer",
            textDecoration: "none",
            color: "text.primary",
            fontSize: 14,
            lineHeight: 1.4,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {value}
        </Box>
      </Grid>
    </Grid>
  );
}

function ContactSection({ playerId }) {
  const contactState = useSelector(
    (state) => state.connections.contact[playerId]
  );

  const content = useMemo(() => {
    if (!contactState || contactState.loading) {
      return (
        <Typography variant="body2" color="text.secondary">
          Loading contact details…
        </Typography>
      );
    }

    if (contactState.forbidden) {
      return (
        <Typography variant="body2" color="text.secondary">
          Contact details not shared
        </Typography>
      );
    }

    if (contactState.error) {
      return (
        <Typography variant="body2" color="error">
          Unable to load contact
        </Typography>
      );
    }

    const phone = contactState.data?.phone_number;
    const email = contactState.data?.contact_email;

    if (!phone && !email) {
      return (
        <Typography variant="body2" color="text.secondary">
          This user has not added contact details yet.
        </Typography>
      );
    }

    return (
      <Stack spacing={1}>
        {phone && (
          <ContactRow
            icon={<PhoneIcon fontSize="small" />}
            label="Phone"
            value={phone}
          />
        )}
        {email && (
          <ContactRow
            icon={<EmailIcon fontSize="small" />}
            label="Email"
            value={email}
            href={`mailto:${email}`}
          />
        )}
      </Stack>
    );
  }, [contactState]);

  return (
    <Stack spacing={1.5} width="100%">
      <Typography variant="subtitle1" fontWeight={700}>
        Contact
      </Typography>
      {content}
    </Stack>
  );
}

export default ContactSection;
