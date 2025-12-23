import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-sans antialiased flex`} style={{
      height: "100vh"
    }}>
      <div className="w-[36.8%] min-w-[280px] bg-white p-6 flex flex-col h-[90%]">
        <div className="flex items-center gap-4 p-10"
        style={{
          padding:"40px",
        }}
        >
          <img
            src="/logo.png"
            alt="Smart Parking Logo"
            className="
              h-[7vw]
              sm:h-[56px]
              md:h-[64px]
              w-auto
            "
          />

          <div className="flex flex-col leading-none p-5">
            <span
              className="
                font-bold text-black
                text-[3vw]
                sm:text-[26px]
                md:text-[30px]
                lg:text-[34px]
                m-0
              "
            >
              Smart Parking
            </span>

            <span
              className="
                font-semibold
                text-[#D08B4E]
                text-[2vw]
                sm:text-[20px]
                md:text-[22px]
                lg:text-[24px]
                -mt-1
              "
            >
              UCE
            </span>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src="/init.png"
            alt="Init Illustration"
            className="w-[100%] h-[90%]"
            style={{
              marginTop: "40px",
            }}
          />
        </div>
      </div>
      <div className="w-[63.2%] bg-[#FFF8F5] flex items-center justify-center">
        {children}
      </div>

    </div>
  );
}