"use client";

import { useState, useRef, useEffect } from "react";
import {
  getWeeklyTarget,
  getTodayIncome,
  getTodayExpense,
  getBalance
} from "@/lib/api";
import "@/styles/home.css";

const days: string[] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu"
];

export default function HomePage() {
  const [now, setNow] = useState<Date>(new Date());
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ================= STATE =================
  const [todayIncome, setTodayIncome] = useState<number>(0);
  const [todayExpense, setTodayExpense] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);

  const [loadingIncome, setLoadingIncome] = useState<boolean>(true);
  const [loadingExpense, setLoadingExpense] = useState<boolean>(true);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);
  const [loadingWeekly, setLoadingWeekly] = useState<boolean>(true);

  const [weekData, setWeekData] = useState<
    { day: string; date: Date; target: number }[]
  >([]);

  // ================= REALTIME CLOCK =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ================= FORMAT =================
  const formatNumber = (num: number): string =>
    num.toLocaleString("id-ID");

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

  const formatFullDateTime = (date: Date): string =>
    date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " • " +
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatMonth = (date: Date): string =>
    date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

  // ================= WEEK =================
  const getStartOfWeek = (offset: number = 0): Date => {
    const d = new Date(now);
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1 + offset * 7);
    return d;
  };

  const startOfWeek = getStartOfWeek(weekOffset);

  // ================= FETCH WEEKLY =================
  useEffect(() => {
    const fetchWeekly = async () => {
      try {
        setLoadingWeekly(true);

        const res = await getWeeklyTarget(weekOffset);

        const mapped = res.data.map((item: any) => ({
          day: item.hari,
          date: new Date(item.date),
          target: item.target,
        }));

        setWeekData(mapped);
      } catch (err) {
        console.error("Failed fetch weekly target:", err);
      } finally {
        setLoadingWeekly(false);
      }
    };

    fetchWeekly();
  }, [weekOffset]);

  // ================= FETCH INCOME =================
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoadingIncome(true);
        const res = await getTodayIncome();
        setTodayIncome(res.data.income || 0);
      } catch (err) {
        console.error("Failed fetch income:", err);
      } finally {
        setLoadingIncome(false);
      }
    };

    fetchIncome();
  }, []);

  // ================= FETCH EXPENSE =================
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoadingExpense(true);
        const res = await getTodayExpense();
        setTodayExpense(res.data.expense || 0);
      } catch (err) {
        console.error("Failed fetch expense:", err);
      } finally {
        setLoadingExpense(false);
      }
    };

    fetchExpense();
  }, []);

  // ================= FETCH BALANCE =================
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoadingBalance(true);
        const res = await getBalance();
        setBalance(res.data.balance || 0);
      } catch (err) {
        console.error("Failed fetch balance:", err);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  // ================= TODAY TARGET =================
  const todayTarget =
    weekData.find(
      (d) => d.date.toDateString() === now.toDateString()
    )?.target || 0;

  // ✅ REAL CALCULATION
  const remaining =
    todayTarget + todayIncome - todayExpense;

  // ================= DATA =================
  const todayData = {
    target: todayTarget,
    income: todayIncome,
    expense: todayExpense,
  };

  const monthlyTarget = 10000000;
  const monthlyAchieved = 4200000;
  const monthlyRemaining = monthlyTarget - monthlyAchieved;

  return (
    <main className="app-wrapper">
      <div className="mobile-frame">

        {/* HEADER */}
        <div className="topbar">
          <h2>Dashboard</h2>
          <span>{formatMonth(now)}</span>
        </div>

        {/* BALANCE */}
        <section className="section balance-section">
          <div className="balance-card">
            <h1>
              Rp {loadingBalance ? "..." : formatNumber(balance)}
            </h1>
            <p className="date">{formatFullDateTime(now)}</p>
          </div>

          <div className="finance-report">
            {loadingWeekly ? (
              <div className="row">
                <span className="label">Memuat data...</span>
              </div>
            ) : (
              <>
                <div className="row">
                  <span className="label">Target</span>
                  <span className="currency">Rp</span>
                  <span className="value">
                    {formatNumber(todayData.target)}
                  </span>
                </div>

                <div className="row">
                  <span className="label">Pendapatan</span>
                  <span className="currency">Rp</span>
                  <span className="value plus">
                    {loadingIncome
                      ? "..."
                      : formatNumber(todayData.income)}
                  </span>
                </div>

                <div className="row">
                  <span className="label">Pengeluaran</span>
                  <span className="currency">Rp</span>
                  <span className="value minus">
                    {loadingExpense
                      ? "..."
                      : formatNumber(todayData.expense)}
                  </span>
                </div>

                <div className="divider" />

                <div className="row total">
                  <span className="label">Sisa Target</span>
                  <span className="currency">Rp</span>
                  <span
                    className={`value ${
                      remaining >= 0 ? "plus" : "minus"
                    }`}
                  >
                    {formatNumber(remaining)}
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* WEEKLY */}
        <section className="section weekly-section">
          <h3 className="month-title">
            {formatMonth(startOfWeek)}
          </h3>
          <p className="week-title">Weekly Target</p>

          {loadingWeekly ? (
            <p style={{ textAlign: "center" }}>
              Memuat data...
            </p>
          ) : (
            <div className="week-strip" ref={scrollRef}>
              {weekData.map((d, i) => (
                <div key={i} className="week-item">
                  <span className="day">{d.day}</span>
                  <span className="date">
                    {formatDate(d.date)}
                  </span>

                  <div className="amount">
                    <span className="value">
                      {formatNumber(d.target / 1000000)} K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MONTHLY */}
          <div className="monthly-cards">
            <div className="card">
              <span>Target Bulan</span>
              <h4>Rp {formatNumber(monthlyTarget)}</h4>
            </div>

            <div className="card">
              <span>Sisa Target</span>
              <h4
                className={
                  monthlyRemaining >= 0 ? "plus" : "minus"
                }
              >
                Rp {formatNumber(monthlyRemaining)}
              </h4>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}