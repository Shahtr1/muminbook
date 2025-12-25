const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
};

export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const PORT = getEnv('PORT', '4004');
export const RENDER_BACKEND_URL = getEnv('RENDER_BACKEND_URL', '');
export const MONGO_URI = getEnv('MONGO_URI');
export const APP_ORIGIN = getEnv('APP_ORIGIN');
export const JWT_SECRET = getEnv('JWT_SECRET');
export const JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
export const EMAIL_SENDER = getEnv('EMAIL_SENDER');
export const RESEND_API_KEY = getEnv('RESEND_API_KEY');
export const ADMIN_FIRSTNAME = getEnv('ADMIN_FIRSTNAME');
export const ADMIN_LASTNAME = getEnv('ADMIN_LASTNAME');
export const ADMIN_DATE_OF_BIRTH = getEnv('ADMIN_DATE_OF_BIRTH');
export const ADMIN_GENDER = getEnv('ADMIN_GENDER');
export const ADMIN_EMAIL = getEnv('ADMIN_EMAIL');
export const ADMIN_PASSWORD = getEnv('ADMIN_PASSWORD');
