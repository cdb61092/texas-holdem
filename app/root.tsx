import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  LiveReload,
} from "@remix-run/react";
import { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
// @ts-expect-error vite requires the ?url to be present
import stylesheet from "./globals.css?url";
import React from "react";
import { Socket as IOSocket, connect } from "socket.io-client";
import { wsContext } from "~/ws.context";
import { Navigation } from "~/components/Navigation";
import { authenticator } from "~/.server/auth";
import clsx from "clsx";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./sessions.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  console.log(user);
  const { getTheme } = await themeSessionResolver(request);
  return {
    theme: getTheme(),
  };
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();
  const [socket, setSocket] = React.useState<IOSocket>();

  React.useEffect(() => {
    const connection = connect();
    console.log("setting socket in root.tsx");
    console.log(connection);
    setSocket(connection);
    return () => {
      connection.close();
    };
  }, []);

  return (
    <wsContext.Provider value={socket}>
      <ThemeProvider
        specifiedTheme={data.theme}
        themeAction="/action/set-theme"
      >
        <App />
      </ThemeProvider>
    </wsContext.Provider>
  );
}

export function App() {
  const data = useLoaderData<typeof loader>();
  const [theme] = useTheme();

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme)} />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        <main className="w-[1000px] mx-auto">
          <Navigation />
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
