import { CartConfirmation } from "./cart-confirmation";

export default function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}<CartConfirmation /></>;
}
