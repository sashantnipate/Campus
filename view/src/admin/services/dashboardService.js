import API from './api';

export const fetchDashboardStats = async () => {
  const response = await API.get('/dashboard/stats');
  return response.data;
};

export const fetchDashboardEvents = async () => {
  const response = await API.get('/dashboard/events');
  return response.data;
};

export const updateEventStatus = async (eventId, status) => {
  const response = await API.put(`/dashboard/event-status/${eventId}`, { status });
  return response.data;
};