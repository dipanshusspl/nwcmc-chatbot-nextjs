"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="p-3 mb-4 text-sm bg-red-900 border border-red-500 text-red-300 rounded-lg">{state.error}</div>
      )}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Username</label>
        <input type="text" name="username" required autoComplete="username"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Password</label>
        <input type="password" name="password" required autoComplete="current-password"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-amber-500 outline-none" />
      </div>
      <button type="submit" disabled={pending}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition-colors mt-2">
        {pending ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}
