import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'Ai Support Platform',
  description: 'Support platform with AI assistance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
