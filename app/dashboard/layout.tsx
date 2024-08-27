import Sidebar from "./Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex relative min-h-screen gap-1">
      <Sidebar />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
