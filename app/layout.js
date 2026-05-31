import "./globals.css";

export const metadata = {
  title: "ReleaseCheck",
  description: "Your all-in-one release checklist tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <h1 className="brand">ReleaseCheck</h1>
          <p className="tagline">Your all-in-one release checklist tool</p>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
