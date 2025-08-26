export function GoogleVerification() {
  const verificationCode = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;
  
  if (!verificationCode) {
    return null;
  }

  return (
    <meta 
      name="google-site-verification" 
      content={verificationCode} 
    />
  );
}
