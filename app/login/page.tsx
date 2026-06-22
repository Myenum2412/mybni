import type { Metadata } from "next"
import ClientLogin from "./components/ClientLogin"

export const metadata: Metadata = {
  title: "Login",
}

export default function LoginPage() {
  return <ClientLogin />
}
