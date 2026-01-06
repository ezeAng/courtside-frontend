export const mockSessions = [
  {
    session_id: "sess-001",
    title: "Evening Doubles Run",
    date: "2025-03-05",
    time: "18:30",
    location: {
      venue_name: "OCBC Arena",
      hall: "Hall B",
      court_number: "3",
    },
    format: "doubles",
    capacity: 4,
    joined_count: 3,
    skill_range: {
      min_elo: 900,
      max_elo: 1100,
    },
    host: {
      username: "jane_doe",
      elo: 1040,
      auth_id: "host-1",
    },
    participants: [
      { username: "jane_doe", elo: 1040, auth_id: "host-1" },
      { username: "smashbro", elo: 980, auth_id: "player-2" },
      { username: "netmaster", elo: 1020, auth_id: "player-3" },
    ],
  },
  {
    session_id: "sess-002",
    title: "Morning Singles Rally",
    date: "2025-03-04",
    time: "07:45",
    location: {
      venue_name: "ActiveSG Bedok",
      hall: "Hall A",
      court_number: "5",
    },
    format: "singles",
    capacity: 2,
    joined_count: 2,
    skill_range: {
      min_elo: 750,
      max_elo: 950,
    },
    host: {
      username: "ray_smash",
      elo: 880,
      auth_id: "host-2",
    },
    participants: [
      { username: "ray_smash", elo: 880, auth_id: "host-2" },
      { username: "driveby", elo: 910, auth_id: "player-4" },
    ],
  },
  {
    session_id: "sess-003",
    title: "Weekend Social Doubles",
    date: "2025-03-08",
    time: "15:00",
    location: {
      venue_name: "HeartBeat @ Bedok",
      hall: "Hall C",
      court_number: "2",
    },
    format: "doubles",
    capacity: 6,
    joined_count: 4,
    skill_range: {
      min_elo: 600,
      max_elo: 850,
    },
    host: {
      username: "coach_l",
      elo: 820,
      auth_id: "host-3",
    },
    participants: [
      { username: "coach_l", elo: 820, auth_id: "host-3" },
      { username: "spinqueen", elo: 780, auth_id: "player-5" },
      { username: "featherlite", elo: 640, auth_id: "player-6" },
      { username: "tony", elo: 720, auth_id: "player-7" },
    ],
  },
  {
    session_id: "sess-004",
    title: "Post-Work Singles",
    date: "2025-03-03",
    time: "19:00",
    location: {
      venue_name: "Jurong East Sports Hall",
      hall: "Hall 1",
      court_number: "7",
    },
    format: "singles",
    capacity: 2,
    joined_count: 1,
    skill_range: {
      min_elo: 950,
      max_elo: 1200,
    },
    host: {
      username: "liftanddrop",
      elo: 1120,
      auth_id: "host-4",
    },
    participants: [
      { username: "liftanddrop", elo: 1120, auth_id: "host-4" },
    ],
  },
];
