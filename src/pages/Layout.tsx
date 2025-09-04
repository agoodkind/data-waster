import "@styles/main.css";
import { CookiesProvider } from "react-cookie";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
