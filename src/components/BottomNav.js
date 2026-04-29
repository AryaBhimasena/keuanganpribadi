"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Target, Plus, Heart, User } from "lucide-react";
import { useState } from "react";
import "@/styles/bottom-nav.css";

const menus = [
  { name: "Home", path: "/", icon: Home },
  { name: "Target", path: "/target", icon: Target },
  { name: "Tambah", action: "open", icon: Plus, isPrimary: true },
  { name: "Wishlist", path: "/wishlist", icon: Heart },
  { name: "Profil", path: "/profil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* CLEAN BOTTOM SHEET */}
      <div className={`bottom-sheet ${open ? "show" : ""}`}>
        <div className="sheet-handle" />

        <button onClick={() => router.push("/transaksi?type=income")}>
          Pemasukan
        </button>
        <button onClick={() => router.push("/transaksi?type=expense")}>
          Pengeluaran
        </button>
        <button onClick={() => router.push("/target")}>
          Set Target
        </button>
      </div>

      <nav className="bottom-nav">
        {menus.map((menu, i) => {
          const Icon = menu.icon;
          const active = pathname === menu.path;

          return (
            <button
              key={i}
              onClick={() =>
                menu.action === "open"
                  ? setOpen(true)
                  : router.push(menu.path)
              }
              className={`nav-item ${active ? "active" : ""}`}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{menu.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}