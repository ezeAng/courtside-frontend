import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  acceptConnectionRequest,
  cancelConnectionRequest,
  fetchConnections,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  fetchRecommendedPlayers,
  fetchUserContact,
  searchUsers,
  sendConnectionRequest,
} from "../../services/api";

const initialState = {
  search: {
    query: "",
    results: [],
    loading: false,
    error: null,
  },
  recommended: {
    filters: {
      gender: "any",
      mode: "singles",
      region: "",
    },
    results: [],
    loading: false,
    error: null,
  },
  requests: {
    incoming: [],
    outgoing: [],
    loading: false,
    error: null,
  },
  connections: {
    items: [],
    loading: false,
    error: null,
  },
  statusMap: {},
  actionLoading: {},
  contact: {},
};

const getId = (player) => player?.auth_id || player?.id || player?.user_id;

const refreshStatusMap = (state) => {
  const map = {};

  state.connections.items.forEach((player) => {
    const id = getId(player);
    if (id) map[id] = "connected";
  });

  state.requests.incoming.forEach((player) => {
    const id = getId(player);
    if (id) map[id] = "incoming_request";
  });

  state.requests.outgoing.forEach((player) => {
    const id = getId(player);
    if (id) map[id] = "outgoing_request";
  });

  state.statusMap = map;
};

const setActionLoading = (state, authId, value) => {
  if (!authId) return;
  state.actionLoading = {
    ...state.actionLoading,
    [authId]: value,
  };
};

export const searchUsersThunk = createAsyncThunk(
  "connections/searchUsers",
  async (query, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const results = await searchUsers(query, token);
      return { query, results };
    } catch (error) {
      return rejectWithValue(error.message || "Search failed");
    }
  }
);

export const fetchRecommendedPlayersThunk = createAsyncThunk(
  "connections/fetchRecommendedPlayers",
  async (filters, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const results = await fetchRecommendedPlayers(filters, token);
      return { filters, results };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch recommendations");
    }
  }
);

export const fetchIncomingRequestsThunk = createAsyncThunk(
  "connections/fetchIncomingRequests",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const results = await fetchIncomingRequests(token);
      return Array.isArray(results?.requests) ? results.requests : results;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load incoming requests");
    }
  }
);

export const fetchOutgoingRequestsThunk = createAsyncThunk(
  "connections/fetchOutgoingRequests",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const results = await fetchOutgoingRequests(token);
      return Array.isArray(results?.requests) ? results.requests : results;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load outgoing requests");
    }
  }
);

export const fetchConnectionsThunk = createAsyncThunk(
  "connections/fetchConnections",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const results = await fetchConnections(token);
      return Array.isArray(results?.connections) ? results.connections : results;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load connections");
    }
  }
);

export const sendConnectionRequestThunk = createAsyncThunk(
  "connections/sendConnectionRequest",
  async (authId, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const response = await sendConnectionRequest(authId, token);
      await Promise.all([
        dispatch(fetchOutgoingRequestsThunk()),
        dispatch(fetchConnectionsThunk()),
      ]);
      return { authId, response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to send request");
    }
  }
);

export const cancelConnectionRequestThunk = createAsyncThunk(
  "connections/cancelConnectionRequest",
  async (authId, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const response = await cancelConnectionRequest(authId, token);
      await dispatch(fetchOutgoingRequestsThunk());
      return { authId, response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to cancel request");
    }
  }
);

export const acceptConnectionRequestThunk = createAsyncThunk(
  "connections/acceptConnectionRequest",
  async (authId, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const response = await acceptConnectionRequest(authId, token);
      await Promise.all([
        dispatch(fetchIncomingRequestsThunk()),
        dispatch(fetchConnectionsThunk()),
      ]);
      return { authId, response };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to accept request");
    }
  }
);

