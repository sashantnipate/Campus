import API from '../../services/api'; 

export const getCurrentUserId = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try { 
    const user = JSON.parse(userStr);
    return user.id || user._id; 
  } catch (e) { 
    return null; 
  }
};

export const fetchStudentEvents = async () => {
  try {
    // This calls GET http://localhost:4001/api/student/events
    const response = await API.get('/student/events');
    return response.data;
  } catch (error) {
    console.error("Error in fetchStudentEvents service:", error);
    throw error;
  }
};

export const fetchEventDetails = async (eventId) => {
  try {
    const response = await API.get(`/student/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for event ${eventId}:`, error);
    throw error;
  }
};

export const registerForEvent = async (eventId, userId) => {
  try {
    const res = await API.post(`/student/events/${eventId}/register`, { userId });
    return res.data;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error.response?.data?.message || "Registration failed";
  }
};


export const fetchMyRegistrations = async () => {
  const userId = getCurrentUserId();
  if (!userId) return [];
  try {
    // Backend endpoint: GET /api/student/registrations/:userId
    const res = await API.get(`/student/registrations/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }
};