import axios from 'axios';

const RestEndpoint = 'https://91maaqr173.execute-api.ap-southeast-2.amazonaws.com/production/';

class RestClient {
  constructor() {
    this.client = axios.create({
      baseURL: RestEndpoint,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          console.error('API Error:', error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get(path, params = {}) {
    return this.client.get(path, { params });
  }

  async post(path, data = {}) {
    return this.client.post(path, data);
  }

  async put(path, data = {}) {
    return this.client.put(path, data);
  }

  async delete(path) {
    return this.client.delete(path);
  }
}

export { RestClient };
