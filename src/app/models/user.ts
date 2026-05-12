export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  gender: string;
  password: string;
  confirmPassword: string;
  role?: string;
}
