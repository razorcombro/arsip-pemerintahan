import "./globals.css";

export const metadata = {
  title: "Arsip Pemerintahan Admin",
  description: "Panel Admin Sistem Arsip Pemerintahan"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
