// Mock authentication for testing
// Replace this with real API calls to /api/auth/login when backend is ready

interface LoginRequest {
  storeId: string;
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

// Mock users database
const mockUsers = [
  {
    storeId: 'demo',
    username: 'admin',
    password: 'demo123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@demo.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
    },
    tenant: {
      id: 'demo-001',
      name: 'Demo Motors',
      slug: 'demo',
    },
  },
  {
    storeId: 'demo',
    username: 'sales',
    password: 'demo123',
    user: {
      id: '2',
      username: 'sales',
      email: 'sales@demo.com',
      role: 'salesperson',
      firstName: 'John',
      lastName: 'Salesperson',
    },
    tenant: {
      id: 'demo-001',
      name: 'Demo Motors',
      slug: 'demo',
    },
  },
  {
    storeId: 'demo',
    username: 'manager',
    password: 'demo123',
    user: {
      id: '3',
      username: 'manager',
      email: 'manager@demo.com',
      role: 'sales_manager',
      firstName: 'Jane',
      lastName: 'Manager',
    },
    tenant: {
      id: 'demo-001',
      name: 'Demo Motors',
      slug: 'demo',
    },
  },
];

export async function mockLogin(credentials: LoginRequest): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const user = mockUsers.find(
    (u) =>
      u.storeId === credentials.storeId &&
      u.username === credentials.username &&
      u.password === credentials.password
  );

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Generate a mock JWT token
  const token = btoa(JSON.stringify({ userId: user.user.id, exp: Date.now() + 86400000 }));

  return {
    token,
    user: user.user,
    tenant: user.tenant,
  };
}
