import API from '../../services/api'; 

const getCurrentUserId = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { return JSON.parse(userStr).id || JSON.parse(userStr)._id; } catch (e) { return null; }
};


export const fetchMyOrgs = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  const res = await API.get(`/orgs/my-orgs/${userId}`);
  return res.data;
};

export const createOrganization = async (data) => {
  const userId = getCurrentUserId();
  const res = await API.post('/orgs/create', { ...data, userId });
  return res.data;
};

export const joinOrganization = async (joinCode) => {
  const userId = getCurrentUserId();
  const res = await API.post('/orgs/join', { joinCode, userId });
  return res.data;
};


export const fetchOrgDetails = async (orgId) => {
  try {
    const res = await API.get(`/orgs/${orgId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch org details:", error);
    throw error;
  }
};

export const fetchOrgMembers = async (orgId) => {
  try {
    const res = await API.get(`/orgs/${orgId}/members`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return [];
  }
};

export const fetchOrgEvents = async (orgId) => {
  if (!orgId) return [];
  const res = await API.get(`/orgs/${orgId}/events`);
  return res.data;
};

export const createOrgEvent = async (orgId, eventData) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not found");

  const res = await API.post(`/orgs/${orgId}/events`, { 
    ...eventData, 
    userId 
  });
  return res.data;
};

export const fetchSoloEvents = async () => {
  const userId = getCurrentUserId();
  if(!userId) return [];
  // Matches: router.get('/events/solo/:userId')
  const res = await API.get(`/orgs/events/solo/${userId}`);
  return res.data;
};

export const createEvent = async (eventData, orgId = null) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("User not found");

  const payload = { ...eventData, userId };

  if (orgId) {
    // 1. ORGANIZATION EVENT
    // Sends to: /api/orgs/12345/events
    const res = await API.post(`/orgs/${orgId}/events`, payload);
    return res.data;
  } else {
    // 2. SOLO EVENT
    // Sends to: /api/orgs/events/solo/create
    // This prevents the "/null/" URL error
    const res = await API.post(`/orgs/events/solo/create`, payload);
    return res.data;
  }
};

export const updateEvent = async (eventId, formData) => {
  const res = await API.put(`/events/update/${eventId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};


export const getEventParticipants = async (eventId) => {
  try {
    const res = await API.get(`/orgs/events/${eventId}/participants`);
    return res.data;
  } catch (error) {
    console.error("Error fetching console participants:", error);
    throw error;
  }
};

/**
 * Marks attendance (Present/Absent) for a student in a specific round
 * Path: PUT /api/orgs/events/:eventId/attendance
 */
export const markAttendance = async (eventId, studentId, roundNumber, status) => {
  try {
    const res = await API.put(`/orgs/events/${eventId}/attendance`, {
      studentId,
      roundNumber,
      status // true or false
    });
    return res.data;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

/**
 * Promotes a student to the next round
 * Path: PUT /api/orgs/events/:eventId/qualify
 */
export const qualifyStudent = async (eventId, studentId, nextRoundNumber) => {
  try {
    const res = await API.put(`/orgs/events/${eventId}/qualify`, {
      studentId,
      nextRoundNumber
    });
    return res.data;
  } catch (error) {
    console.error("Error qualifying student:", error);
    throw error;
  }
};

/**
 * Updates the status of a round (LIVE, COMPLETED, etc.)
 * Path: PUT /api/orgs/events/:eventId/rounds/:roundNumber/status
 */
export const updateRoundStatus = async (eventId, roundNumber, status) => {
  try {
    const res = await API.put(`/orgs/events/${eventId}/rounds/${roundNumber}/status`, {
      status
    });
    return res.data;
  } catch (error) {
    console.error("Error updating round status:", error);
    throw error;
  }
};