// Sends Lumen auth emails (signup confirmation + password reset) through the
// Resend API instead of Supabase's built-in email.
//
// What happens here:
//   1. The user is created/checked in Supabase with email confirmation handled
//      by us (email_confirm: false so Supabase never sends anything itself).
//   2. Supabase's Admin API generates the signup/recovery action link.
//   3. Resend sends the branded email that contains that link.
//   The user clicks the link and Supabase completes sign-in / password reset.

import { createClient } from '@supabase/supabase-js';

function sendCors(res) {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-methods', 'POST, OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    sendCors(res);
    return res.status(204).end();
  }
  sendCors(res);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = {};
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!url || !serviceKey || !resendKey) {
    return res.status(500).json({ error: 'Auth email service is not configured.' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  const action = body.action === 'recovery' ? 'recovery' : 'signup';
  const redirectTo = process.env.APP_URL || 'https://lumen-xmqro.vercel.app';

  const sb = createClient(url, serviceKey);
  let link = null;

  if (action === 'signup') {
    const password = String(body.password || '');
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const { error: createErr } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });
    // 23505 / 409 = account already exists. Fine - we still send the link.
    if (createErr && createErr.code !== '23505' && createErr.status !== 409) {
      console.error('[auth-email] createUser:', createErr);
    }
    const { data, error } = await sb.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo },
    });
    if (error) {
      console.error('[auth-email] generateLink(signup):', error);
      return res.status(500).json({ error: 'Could not create confirmation link.' });
    }
    link = data?.properties?.action_link || data?.action_link || null;
  } else {
    const { data, error } = await sb.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    });
    if (error) {
      // Unknown email (or another failure) - answer "sent" to avoid leaking
      // which addresses are registered.
      console.error('[auth-email] generateLink(recovery):', error.message);
      return res.json({ sent: true });
    }
    link = data?.properties?.action_link || data?.action_link || null;
  }

  if (!link) {
    return res.status(500).json({ error: 'Could not generate email link.' });
  }

  const from = process.env.EMAIL_FROM || 'Lumen <onboarding@resend.dev>';
  const isSignup = action === 'signup';
  const buttonText = isSignup ? 'Confirm my account' : 'Reset my password';
  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;background:#09090b;color:#e4e4e7;font-family:Segoe UI,Arial,sans-serif">
    <div style="max-width:480px;margin:40px auto;border:1px solid #27272a;border-radius:16px;overflow:hidden">
      <div style="padding:28px;background:linear-gradient(135deg,#f59e0b,#ea580c)">
        <span style="color:#fff;font-weight:700;font-size:20px">Lumen AI</span>
      </div>
      <div style="padding:32px 28px">
        <h1 style="color:#fafafa;font-size:20px;margin:0 0 12px">${isSignup ? 'Confirm your account' : 'Reset your password'}</h1>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px">
          ${isSignup ? 'Click the button below to verify your email and finish creating your Lumen account.' : 'Click the button below to choose a new password for your Lumen account.'}
          If you didn't request this, you can safely ignore this email.
        </p>
        <a href="${link}" style="display:inline-block;background:#f59e0b;color:#18181b;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px">${buttonText}</a>
        <p style="color:#71717a;font-size:12px;line-height:1.6;margin:24px 0 0">Or paste this link in your browser:<br><span style="color:#a1a1aa;word-break:break-all">${link}</span></p>
      </div>
    </div>
  </body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${resendKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: isSignup ? 'Confirm your Lumen account' : 'Reset your Lumen password',
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('[auth-email] resend:', response.status, detail);
    return res.status(500).json({ error: 'The email service could not send the message.' });
  }

  return res.json({ sent: true });
}