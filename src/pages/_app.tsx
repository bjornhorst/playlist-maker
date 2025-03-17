import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import type { Session } from "next-auth";
import "@/styles/globals.css";

export default function App({
                                Component,
                                pageProps,
                            }: AppProps<{ session: Session }>) {
    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}