export const fetchContactThunk = createAsyncThunk(
  "connections/fetchContact",
  async (authId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.accessToken;
      const data = await fetchUserContact(authId, token);
      return { authId, data };
    } catch (error) {
      const status = error.status || null;
      return rejectWithValue({
        authId,
        status,
        message: error.message || "Failed to load contact",
      });
    }
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.search.results = [];
      state.search.query = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsersThunk.pending, (state, action) => {
        state.search.loading = true;
        state.search.error = null;
        state.search.query = action.meta.arg || "";
      })
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.search.loading = false;
        state.search.query = action.payload.query;
        state.search.results = action.payload.results || [];
      })
      .addCase(searchUsersThunk.rejected, (state, action) => {
        state.search.loading = false;
        state.search.error = action.payload || "Search failed";
      })
      .addCase(fetchRecommendedPlayersThunk.pending, (state, action) => {
        state.recommended.loading = true;
        state.recommended.error = null;
        if (action.meta.arg) {
          state.recommended.filters = {
            ...state.recommended.filters,
            ...action.meta.arg,
          };
        }
      })
      .addCase(fetchRecommendedPlayersThunk.fulfilled, (state, action) => {
        state.recommended.loading = false;
        state.recommended.results = action.payload.results || [];
      })
      .addCase(fetchRecommendedPlayersThunk.rejected, (state, action) => {
        state.recommended.loading = false;
        state.recommended.error = action.payload || "Failed to load recommendations";
      })
      .addCase(fetchIncomingRequestsThunk.pending, (state) => {
        state.requests.loading = true;
        state.requests.error = null;
      })
      .addCase(fetchIncomingRequestsThunk.fulfilled, (state, action) => {
        state.requests.loading = false;
        state.requests.incoming = action.payload || [];
        refreshStatusMap(state);
      })
      .addCase(fetchIncomingRequestsThunk.rejected, (state, action) => {
        state.requests.loading = false;
        state.requests.error = action.payload || "Failed to load requests";
      })
      .addCase(fetchOutgoingRequestsThunk.pending, (state) => {
        state.requests.loading = true;
        state.requests.error = null;
      })
      .addCase(fetchOutgoingRequestsThunk.fulfilled, (state, action) => {
        state.requests.loading = false;
        state.requests.outgoing = action.payload || [];
        refreshStatusMap(state);
      })
      .addCase(fetchOutgoingRequestsThunk.rejected, (state, action) => {
        state.requests.loading = false;
        state.requests.error = action.payload || "Failed to load requests";
      })
      .addCase(fetchConnectionsThunk.pending, (state) => {
        state.connections.loading = true;
        state.connections.error = null;
      })
      .addCase(fetchConnectionsThunk.fulfilled, (state, action) => {
        state.connections.loading = false;
        state.connections.items = action.payload || [];
        refreshStatusMap(state);
      })
      .addCase(fetchConnectionsThunk.rejected, (state, action) => {
        state.connections.loading = false;
        state.connections.error = action.payload || "Failed to load connections";
      })
      .addCase(sendConnectionRequestThunk.pending, (state, action) => {
        const authId = action.meta.arg;
        setActionLoading(state, authId, true);
      })
      .addCase(sendConnectionRequestThunk.fulfilled, (state, action) => {
        const authId = action.payload?.authId;
        setActionLoading(state, authId, false);
        refreshStatusMap(state);
      })
      .addCase(sendConnectionRequestThunk.rejected, (state, action) => {
        const authId = action.meta.arg;
        setActionLoading(state, authId, false);
        state.requests.error = action.payload || "Failed to send request";
      })
      .addCase(cancelConnectionRequestThunk.pending, (state, action) => {
        const authId = action.meta.arg;
        setActionLoading(state, authId, true);
      })
      .addCase(cancelConnectionRequestThunk.fulfilled, (state, action) => {
        const authId = action.payload?.authId;
        setActionLoading(state, authId, false);
        refreshStatusMap(state);
      })
      .addCase(cancelConnectionRequestThunk.rejected, (state, action) => {
        const authId = action.meta.arg;
        setActionLoading(state, authId, false);
        state.requests.error = action.payload || "Failed to cancel request";
      })
      .addCase(acceptConnectionRequestThunk.pending, (state, action) => {
        const authId = action.meta.arg;
        setActionLoading(state, authId, true);
      })
      .addCase(acceptConnectionRequestThunk.fulfilled, (state, action) => {
        const authId = action.payload?.authId;
        setActionLoading(state, authId, false);
        refreshStatusMap(state);
      })
      .addCase(acceptConnectionRequestThunk.rejected, (state, action) => {
        const authId = action.meta.arg;
        setActionLoading(state, authId, false);
        state.requests.error = action.payload || "Failed to accept request";
      })
      .addCase(fetchContactThunk.pending, (state, action) => {
        const authId = action.meta.arg;
        state.contact[authId] = {
          loading: true,
          error: null,
          data: null,
          forbidden: false,
        };
      })
      .addCase(fetchContactThunk.fulfilled, (state, action) => {
        const { authId, data } = action.payload;
        state.contact[authId] = {
          loading: false,
          error: null,
          data,
          forbidden: false,
        };
      })
      .addCase(fetchContactThunk.rejected, (state, action) => {
        const { authId, status, message } = action.payload || {};
        state.contact[authId] = {
          loading: false,
          error: message || "Unable to load contact",
          data: null,
          forbidden: status === 403,
        };
      });
  },
});

export const { clearSearchResults } = connectionsSlice.actions;

export default connectionsSlice.reducer;
