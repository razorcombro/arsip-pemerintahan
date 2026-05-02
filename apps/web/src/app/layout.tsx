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
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          margin: 0,
          background: "#f5f7fb"
        }}
      >
        {children}
      </body>
    </html>
  );
}
