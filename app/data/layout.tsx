// import { auth, signOut } from "@/auth";
// import { redirect } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { StepBackIcon } from "lucide-react";
// import Link from "next/link";

export default async function DataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await auth();
  
  // if (!session?.user) {
  //   redirect("/auth/login");
  // }
  
  return (
    <div>
      {children}
    </div>
  );
}