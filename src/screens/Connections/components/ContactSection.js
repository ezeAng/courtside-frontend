import { useMemo } from "react";
import { useSelector } from "react-redux";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

function ContactRow({ icon, label, value, href }) {
  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {icon}
      <Typography>{label}</Typography>
      <Button
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        variant="outlined"
      >
        {value}
      </Button>
      <Button
        onClick={handleCopy}
        size="small"
        startIcon={<ContentCopyIcon />}
        variant="text"
      >
        Copy
      </Button>
    </Stack>
  );
}

function ContactSection({ playerId }) {
  const contactState = useSelector((state) => state.connections.contact[playerId]);

  const content = useMemo(() => {
    if (!contactState || contactState.loading) {
      return <Typography>Loading contact details...</Typography>;
    }

    if (contactState.forbidden) {
      return <Typography>Contact details not shared</Typography>;
    }

    if (contactState.error) {
      return <Typography color="error">Unable to load contact</Typography>;
    }

    const phone = contactState.data?.phone;
    const email = contactState.data?.contact_email;

    if (!phone && !email) {
      return <Typography>This user has not added contact details yet.</Typography>;
    }

    return (
      <Stack spacing={1} alignItems="flex-start" width="100%">
        {phone && (
          <ContactRow
            icon={<PhoneIcon />}
            label="Phone"
            value={phone}
            href={`tel:${phone}`}
          />
        )}
        {email && (
          <ContactRow
            icon={<EmailIcon />}
            label="Email"
            value={email}
            href={`mailto:${email}`}
          />
        )}
      </Stack>
    );
  }, [contactState]);

  return (
    <Stack spacing={1} width="100%" alignItems="flex-start">
      <Typography variant="subtitle1" fontWeight={700}>
        Contact
      </Typography>
      {content}
    </Stack>
  );
}

export default ContactSection;
