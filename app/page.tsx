import { redirect } from "next/navigation";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function Home() {

  const cookieStore = cookies();

  const supabase = createServerComponentClient({
    cookies: () => cookieStore,
  });

  const {
    data: {session},
  } = await supabase.auth.getSession();

  // if(session){
  //   console.log("Session exists, redirecting to dashboard");
  //   redirect("/dashboard");
  // } else {
  //   console.log("No session found, redirecting to login");
  //   redirect("/auth/login");
  // }
}
