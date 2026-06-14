import instance from "@/lib/axios";

const BASE_URL = "/relationships";

const relationshipApi = {
  createFriendRequest: (recipientId) => {
    return instance.post(`${BASE_URL}/request`, {
      recipientId,
    });
  },

  cancelFriendRequest: (relationshipId) => {
    return instance.delete(`${BASE_URL}/${relationshipId}/cancel`);
  },

  acceptFriendRequest: (relationshipId) => {
    return instance.patch(`${BASE_URL}/${relationshipId}/accept`);
  },

  rejectFriendRequest: (relationshipId) => {
    return instance.delete(`${BASE_URL}/${relationshipId}/reject`);
  },

  unfriend: (relationshipId) => {
    return instance.delete(`${BASE_URL}/${relationshipId}/unfriend`);
  },

  blockUser: (relationshipId) => {
    return instance.patch(`${BASE_URL}/${relationshipId}/block`);
  },

  unblockUser: (relationshipId) => {
    return instance.delete(`${BASE_URL}/${relationshipId}/unblock`);
  },

  getSentRequests: () => {
    return instance.get(`${BASE_URL}/requests/sent`);
  },

  getReceivedRequests: () => {
    return instance.get(`${BASE_URL}/requests/received`);
  },

  getFriends: () => {
    return instance.get(`${BASE_URL}/friends`);
  },
};

export default relationshipApi;
