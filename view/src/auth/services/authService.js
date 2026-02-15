import API from './api';


export const sendOtp = async (email) => {
 const response =  await API.post('/auth/send-otp', { email });
  return response;
};

export const verifyOtp = async (email, otp) => {
  return await API.post('/auth/verify-otp', { email, otp });
};


export const registerStudent = async (studentData) => {
  return await API.post('/auth/register', studentData);
};

export const loginStudent = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    if (response.data.role) { 
        localStorage.setItem('role', response.data.role.toLowerCase());
    }
  }
  
  return response.data; 
};

export const loginAdmin = async (credentials) => {
  const response = await API.post('/auth/login-admin', credentials);

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    if (response.data.role) {
      localStorage.setItem('role', response.data.role.toLowerCase());
    }
  }

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const sendForgotPasswordOtp = async (email) => {
  return await API.post("auth/forgot-password", { email });
};

export const resetPassword = async (email, newPassword) => {
  return await API.post("auth/reset-password", { email, newPassword });
};

export const verifyForgetPasswordOtp = async (email, otp) => {
  return await API.post("auth/reset-password-otp", { email, otp });
};

export const googleLoginApi = async (userData) => {
  const response = await API.post('/auth/google', userData);
  return response.data;
};
