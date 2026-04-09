export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string | null;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  sub: number;
  username: string;
  roles: string[];
}

export type RoleName =
  | 'ADMIN'
  | 'DOKTER'
  | 'PERAWAT'
  | 'APOTEKER'
  | 'REGISTRASI'
  | 'KASIR'
  | 'LAB_ANALIS'
  | 'RADIOGRAFER'
  | 'MANAJEMEN'
  | 'IT';
