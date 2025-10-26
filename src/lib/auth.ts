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
  REMEMBER_ME: 'wordyfy_rememberMe',
  SESSION_ID: 'wordyfy_sessionId'
};

// Generate a unique session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Store user data with optional remember me
export const setUserSession = (user: User, rememberMe: boolean = false) => {
  const loginTime = new Date().toISOString();
  const sessionId = generateSessionId();
  
  if (rememberMe) {
    // Store in localStorage for persistent login
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(AUTH_KEYS.USER_ID, user._id);
    localStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime);
    localStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'true');
    localStorage.setItem(AUTH_KEYS.SESSION_ID, sessionId);
    
    // Also store in sessionStorage as backup
    sessionStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(AUTH_KEYS.USER_ID, user._id);
    sessionStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime);
    sessionStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'true');
    sessionStorage.setItem(AUTH_KEYS.SESSION_ID, sessionId);
  } else {
    // Store in sessionStorage for session-only login
    sessionStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    sessionStorage.setItem(AUTH_KEYS.USER_ID, user._id);
    sessionStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime);
    sessionStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'false');
    sessionStorage.setItem(AUTH_KEYS.SESSION_ID, sessionId);
  }
};

// Get user data from storage
export const getUserSession = (): { user: User | null; userId: string | null; rememberMe: boolean } => {
  if (typeof window === 'undefined') {
    return { user: null, userId: null, rememberMe: false };
  }

  // First, try to get from localStorage (persistent login)
  try {
    const rememberMe = localStorage.getItem(AUTH_KEYS.REMEMBER_ME) === 'true';
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    const userId = localStorage.getItem(AUTH_KEYS.USER_ID);
    
    if (userStr && userId && rememberMe) {
      const user = JSON.parse(userStr);
      console.log('🔐 Found persistent login session');
      return { user, userId, rememberMe: true };
    }
  } catch (error) {
    console.error('Error parsing localStorage user data:', error);
  }

  // If no persistent login, try sessionStorage
  try {
    const userStr = sessionStorage.getItem(AUTH_KEYS.USER);
    const userId = sessionStorage.getItem(AUTH_KEYS.USER_ID);
    const rememberMe = sessionStorage.getItem(AUTH_KEYS.REMEMBER_ME) === 'true';
    
    if (userStr && userId) {
      const user = JSON.parse(userStr);
      console.log('🔐 Found session login');
      return { user, userId, rememberMe };
    }
  } catch (error) {
    console.error('Error parsing sessionStorage user data:', error);
  }

  console.log('🔐 No valid session found');
  return { user: null, userId: null, rememberMe: false };
};

// Clear user session
export const clearUserSession = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(AUTH_KEYS.USER);
  localStorage.removeItem(AUTH_KEYS.USER_ID);
  localStorage.removeItem(AUTH_KEYS.LOGIN_TIME);
  localStorage.removeItem(AUTH_KEYS.REMEMBER_ME);
  localStorage.removeItem(AUTH_KEYS.SESSION_ID);
  
  sessionStorage.removeItem(AUTH_KEYS.USER);
  sessionStorage.removeItem(AUTH_KEYS.USER_ID);
  sessionStorage.removeItem(AUTH_KEYS.LOGIN_TIME);
  sessionStorage.removeItem(AUTH_KEYS.REMEMBER_ME);
  sessionStorage.removeItem(AUTH_KEYS.SESSION_ID);
  
  console.log('🔐 User session cleared');
};

// Restore session from localStorage to sessionStorage (for mobile app reopening)
export const restoreSession = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    const rememberMe = localStorage.getItem(AUTH_KEYS.REMEMBER_ME) === 'true';
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    const userId = localStorage.getItem(AUTH_KEYS.USER_ID);
    const loginTime = localStorage.getItem(AUTH_KEYS.LOGIN_TIME);
    const sessionId = localStorage.getItem(AUTH_KEYS.SESSION_ID);
    
    if (userStr && userId && rememberMe) {
      // Restore to sessionStorage
      sessionStorage.setItem(AUTH_KEYS.USER, userStr);
      sessionStorage.setItem(AUTH_KEYS.USER_ID, userId);
      sessionStorage.setItem(AUTH_KEYS.LOGIN_TIME, loginTime || new Date().toISOString());
      sessionStorage.setItem(AUTH_KEYS.REMEMBER_ME, 'true');
      sessionStorage.setItem(AUTH_KEYS.SESSION_ID, sessionId || generateSessionId());
      
      console.log('🔄 Session restored from localStorage to sessionStorage');
      return true;
    }
  } catch (error) {
    console.error('Error restoring session:', error);
  }
  
  return false;
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
