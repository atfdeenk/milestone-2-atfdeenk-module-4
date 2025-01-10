const API_URL = 'https://api.escuelajs.co/api/v1';

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (name: string, email: string, password: string, avatar: string) => {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, avatar }),
    });
    return response.json();
  },

  // Products
  getProducts: async () => {
    const response = await fetch(`${API_URL}/products`);
    return response.json();
  },

  getProduct: async (id: number) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_URL}/categories`);
    return response.json();
  },

  getProductsByCategory: async (categoryId: number) => {
    const response = await fetch(`${API_URL}/categories/${categoryId}/products`);
    return response.json();
  },
};
