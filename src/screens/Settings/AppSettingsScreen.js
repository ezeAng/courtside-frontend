import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

function AppSettingsScreen() {
  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Settings
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Preferences
              </Typography>
              <Divider />
              <List disablePadding>
                <ListItem disableGutters secondaryAction={<Switch edge="end" defaultChecked />}>
                  <ListItemText primary="Notifications" secondary="Match updates and reminders" />
                </ListItem>
                <Divider component="li" />
                <ListItem disableGutters secondaryAction={<Switch edge="end" />}> 
                  <ListItemText primary="Dark mode" secondary="Use system theme" />
                </ListItem>
                <Divider component="li" />
                <ListItem disableGutters secondaryAction={<Switch edge="end" />}> 
                  <ListItemText primary="Location access" secondary="Allow courts nearby" />
                </ListItem>
              </List>
              <Divider />
              <FormControlLabel control={<Switch />} label="Email summaries" />
              <FormControlLabel control={<Switch defaultChecked />} label="Tips & tutorials" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

export default AppSettingsScreen;
