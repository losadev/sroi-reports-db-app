import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userProp = user?.email ? { email: user.email } : null;

  return <NavbarClient user={userProp} />;
}
