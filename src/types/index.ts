export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category | string;
  images: string[];
  creationAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  creationAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  avatar: string;
}
