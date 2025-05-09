export const getToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token:', error);
    throw new Error('Failed to save authentication token');
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token:', error);
    throw new Error('Failed to remove authentication token');
  }
};

export const isAuthenticated = (): boolean => {
  try {
    return !!getToken();
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}; 