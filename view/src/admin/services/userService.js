import API from './api';


export const fetchUserProfile = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};


export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const fetchAllStudents = async () => {
  const response = await API.get('/student');
  return response.data;
};

export const toggleStudentVerify = async (id) => {
  const response = await API.patch(`/student/${id}/verify`);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await API.delete(`/student/${id}`);
  return response.data;
};