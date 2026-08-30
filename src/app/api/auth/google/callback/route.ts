import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

  // Auto-register or check VIP status by internally calling our DB logic
  try {
    const cleanEmail = userInfo.email.toLowerCase().trim();
    const googleName = userInfo.name || userInfo.given_name;
    const googleAvatar = userInfo.picture;

    // Check if email already exists
    const { data: existingUser } = await supabase.from('vip_users').select('*').eq('email', cleanEmail).maybeSingle();

    let finalUser = null;

    if (existingUser) {
      // Update with latest Google info
      const { data: updated, error } = await supabase.from('vip_users')
        .update({
          google_name: googleName || existingUser.google_name,
          google_avatar: googleAvatar || existingUser.google_avatar,
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (error) throw error;
      finalUser = updated;
    } else {
      // Create new pending user
      const { data: newUser, error } = await supabase.from('vip_users')
        .insert({
          email: cleanEmail,
          google_name: googleName || cleanEmail.split("@")[0],
          google_avatar: googleAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
          claimed_guest_name: "Khách mời",
          status: "pending",
          role: "user"
        })
        .select()
        .single();
      
      if (error) throw error;
      finalUser = newUser;
    }

    if (finalUser) {
      // Format it slightly to match the expected frontend type (camelCase)
      const formattedUser = {
        id: finalUser.id,
        email: finalUser.email,
        googleName: finalUser.google_name,
        googleAvatar: finalUser.google_avatar,
        claimedGuestName: finalUser.claimed_guest_name,
        status: finalUser.status,
        role: finalUser.role,
        createdAt: finalUser.created_at,
        approvedAt: finalUser.approved_at,
        note: finalUser.note
      };

      const successUrl = new URL("/auth/success", request.url);
      successUrl.searchParams.set("user", JSON.stringify(formattedUser));
      return NextResponse.redirect(successUrl);
    } else {
      return NextResponse.redirect(new URL("/?error=vip_link_failed", request.url));
    }
  } catch (e: any) {
    console.error("Error linking VIP status:", e);
    const errorMsg = e.message || (typeof e === 'object' ? JSON.stringify(e) : "fetch_failed");
    return NextResponse.redirect(new URL("/?error=" + encodeURIComponent(errorMsg), request.url));
  }
}
