"use client";

import { useState, useRef, useEffect } from "react";
import { getWeeklyTarget } from "@/lib/api";
import "@/styles/home.css";

const days: string[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function HomePage() {
  const today: Date = new Date();
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [weekData, setWeekData] = useState<{
    day: string;
    date: Date;
    target: number;
  }[]>([]);

  // ================= FORMAT =================
  const formatNumber = (num: number): string =>
    num.toLocaleString("id-ID");

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

  const formatMonth = (date: Date): string =>
    date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

  // ================= WEEK =================
  const getStartOfWeek = (offset: number = 0): Date => {
    const d = new Date(today);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1 + offset * 7);
    return d;
  };

  const startOfWeek: Date = getStartOfWeek(weekOffset);

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await getWeeklyTarget(weekOffset);

        const mapped = res.data.map((item: any) => ({
          day: item.hari,
          date: new Date(item.date),
          target: item.target,
        }));

        setWeekData(mapped);
      } catch (err) {
        console.error("Failed fetch weekly target:", err);
      }
    };

    fetchWeekly();
  }, [weekOffset]);

  // ================= SCROLL =================
  const scroll = (dir: "next" | "prev"): void => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "next" ? 150 : -150,
      behavior: "smooth",
    });
  };

  // ================= DATA =================
  const todayData: {
    target: number;
    income: number;
    expense: number;
  } = {
    target: 500000,
    income: 320000,
    expense: 120000,
  };

  const remaining: number = todayData.target - todayData.income;
  const saldo: number = 12500000;

  const monthlyTarget: number = 10000000;
  const monthlyAchieved: number = 4200000;
  const monthlyRemaining: number = monthlyTarget - monthlyAchieved;

  return (
    <main className="app-wrapper">
      <div className="mobile-frame">

        {/* ================= HEADER ================= */}
        <div className="topbar">
          <h2>Dashboard</h2>
          <span>{formatMonth(today)}</span>
        </div>

        {/* ================= SECTION 1 ================= */}
        <section className="section balance-section">

          <div className="balance-card">
            <h1>Rp {formatNumber(saldo)}</h1>
            <p className="date">
              {today.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="finance-report">
            <div className="row">
              <span className="label">Target</span>
              <span className="currency">Rp</span>
              <span className="value">{formatNumber(todayData.target)}</span>
            </div>

            <div className="row">
              <span className="label">Pendapatan</span>
              <span className="currency">Rp</span>
              <span className="value plus">
                {formatNumber(todayData.income)}
              </span>
            </div>

            <div className="row">
              <span className="label">Pengeluaran</span>
              <span className="currency">Rp</span>
              <span className="value minus">
                {formatNumber(todayData.expense)}
              </span>
            </div>

            <div className="divider" />

            <div className="row total">
              <span className="label">Sisa Target</span>
              <span className="currency">Rp</span>
              <span className={`value ${remaining <= 0 ? "plus" : "minus"}`}>
                {formatNumber(remaining)}
              </span>
            </div>
          </div>

        </section>

        {/* ================= SECTION 2 ================= */}
        <section className="section weekly-section">

          {/* TITLE CENTER */}
          <h3 className="month-title">{formatMonth(startOfWeek)}</h3>
          <p className="week-title">Weekly Target</p>

          {/* STRIP */}
          <div className="week-strip" ref={scrollRef}>
            {weekData.map((d, i) => (
              <div key={i} className="week-item">
                <span className="day">{d.day}</span>
                <span className="date">{formatDate(d.date)}</span>

                <div className="amount">
                  <span className="value">
                    {formatNumber(d.target / 1000000)} K
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* MONTHLY */}
          <div className="monthly-cards">
            <div className="card">
              <span>Target Bulan</span>
              <h4>Rp {formatNumber(monthlyTarget)}</h4>
            </div>

            <div className="card">
              <span>Sisa Target</span>
              <h4 className={monthlyRemaining <= 0 ? "plus" : "minus"}>
                Rp {formatNumber(monthlyRemaining)}
              </h4>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}