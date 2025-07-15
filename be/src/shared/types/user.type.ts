export type JwtUser = {
  id: string;
  username: string;
  role: 'ADMIN' | 'COMMENTER';
};
