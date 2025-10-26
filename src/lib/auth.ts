// Auth utility functions for persistent login

export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export const AUTH_KEYS = {
  USER: 'wordyfy_user',
  USER_ID: 'wordyfy_userId',
  LOGIN_TIME: 'wordyfy_loginTime',
  REMEMBER_ME: 'wordyfy_rememberMe'
};

// Store user data with optional remember me
export const setUserSession = (user: User, rememberMe: boolean = false) => {
  const loginTime = new Date().toISOString();
  
  if (rememberMe) {
    // Store in localStorage for persistent login
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(AUTH_KEYS.USER_ID, user._id);
    localStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime);
    localStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'true');
  } else {
    // Store in sessionStorage for session-only login
    sessionStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(AUTH_KEYS.USER_ID, user._id);
    sessionStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime);
    sessionStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'false');
  }
};

// Get user data from storage
export const getUserSession = (): { user: User | null; userId: string | null; rememberMe: boolean } => {
  if (typeof window === 'undefined') {
    return { user: null, userId: null, rememberMe: false };
  }

  // Check localStorage first (remember me)
  const rememberMe = localStorage.getItem(AUTH_KEYS.REMEMBER_ME) === 'true';
  
  if (rememberMe) {
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    const userId = localStorage.getItem(AUTH_KEYS.USER_ID);
    
    if (userStr && userId) {
      try {
        const user = JSON.parse(userStr);
        return { user, userId, rememberMe: true };
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearUserSession();
      }
    }
  } else {
    // Check sessionStorage (session-only)
    const userStr = sessionStorage.getItem(AUTH_KEYS.USER);
    const userId = sessionStorage.getItem(AUTH_KEYS.USER_ID);
    
    if (userStr && userId) {
      try {
        const user = JSON.parse(userStr);
        return { user, userId, rememberMe: false };
      } catch (error) {
        console.error('Error parsing user data:', error);
        clearUserSession();
      }
    }
  }

  return { user: null, userId: null, rememberMe: false };
};

// Clear user session
export const clearUserSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.USER_ID);
  localStorage.removeItem(AUTH_KEYS.LOGIN_TIME);
  localStorage.removeItem(AUTH_KEYS.REMEMBER_ME);
  
  sessionStorage.removeItem(AUTH_KEYS.USER);
  sessionStorage.removeItem(AUTH_KEYS.USER_ID);
  sessionStorage.removeItem(AUTH_KEYS.LOGIN_TIME);
  sessionStorage.removeItem(AUTH_KEYS.REMEMBER_ME);
};

// Check if user is logged in
export const isLoggedIn = (): boolean => {
  const { user, userId } = getUserSession();
  return !!(user && userId);
};

// Get user ID
export const getUserId = (): string | null => {
  const { userId } = getUserSession();
  return userId;
};

// Check if session is expired (optional - for future use)
export const isSessionExpired = (maxAgeHours: number = 24): boolean => {
  if (typeof window === 'undefined') return true;
  
  const rememberMe = localStorage.getItem(AUTH_KEYS.REMEMBER_ME) === 'true';
  const storage = rememberMe ? localStorage : sessionStorage;
  const loginTimeStr = storage.getItem(AUTH_KEYS.LOGIN_TIME);
  
  if (!loginTimeStr) return true;
  
  const loginTime = new Date(loginTimeStr);
  const now = new Date();
  const diffHours = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
  
  return diffHours > maxAgeHours;
};
