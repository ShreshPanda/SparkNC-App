export type AppUser = {
  id: string;
  email: string;
  displayName?: string;
  role: 'student' | 'ambassador' | 'lab-leader' | 'admin' | 'board';
};

export type ScreenProps = {
  navigation?: {
    navigate: (route: string) => void;
  };
};
