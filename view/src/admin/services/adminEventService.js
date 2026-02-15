import API from './api';

export const fetchAdminEvents = async () => {
  const response = await API.get('/events/list');
  return response.data;
};

export const createAdminEvent = async (eventData) => {
  const response = await API.post('/events/create', eventData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateAdminEvent = async (eventId, eventData) => {
  const response = await API.put(`/events/update/${eventId}`, eventData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteAdminEvent = async (eventId) => {
  const response = await API.delete(`/events/${eventId}`);
  return response.data;
};