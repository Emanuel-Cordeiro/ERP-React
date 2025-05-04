import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/',
  timeout: 5000,
});

api.interceptors.response.use(
  (response) => {
    if (response.status !== 200 && response.status !== 201) {
      console.error(`Unexpected status: ${response.status}`, response);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `HTTP error: ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('No response received', error.request);
    } else {
      console.error('Axios config error', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
