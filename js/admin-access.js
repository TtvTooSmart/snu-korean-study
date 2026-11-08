// Only call this with the user returned by Supabase auth.getUser(), which
// verifies the session on the server. User-editable metadata grants no access.
export const adminEmail = 'shivamj8866@gmail.com';
export function isVerifiedAdmin(user) {
  return !!(user?.id && user.email_confirmed_at && !user.is_anonymous &&
    typeof user.email === 'string' && user.email.trim().toLowerCase() === adminEmail);
}
export async function verifyAdmin(client, userId) {
  if (!client || !userId) return false;
  try {
    const {data,error} = await client.auth.getUser();
    return !error && data?.user?.id === userId && isVerifiedAdmin(data.user);
  } catch { return false; }
}
