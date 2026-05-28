"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMonthlyIncome,
  getMonthlyExpense,
} from "@/lib/api";

import InputModal from "@/components/InputModal";

import DashboardSlider from "@/components/DashboardSlider";

import "@/styles/home.css";

type CalendarDay = {
  date: Date;
  currentMonth: boolean;
  income: number;
  expense: number;
};

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

type InputModalType =
  | "income"
  | "expense"
  | null;

const DAYS = [
  "Sen",
  "Sel",
  "Rab",
  "Kam",
  "Jum",
  "Sab",
  "Min",
];

export default function HomePage() {

  const [selectedMonth,
    setSelectedMonth] =
    useState(new Date());

  const [incomeData,
    setIncomeData] =
    useState<IncomeItem[]>([]);

  const [expenseData,
    setExpenseData] =
    useState<ExpenseItem[]>([]);

  const [loadingCalendar,
    setLoadingCalendar] =
    useState(true);

  const [inputModalType,
    setInputModalType] =
    useState<InputModalType>(
      null
    );

  const [selectedDetailDate,
    setSelectedDetailDate] =
    useState<Date | null>(
      null
    );

  useEffect(() => {

    fetchMonthlyCalendar();

  }, [selectedMonth]);

  const fetchMonthlyCalendar =
    async () => {

      try {

        setLoadingCalendar(true);

        const bulan =
          selectedMonth.getMonth() + 1;

        const tahun =
          selectedMonth.getFullYear();

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

        setLoadingCalendar(false);

      }
    };

  const formatNumber = (
    num: number
  ) =>
    num.toLocaleString("id-ID");

  const formatCompact = (
    num: number
  ) =>
    new Intl.NumberFormat(
      "id-ID",
      {
        notation: "compact",
        maximumFractionDigits: 1,
      }
    ).format(num);

  const formatMonth = (
    date: Date
  ) =>
    date.toLocaleDateString(
      "id-ID",
      {
        month: "long",
        year: "numeric",
      }
    );

  const handlePrevMonth =
    () => {

      setSelectedMonth(
        (prev) => {

          const next =
            new Date(prev);

          next.setMonth(
            prev.getMonth() - 1
          );

          return next;
        }
      );
    };

  const handleNextMonth =
    () => {

      setSelectedMonth(
        (prev) => {

          const next =
            new Date(prev);

          next.setMonth(
            prev.getMonth() + 1
          );

          return next;
        }
      );
    };

  const openIncomeModal =
    () => {

      setSelectedDetailDate(
        null
      );

      setInputModalType(
        "income"
      );
    };

  const openExpenseModal =
    () => {

      setSelectedDetailDate(
        null
      );

      setInputModalType(
        "expense"
      );
    };

  const handleOpenDetail =
    (date: Date) => {

      setSelectedDetailDate(
        date
      );

      setInputModalType(
        "income"
      );
    };

  const closeInputModal =
    () => {

      setInputModalType(
        null
      );

      setSelectedDetailDate(
        null
      );
    };

  const handleSuccess =
    async () => {

      await fetchMonthlyCalendar();
    };

  const calendarDays =
    useMemo(() => {

      const year =
        selectedMonth.getFullYear();

      const month =
        selectedMonth.getMonth();

      const firstDay =
        new Date(
          year,
          month,
          1
        );

      let startDay =
        firstDay.getDay();

      if (startDay === 0) {
        startDay = 7;
      }

      const daysInMonth =
        new Date(
          year,
          month + 1,
          0
        ).getDate();

      const totalCells =
        startDay - 1 +
        daysInMonth;

      const totalRows =
        totalCells <= 35
          ? 35
          : 42;

      const startDate =
        new Date(firstDay);

      startDate.setDate(
        firstDay.getDate() -
          startDay +
          1
      );

      const result:
        CalendarDay[] = [];

      for (
        let i = 0;
        i < totalRows;
        i++
      ) {

        const date =
          new Date(startDate);

        date.setDate(
          startDate.getDate() + i
        );

        const incomeList =
          incomeData.filter(
            (item) =>
              item.tanggal ===
                date.getDate() &&
              item.bulan ===
                date.getMonth() + 1 &&
              item.tahun ===
                date.getFullYear()
          );

        const expenseList =
          expenseData.filter(
            (item) =>
              item.tanggal ===
                date.getDate() &&
              item.bulan ===
                date.getMonth() + 1 &&
              item.tahun ===
                date.getFullYear()
          );

        const totalIncome =
          incomeList.reduce(
            (acc, item) =>
              acc +
              Number(
                item.pendapatan
              ),
            0
          );

        const totalExpense =
          expenseList.reduce(
            (acc, item) =>
              acc +
              Number(
                item.pengeluaran
              ),
            0
          );

        result.push({
          date,

          currentMonth:
            date.getMonth() ===
            month,

          income:
            totalIncome,

          expense:
            totalExpense,
        });
      }

      return result;

    }, [
      selectedMonth,
      incomeData,
      expenseData,
    ]);

  const totalIncomeMonth =
    incomeData.reduce(
      (acc, item) =>
        acc +
        Number(
          item.pendapatan
        ),
      0
    );

  const totalExpenseMonth =
    expenseData.reduce(
      (acc, item) =>
        acc +
        Number(
          item.pengeluaran
        ),
      0
    );

  const totalBalanceMonth =
    totalIncomeMonth -
    totalExpenseMonth;

  return (
    <>
      <main className="app-shell">

        <div className="dashboard-container">

          <header className="topbar">

            <div className="topbar-left">

              <h1>
                Financial Summary
              </h1>

              <p>
                Monitoring pemasukan &
                pengeluaran bulanan
              </p>

            </div>

            <div className="topbar-right">

              <button
                className="nav-btn"
                onClick={
                  handlePrevMonth
                }
              >
                ←
              </button>

              <div className="month-label">
                {formatMonth(
                  selectedMonth
                )}
              </div>

              <button
                className="nav-btn"
                onClick={
                  handleNextMonth
                }
              >
                →
              </button>

            </div>

          </header>

          <section className="dashboard-content">

            <DashboardSlider
              loading={
                loadingCalendar
              }
              totalIncome={
                totalIncomeMonth
              }
              totalExpense={
                totalExpenseMonth
              }
              totalBalance={
                totalBalanceMonth
              }
              formatNumber={
                formatNumber
              }
              onOpenIncome={
                openIncomeModal
              }
              onOpenExpense={
                openExpenseModal
              }
            />

            <section className="calendar-wrapper">

              <div className="calendar-header">

                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="calendar-head-cell"
                  >
                    {day}
                  </div>
                ))}

              </div>

              <div
                className={`calendar-grid ${
                  calendarDays.length === 35
                    ? "five-rows"
                    : "six-rows"
                }`}
              >

                {calendarDays.map(
                  (
                    item,
                    index
                  ) => {

                    const isToday =
                      item.date.toDateString() ===
                        new Date().toDateString() &&
                      item.currentMonth;

                    const hasFinanceData =
                      item.income > 0 ||
                      item.expense > 0;

                    return (
                      <div
                        key={index}
                        className={`calendar-cell
                        ${
                          !item.currentMonth
                            ? "outside-month"
                            : ""
                        }
                        ${
                          isToday
                            ? "today"
                            : ""
                        }`}
                      >

                        <div className="cell-content">

                          <div className="date-section">

                            <div
                              className={`calendar-date
                              ${
                                !item.currentMonth
                                  ? "outside-date"
                                  : ""
                              }`}
                            >
                              {item.date.getDate()}
                            </div>

                          </div>

                          <div className="finance-section">

                            {hasFinanceData && (
                              <>
                                {item.income > 0 && (
                                  <div className="finance-item income">

                                    <span>
                                      ↑
                                    </span>

                                    <strong>
                                      Rp{" "}
                                      {formatCompact(
                                        item.income
                                      )}
                                    </strong>

                                  </div>
                                )}

                                {item.expense > 0 && (
                                  <div className="finance-item expense">

                                    <span>
                                      ↓
                                    </span>

                                    <strong>
                                      Rp{" "}
                                      {formatCompact(
                                        item.expense
                                      )}
                                    </strong>

                                  </div>
                                )}

                                <button
                                  className="detail-link"
                                  onClick={() =>
                                    handleOpenDetail(
                                      item.date
                                    )
                                  }
                                >
                                  Detail
                                </button>
                              </>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

          </section>

        </div>

      </main>

      <InputModal
        open={
          inputModalType !==
          null
        }
        type={
          inputModalType ||
          "income"
        }
        initialDate={
          selectedDetailDate
        }
        onSuccess={
          handleSuccess
        }
        onClose={
          closeInputModal
        }
      />

    </>
  );
}