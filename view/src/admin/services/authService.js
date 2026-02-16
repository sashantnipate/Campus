export const logout = () => {
  // 1. Remove the user and token from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  // 2. Redirect to the login page
  window.location.href = '#/login'; 
};