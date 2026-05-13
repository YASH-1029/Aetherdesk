const BASE_URL = 'https://aetherdesk.onrender.com'; 

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type LoginData = {
  email: string;
  password: string;
};

export const registerUser = async (data: RegisterData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUser = async (data: LoginData) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export async function fetchTickets(token: string) {
  const res = await fetch(`${BASE_URL}/tickets`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}