import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import relationshipApi from "@/services/relationshipApi";

export const getFriends = createAsyncThunk(
  "relationship/getFriends",
  async (_, thunkAPI) => {
    try {
      const response = await relationshipApi.getFriends();

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getSentRequests = createAsyncThunk(
  "relationship/getSentRequests",
  async (_, thunkAPI) => {
    try {
      const response = await relationshipApi.getSentRequests();

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getReceivedRequests = createAsyncThunk(
  "relationship/getReceivedRequests",
  async (_, thunkAPI) => {
    try {
      const response = await relationshipApi.getReceivedRequests();

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const createFriendRequest = createAsyncThunk(
  "relationship/createFriendRequest",
  async (recipientId, thunkAPI) => {
    try {
      const response = await relationshipApi.createFriendRequest(recipientId);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "relationship/acceptFriendRequest",
  async (relationshipId, thunkAPI) => {
    try {
      const response = await relationshipApi.acceptFriendRequest(relationshipId);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  "relationship/rejectFriendRequest",
  async (relationshipId, thunkAPI) => {
    try {
      await relationshipApi.rejectFriendRequest(relationshipId);

      return relationshipId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const cancelFriendRequest = createAsyncThunk(
  "relationship/cancelFriendRequest",
  async (relationshipId, thunkAPI) => {
    try {
      await relationshipApi.cancelFriendRequest(relationshipId);

      return relationshipId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const unfriend = createAsyncThunk(
  "relationship/unfriend",
  async (relationshipId, thunkAPI) => {
    try {
      await relationshipApi.unfriend(relationshipId);

      return relationshipId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const initialState = {
  friends: [],
  sentRequests: [],
  receivedRequests: [],

  loading: false,
  error: null,
};

const relationshipSlice = createSlice({
  name: "relationship",
  initialState,
  reducers: {
    friendRequestReceivedRealtime(state, action) {
      state.receivedRequests.unshift(action.payload);
    },

    friendRequestAcceptedRealtime(state, action) {
      state.sentRequests = state.sentRequests.filter(
        (item) => item.relationshipId !== action.payload.relationshipId
      );

      state.friends.unshift(action.payload);
    },

    friendRequestRejectedRealtime(state, action) {
      const { relationshipId } = action.payload;

      state.sentRequests = state.sentRequests.filter(
        (item) => item.relationshipId !== relationshipId
      );
    },

    friendRequestCancelledRealtime(state, action) {
      const { relationshipId } = action.payload;

      state.receivedRequests = state.receivedRequests.filter(
        (item) => item.relationshipId !== relationshipId
      );
    },

    friendRemovedRealtime(state, action) {
      const { relationshipId } = action.payload;

      state.friends = state.friends.filter(
        (friend) => friend.relationshipId !== relationshipId
      );
    },
  },

  extraReducers: (builder) => {
    builder

      // Get Friends
      .addCase(getFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })

      // Sent Requests
      .addCase(getSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
      })

      // Received Requests
      .addCase(getReceivedRequests.fulfilled, (state, action) => {
        state.receivedRequests = action.payload;
      })

      // Create Request
      .addCase(createFriendRequest.fulfilled, (state, action) => {
        state.sentRequests.unshift(action.payload);
      })

      // Accept Request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.receivedRequests = state.receivedRequests.filter(
          (item) => item.relationshipId !== action.payload.relationshipId
        );

        state.friends.unshift(action.payload);
      })

      // Reject Request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.receivedRequests = state.receivedRequests.filter(
          (item) => item.relationshipId !== action.payload
        );
      })

      // Cancel Request
      .addCase(cancelFriendRequest.fulfilled, (state, action) => {
        state.sentRequests = state.sentRequests.filter(
          (item) => item.relationshipId !== action.payload
        );
      })

      // remove friend
      .addCase(unfriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(
          (friend) => friend.relationshipId !== action.payload
        );
      })

      .addMatcher(
        (action) =>
          action.type.startsWith("relationship/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const {
  friendRequestReceivedRealtime,
  friendRequestAcceptedRealtime,
  friendRequestRejectedRealtime,
  friendRequestCancelledRealtime,
  friendRemovedRealtime,
} = relationshipSlice.actions;
export default relationshipSlice.reducer;
