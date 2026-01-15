import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import {
  signup,
  resendConfirmationEmail,
  resetSignupStatus,
} from "../../features/auth/authSlice";
import OnboardingModal from "../../components/OnboardingModal/OnboardingModal";
import logo from "../../logo.svg";

const clampElo = (value) => Math.min(2000, Math.max(800, Math.round(value)));

const calculateSeedElo = (answers) => {
  const baseElo = 1000;

  const playFrequencyWeights = {
    rarely: 0,
    monthly: 50,
    weekly: 120,
    frequently: 200,
  };

  const yearsExperienceWeights = {
    lt_6_months: 0,
    "6_12_months": 40,
    "1_3_years": 80,
    "3_5_years": 120,
    "5_plus_years": 160,
  };

  const competitiveExposureWeights = {
    none: 0,
    casual: 50,
    social_league: 120,
    club: 200,
    tournament: 300,
    international: 400,
  };

  const selfAssessmentWeights = {
    beginner: 0,
    intermediate: 50,
    solid: 120,
    advanced: 200,
  };

  const fitnessLevelWeights = {
    limited: -20,
    average: 0,
    fit: 40,
    very_fit: 80,
  };

  const elo =
    baseElo +
    (playFrequencyWeights[answers.playFrequency] || 0) +
    (yearsExperienceWeights[answers.yearsExperience] || 0) +
    (competitiveExposureWeights[answers.competitiveExposure] || 0) +
    (selfAssessmentWeights[answers.selfAssessment] || 0) +
    (fitnessLevelWeights[answers.fitnessLevel] || 0);

  return clampElo(elo);
};

const questionnaireSteps = [
  {
    key: "playFrequency",
    title: "How often do you play badminton?",
    subtitle: "Frequency helps us understand your recent touch on court.",
    options: [
      { value: "rarely", label: "Rarely" },
      { value: "monthly", label: "About monthly" },
      { value: "weekly", label: "Weekly" },
      { value: "frequently", label: "Multiple times a week" },
    ],
  },
  {
    key: "yearsExperience",
    title: "How long have you been playing?",
    subtitle: "Time spent playing shapes your instincts and consistency.",
    options: [
      { value: "lt_6_months", label: "Less than 6 months" },
      { value: "6_12_months", label: "6-12 months" },
      { value: "1_3_years", label: "1-3 years" },
      { value: "3_5_years", label: "3-5 years" },
      { value: "5_plus_years", label: "5+ years" },
    ],
  },
  {
    key: "competitiveExposure",
    title: "What’s your competitive exposure?",
    subtitle: "Competition level calibrates your starting position.",
    options: [
      { value: "none", label: "None" },
      { value: "casual", label: "Casual meetups" },
      { value: "social_league", label: "Social league" },
      { value: "club", label: "Club matches" },
      { value: "tournament", label: "Tournaments" },
      {
        value: "international",
        label: "International (current or former national team)",
      },
    ],
  },
  {
    key: "selfAssessment",
    title: "How would you rate your game?",
    subtitle: "Your own sense of level helps set expectations.",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "solid", label: "Solid" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    key: "playType",
    title: "What do you usually play?",
    subtitle: "We’ll keep this in mind for match suggestions.",
    options: [
      { value: "singles", label: "Singles" },
      { value: "doubles", label: "Doubles" },
      { value: "both", label: "Both" },
    ],
  },
  {
    key: "fitnessLevel",
    title: "How would you describe your fitness?",
    subtitle: "Fitness influences how fast you adapt in matches.",
    options: [
      { value: "limited", label: "Limited" },
      { value: "average", label: "Average" },
      { value: "fit", label: "Fit" },
      { value: "very_fit", label: "Very fit" },
    ],
  },
];

function SignupScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    accessToken,
    loading,
    error,
    signupMessage,
    resendMessage,
    resendError,
    resendLoading,
  } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("male");
  const [answers, setAnswers] = useState({
    playFrequency: "",
    yearsExperience: "",
    competitiveExposure: "",
    selfAssessment: "",
    playType: "",
    fitnessLevel: "",
  });
  const [calculatedSeedElo, setCalculatedSeedElo] = useState(1000);
  const [confidenceAdjustment, setConfidenceAdjustment] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const isDisabled = loading || Boolean(signupMessage);

  const totalSteps = useMemo(
    () => questionnaireSteps.length + 2,
    []
  );
  const finalStep = totalSteps;

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen") === "true";
    setHasSeenOnboarding(seen);
    if (!seen && !accessToken) {
      setShowOnboarding(true);
    }
  }, [accessToken]);

  useEffect(() => {
    const baseElo = calculateSeedElo(answers);
    setCalculatedSeedElo(clampElo(baseElo + confidenceAdjustment));
  }, [answers, confidenceAdjustment]);

  useEffect(() => {
    if (!signupMessage) return undefined;
    dispatch(resetSignupStatus());
    navigate("/login", { replace: true });
    return undefined;
  }, [dispatch, navigate, signupMessage]);

  const handleOnboardingDismiss = useCallback(() => {
    localStorage.setItem("onboarding_seen", "true");
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  }, []);

  const handleOnboardingOpen = useCallback(() => {
    if (!hasSeenOnboarding && !accessToken) {
      setShowOnboarding(true);
    }
  }, [accessToken, hasSeenOnboarding]);

  const handleCredentialsContinue = useCallback(
    (event) => {
      event.preventDefault();
      setSubmitError(null);

      if (!email || !password) {
        setSubmitError("Please enter your email and password to continue.");
        return;
      }

      if (password !== confirmPassword) {
        setSubmitError("Passwords do not match.");
        return;
      }

      handleOnboardingOpen();
      setStep(2);
    },
    [confirmPassword, email, handleOnboardingOpen, password]
  );

  const handleOptionSelect = (key, value) => {
    if (isDisabled) return;
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((prev) => Math.min(prev + 1, finalStep));
  };

  const handleSkipQuestion = () => {
    if (isDisabled) return;
    setStep((prev) => Math.min(prev + 1, finalStep));
  };

  const handleBack = () => {
    if (isDisabled) return;
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleEditAnswers = () => {
    if (isDisabled) return;
    setStep(2);
  };

  const handleConfidenceAdjustment = (value) => {
    if (isDisabled) return;
    setConfidenceAdjustment(value);
  };

  const handleSubmit = async () => {
    if (isDisabled) return;
    setSubmitError(null);

    const result = await dispatch(
      signup({
        email,
        password,
        username,
        gender,
        seedElo: calculatedSeedElo,
      })
    );

    if (signup.rejected.match(result)) {
      setSubmitError(result.payload || result.error?.message);
    }
  };

  const handleResend = async () => {
    if (isDisabled) return;
    setSubmitError(null);
    if (!email) {
      setSubmitError("Please enter your email to resend the confirmation link.");
      return;
    }
    const result = await dispatch(resendConfirmationEmail({ email }));
    if (resendConfirmationEmail.rejected.match(result)) {
      setSubmitError(result.payload || result.error?.message);
    }
  };

  const progressDots = Array.from({ length: totalSteps }, (_, index) => {
    const isActive = step === index + 1;
    const isComplete = step > index + 1;

    return (
      <Box
        key={index}
        sx={{
          height: 12,
          width: 12,
          borderRadius: "50%",
          transition: "all 0.2s ease",
          backgroundColor: isActive
            ? "primary.main"
            : isComplete
            ? "primary.light"
            : "grey.300",
          transform: isActive ? "scale(1.1)" : "scale(1)",
        }}
      />
    );
  });

  const renderQuestionStep = (question) => {
    const selectedValue = answers[question.key];

    return (
      <Stack spacing={4} sx={{ minHeight: "60vh" }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={handleBack} aria-label="Go back" disabled={isDisabled}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Step {step} of {totalSteps}
        </Typography>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {question.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {question.subtitle}
          </Typography>
        </Stack>

        <Stack spacing={2} flex={1} justifyContent="center">
          {question.options.map((option) => (
            <Button
              key={option.value}
              variant={selectedValue === option.value ? "contained" : "outlined"}
              color="primary"
              size="large"
              onClick={() => handleOptionSelect(question.key, option.value)}
              disabled={isDisabled}
              sx={{
                justifyContent: "flex-start",
                py: 2,
                px: 2.5,
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
              }}
              fullWidth
            >
              {option.label}
            </Button>
          ))}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button onClick={handleBack} disabled={isDisabled}>
            Back
          </Button>
          <Button onClick={handleSkipQuestion} disabled={isDisabled}>
            Skip
          </Button>
        </Stack>
      </Stack>
    );
  };

  const renderFinalStep = () => (
    <Stack spacing={4} sx={{ minHeight: "60vh" }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton onClick={handleBack} aria-label="Go back" disabled={isDisabled}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          Final step
        </Typography>
      </Stack>

      <Stack spacing={1} textAlign="center">
        <Typography variant="h4" fontWeight={800}>
          Your estimated starting Elo
        </Typography>
        <Typography
          variant="h2"
          component="div"
          fontWeight={900}
          color="primary"
        >
          {calculatedSeedElo}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a starting estimate and will adjust quickly as you play.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1} justifyContent="center">
        {[{ label: "Slightly lower", value: -50 }, { label: "About right", value: 0 }, { label: "Slightly higher", value: 50 }].map(
          (option) => (
            <Button
              key={option.value}
              variant={confidenceAdjustment === option.value ? "contained" : "outlined"}
              onClick={() => handleConfidenceAdjustment(option.value)}
              disabled={isDisabled}
              sx={{ textTransform: "none" }}
            >
              {option.label}
            </Button>
          )
        )}
      </Stack>

      {(submitError || error) && (
        <Alert severity="error">{submitError || error}</Alert>
      )}

      {signupMessage && (
        <Stack spacing={1}>
          <Alert severity="success">{signupMessage}</Alert>
          <Button
            variant="outlined"
            size="small"
            onClick={handleResend}
            disabled={resendLoading || !email || isDisabled}
            startIcon={
              resendLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            Resend confirmation email
          </Button>
          {resendMessage && <Alert severity="info">{resendMessage}</Alert>}
          {resendError && <Alert severity="error">{resendError}</Alert>}
        </Stack>
      )}

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="outlined" size="large" onClick={handleEditAnswers}>
          Edit Answers
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isDisabled}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Signing up..." : "Create Account"}
        </Button>
      </Stack>
    </Stack>
  );

  const renderCredentialsStep = () => (
    <Stack spacing={3} component="form" onSubmit={handleCredentialsContinue}>
      <Box display="flex" justifyContent="center">
        <Box component="img" src={logo} alt="App logo" sx={{ height: 96, mb: 1 }} />
      </Box>

      <Stack spacing={1} textAlign="center">
        <Typography variant="h4" fontWeight={700}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign up to start competing on the Courtside leaderboard.
        </Typography>
      </Stack>

      {(submitError || error) && (
        <Alert severity="error">{submitError || error}</Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        disabled={isDisabled}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        disabled={isDisabled}
      />

      <TextField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        fullWidth
        error={Boolean(confirmPassword && password !== confirmPassword)}
        helperText={
          confirmPassword && password !== confirmPassword
            ? "Passwords do not match"
            : ""
        }
        disabled={isDisabled}
      />

      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        fullWidth
        disabled={isDisabled}
      />

      <TextField
        select
        label="Gender"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        fullWidth
        disabled={isDisabled}
      >
        <MenuItem value="male">Male</MenuItem>
        <MenuItem value="female">Female</MenuItem>
      </TextField>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isDisabled}
        startIcon={
          loading ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        Continue
      </Button>
    </Stack>
  );

  let content;

  if (step === 1) {
    content = renderCredentialsStep();
  } else if (step === finalStep) {
    content = renderFinalStep();
  } else {
    const question = questionnaireSteps[step - 2];
    content = renderQuestionStep(question);
  }

  return (
    <>
      {!hasSeenOnboarding && !accessToken && (
        <OnboardingModal
          open={showOnboarding}
          onDismiss={handleOnboardingDismiss}
        />
      )}

      <Container
        maxWidth="sm"
        sx={{ display: "flex", alignItems: "center", minHeight: "100vh", py: 6 }}
      >
        <Card sx={{ width: "100%" }} variant="outlined">
          <CardContent>
            <Stack spacing={3} sx={{ minHeight: "75vh" }}>
              <Stack direction="row" justifyContent="center" spacing={1}>
                {progressDots}
              </Stack>

              {content}

              <Typography variant="body2" textAlign="center">
                Already have an account?{" "}
                <Button component={RouterLink} to="/login" size="small">
                  Log in
                </Button>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

export default SignupScreen;
