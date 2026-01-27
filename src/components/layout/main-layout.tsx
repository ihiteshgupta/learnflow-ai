import { Header } from './header';
import { Sidebar } from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  xp: number;
  streak: number;
}

export function MainLayout({ children, user, xp, streak }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} xp={xp} streak={streak} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
