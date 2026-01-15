"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("logged_in");
    if (!isLoggedIn) router.replace("/auth/signin");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("logged_in");
    router.replace("/auth/signin");
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back!</p>

      <button
        onClick={handleLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}