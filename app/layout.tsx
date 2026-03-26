import Providers from "./components/Providers";
import Navbar from "./components/Navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <div style={{ paddingTop: "4rem", minHeight: "100vh" }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
