import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({
    req,
    res,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

//   console.log("Middleware Session:", session);

//   console.log("Cookies in request:", req.cookies.getAll());

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/"],
};
