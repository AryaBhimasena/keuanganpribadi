"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  getMonthlyIncome,
  getMonthlyExpense,
} from "@/lib/api";

import "@/styles/homepage.css";

/* =============================== */
/* TYPES */
/* =============================== */

type IncomeItem = {
  rowIndex?: number;
  tanggal: number;
  bulan: number;
  tahun: number;
  pendapatan: number;
  keterangan: string;
};

type ExpenseItem = {
  rowIndex?: number;
  tanggal: number;
  bulan: number;
  tahun: number;
  pengeluaran: number;
  keterangan: string;
};

export default function HomePage() {
  const [showTarget, setShowTarget] =
    useState(false);

  const [loading,
    setLoading] =
    useState(true);

  const [incomeData,
    setIncomeData] =
    useState<IncomeItem[]>([]);

  const [expenseData,
    setExpenseData] =
    useState<ExpenseItem[]>([]);

  /* =============================== */
  /* STATIC TARGET */
  /* =============================== */

  const totalTarget =
    10000000;

  /* =============================== */
  /* FETCH REAL DATA */
  /* =============================== */

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData =
    async () => {

      try {
        setLoading(true);

        const now =
          new Date();

        const bulan =
          now.getMonth() + 1;

        const tahun =
          now.getFullYear();

        const [
          incomeResponse,
          expenseResponse,
        ] =
          await Promise.all([
            getMonthlyIncome(
              bulan,
              tahun
            ),

            getMonthlyExpense(
              bulan,
              tahun
            ),
          ]);

        if (
          incomeResponse.success
        ) {
          setIncomeData(
            incomeResponse.data ||
              []
          );
        } else {
          setIncomeData([]);
        }

        if (
          expenseResponse.success
        ) {
          setExpenseData(
            expenseResponse.data ||
              []
          );
        } else {
          setExpenseData([]);
        }

      } catch (err) {

        console.error(err);

        setIncomeData([]);
        setExpenseData([]);

      } finally {

        setLoading(false);

      }
    };

  /* =============================== */
  /* CALCULATIONS */
  /* =============================== */

  const totalIncome =
    incomeData.reduce(
      (acc, item) =>
        acc +
        Number(
          item.pendapatan
        ),
      0
    );

  const totalExpense =
    expenseData.reduce(
      (acc, item) =>
        acc +
        Number(
          item.pengeluaran
        ),
      0
    );

  const surplus =
    totalIncome -
    totalExpense;

  const remainingTarget =
    surplus > 0
      ? totalTarget - surplus
      : totalTarget;

  /* =============================== */
  /* FORMATTERS */
  /* =============================== */

  const compact = (
    num: number
  ) =>
    new Intl.NumberFormat(
      "id-ID",
      {
        notation:
          "compact",
        maximumFractionDigits:
          1,
      }
    ).format(num);

  const full = (
    num: number
  ) =>
    num.toLocaleString(
      "id-ID"
    );

  const today =
    new Date().toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  /* =============================== */
  /* RENDER */
  /* =============================== */

  return (
    <main className="homepage">

      <section className="hero-card">

        <span className="hero-label">
          TOTAL TARGET
        </span>

        <div className="hero-amount-row">

          <h1 className="hero-amount">

            {showTarget
              ? `Rp ${full(
                  totalTarget
                )}`
              : "Rp •••••••••"}

          </h1>

          <button
            className="eye-button"
            onClick={() =>
              setShowTarget(
                !showTarget
              )
            }
          >
            {showTarget ? (
              <EyeOff
                size={22}
              />
            ) : (
              <Eye
                size={22}
              />
            )}
          </button>

        </div>

        <div className="hero-meta">

          <span>
            Remaining :
            Rp{" "}
            {full(
              remainingTarget
            )}
          </span>

          <small>
            {today}
          </small>

        </div>

      </section>

      <section className="bottom-row">

        <div className="mini-card income">
          <span>
            Income — Rp{" "}
            {loading
              ? "..."
              : compact(
                  totalIncome
                )}
          </span>
        </div>

        <div className="mini-card expense">
          <span>
            Expense — Rp{" "}
            {loading
              ? "..."
              : compact(
                  totalExpense
                )}
          </span>
        </div>

        <div className="mini-card balance">
          <span>

            {surplus >= 0
              ? "Surplus"
              : "Defisit"}

            {" — Rp "}

            {loading
              ? "..."
              : compact(
                  Math.abs(
                    surplus
                  )
                )}

          </span>
        </div>

        <Link
          href="/agenda"
          className="agenda-btn"
        >
          <CalendarDays
            size={20}
          />
        </Link>

      </section>

    </main>
  );
}