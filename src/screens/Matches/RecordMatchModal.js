import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";
import SinglesForm from "./SinglesForm";
import DoublesForm from "./DoublesForm";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function RecordMatchModal({
  open,
  onClose,
  onRecorded,
  initialSinglesValues,
  initialDoublesValues,
  initialTab = 0,
  submitLabel = "Record Match",
  onSinglesSubmit,
  onDoublesSubmit,
}) {
  const startingTab = initialDoublesValues ? 1 : initialSinglesValues ? 0 : initialTab;
  const [tab, setTab] = useState(startingTab);

  const handleClose = () => {
    setTab(startingTab);
    onClose?.();
  };

  const handleRecorded = (matchData) => {
    onRecorded?.(matchData);
    setTab(startingTab);
  };

  useEffect(() => {
    if (open) {
      setTab(startingTab);
    }
  }, [open, startingTab]);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Match</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(e, value) => setTab(value)} variant="fullWidth">
          <Tab label="Singles" />
          <Tab label="Doubles" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <SinglesForm
            onRecorded={handleRecorded}
            onClose={handleClose}
            open={open}
            initialValues={initialSinglesValues}
            submitLabel={submitLabel}
            onSubmit={onSinglesSubmit}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <DoublesForm
            onRecorded={handleRecorded}
            onClose={handleClose}
            open={open}
            initialValues={initialDoublesValues}
            submitLabel={submitLabel}
            onSubmit={onDoublesSubmit}
          />
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
}

export default RecordMatchModal;
