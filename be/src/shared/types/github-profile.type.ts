export type GithubProfileResponse = {
  id: string;
  username: string; // nếu có thể undefined
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
  displayName?: string;
  profileUrl?: string;
  provider?: string;
  // Thêm các trường khác nếu cần
};
