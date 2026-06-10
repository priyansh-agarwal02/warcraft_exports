import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ACCESS_DENIED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied — Warcraft Exports</title>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #121214;
      --bg-card: #1c1c1f;
      --border-color: rgba(212, 163, 89, 0.2);
      --text-gold: #d4a359;
      --text-light: #f4f4f4;
      --text-muted: #a0a0a5;
    }
    body {
      background-color: var(--bg-dark);
      color: var(--text-light);
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .container {
      max-width: 500px;
      width: 100%;
      padding: 24px;
    }
    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #d4a359, #8c6221, #d4a359);
    }
    .icon {
      color: #e74c3c;
      margin-bottom: 24px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    h1 {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      color: var(--text-gold);
      margin: 0 0 16px 0;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    p {
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 32px 0;
    }
    .divider {
      height: 1px;
      background-color: rgba(255, 255, 255, 0.08);
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background-color: #33450d;
      color: white;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 12px 28px;
      border-radius: 2px;
      transition: background-color 0.2s, transform 0.1s;
      border: 1px solid #4a6316;
    }
    .btn:hover {
      background-color: #435b11;
      transform: translateY(-1px);
    }
    .btn:active {
      transform: translateY(0);
    }
    .links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 24px;
    }
    .link {
      color: var(--text-muted);
      font-size: 12px;
      text-decoration: none;
      transition: color 0.2s;
    }
    .link:hover {
      color: var(--text-gold);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1>Access Restricted</h1>
      <p>This section is reserved for administrators only. Your account is not authorized to access this panel.</p>
      
      <a href="/" class="btn">Return to Store</a>
      
      <div class="divider"></div>
      
      <div class="links">
        <a href="/auth/login" class="link">Sign in as Administrator</a>
        <a href="/auth/signout" class="link">Log Out</a>
      </div>
    </div>
  </div>
</body>
</html>`;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("[MIDDLEWARE] getUser error:", err);
  }

  // Protect /account routes
  if (request.nextUrl.pathname.startsWith("/account") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Protect /admin routes — require admin role
  if (request.nextUrl.pathname.startsWith("/admin")) {
    console.log("[MIDDLEWARE] Checking admin path:", request.nextUrl.pathname);
    console.log("[MIDDLEWARE] User:", user ? user.email : "none");
    if (!user) {
      console.log("[MIDDLEWARE] No user, redirecting to /login");
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    
    let profile = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      profile = data;
      console.log("[MIDDLEWARE] Profile query result:", profile, "Error: none");
    } catch (err: any) {
      console.error("[MIDDLEWARE] Profile query error:", err?.message || err);
    }

    if (profile?.role !== "admin") {
      console.log("[MIDDLEWARE] Access Denied: role is", profile?.role);
      return new NextResponse(ACCESS_DENIED_HTML, {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
    }

    console.log("[MIDDLEWARE] Access Granted");
    // Block search engines from indexing admin
    supabaseResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Security headers for all responses
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("X-Frame-Options", "SAMEORIGIN");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  supabaseResponse.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/uploadthing).*)",
  ],
};
