import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import "@/styles/globals.css";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import {ToastContainer} from "react-toastify";
export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-grow">
          <ToastContainer />
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
