export const ROUTES = {
  AUTH: {
    BASE: '/auth',
    SIGNUP: '/signup',
    LOGIN: '/login',
    SEND_FORGOT_PASSWORD_OTP: '/forgot-password',
    VERIFY_FORGOT_PASSWORD_OTP: '/forgot-password/verify-otp',
    RESET_PASSWORD: '/reset-password',
    LOGOUT: '/logout',
  },
  QUIZ: {
    BASE: '/quizzes',
    BY_ID: '/:id',
  },
  DIPLOMA: {
    BASE: '/diplomas',
  },
  PROFILE:{
    BASE: '/profile',
    GETPROFILE: '/get-profile',
    UPDATEPROFILE: '/update-profile/',
    GETPROFILEBYID: '/get-profile/:id',
  }
};
