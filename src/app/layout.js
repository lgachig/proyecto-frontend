import "../global.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "UCE Smart Parking",
  description: "Sistema inteligente de parqueadero Universidad Central",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}