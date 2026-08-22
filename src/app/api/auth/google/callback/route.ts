import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const mockEmail = searchParams.get("mockEmail");
  const mockName = searchParams.get("mockName");

  if (error) {
    return NextResponse.redirect(new URL("/?error=" + encodeURIComponent(error), request.url));
  }

  let userInfo = null;

  if (code) {
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

      if (!clientId || !clientSecret) {
        throw new Error("Missing Google OAuth credentials in env");
      }

      // Exchange code for token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || "Failed to get access token");
      }

      // Get user profile
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      userInfo = await userRes.json();
    } catch (e: any) {
      console.error("OAuth error:", e);
      return NextResponse.redirect(new URL("/?error=" + encodeURIComponent(e.message), request.url));
    }
  }

  if (!userInfo || !userInfo.email) {
    return NextResponse.redirect(new URL("/?error=no_user_info", request.url));
  }

  // Auto-register or check VIP status by internally calling our VIP POST route logic
  try {
    // Note: in a real app you'd extract the logic from POST /api/auth/vip/route.ts to a shared service.
    // For simplicity, we just fetch it via absolute URL
    const absoluteUrl = new URL("/api/auth/vip", request.url).toString();
    const vipRes = await fetch(absoluteUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userInfo.email,
        googleName: userInfo.name || userInfo.given_name,
        googleAvatar: userInfo.picture,
      }),
    });
    
    const vipData = await vipRes.json();

    if (vipData.success && vipData.user) {
      // Set an HttpOnly cookie (or regular cookie for client to read)
      // We will redirect to a success page that passes this data to localStorage so our client app continues working smoothly without rewrite.
      
      const successUrl = new URL("/auth/success", request.url);
      successUrl.searchParams.set("user", JSON.stringify(vipData.user));
      return NextResponse.redirect(successUrl);
    }
  } catch (e) {
    console.error("Error linking VIP status:", e);
  }

  return NextResponse.redirect(new URL("/?error=vip_link_failed", request.url));
}
