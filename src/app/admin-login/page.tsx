import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = { title: "NWCMC Admin Login" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin-panel/");
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-amber-500">NWCMC Admin Portal</h2>
          <p className="text-gray-400 text-sm mb-6">Login to access the Admin Dashboard.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
