export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.18),transparent_24%)]" />
      <div className="relative z-10 w-full max-w-6xl">{children}</div>
    </div>
  );
}
