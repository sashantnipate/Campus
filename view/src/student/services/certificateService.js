import API from '../../services/api'; 

export const verifyCertificate = async (code) => {
  const response = await API.get(`/certificates/verify/${code}`);
  return response.data;
};