const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const api = {
  // Auth
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Dashboard
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
    return handleResponse(response);
  },

  // Products
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    return handleResponse(response);
  },

  async getProductById(id) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
    return handleResponse(response);
  },

  async createProduct(product) {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return handleResponse(response);
  },

  async updateProduct(id, product) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return handleResponse(response);
  },

  async deleteProduct(id) {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  },

  // Sales
  async getSales() {
    const response = await fetch(`${API_BASE_URL}/api/sales`);
    return handleResponse(response);
  },

  async getSaleById(id) {
    const response = await fetch(`${API_BASE_URL}/api/sales/${id}`);
    return handleResponse(response);
  },

  async createSale(saleData) {
    const response = await fetch(`${API_BASE_URL}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    return handleResponse(response);
  }
};

export default api;