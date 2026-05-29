"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createDailyGoal,
  deleteDailyGoal,
  getDailyGoals,
  getKewajiban,
  updateDailyGoal,
  updateKewajiban,
} from "@/lib/api";

import "@/styles/dashboard-slider.css";

type Props = {
  loading: boolean;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  formatNumber: (
    num: number
  ) => string;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
};

type GoalItem = {
  rowIndex?: number;
  tanggal: number;
  bulan: number;
  tahun: number;
  goals: string;
  target?: string;
  status?: string;
};

type KewajibanItem = {
  rowIndex?: number;
  id_akun: string;
  akun: string;
  kewajiban: number;
  sisa_kewajiban: number;
  tanggal_pinjam: number;
  bulan_pinjam: number;
  tahun_pinjam: number;
  pembayaran: number;
  tanggal_bayar: number;
  bulan_bayar: number;
  tahun_bayar: number;
  keterangan: string;
  status: string;
};

const INITIAL_FORM = {
  goals: "",
  target: "",
};

const INITIAL_PAYMENT_FORM = {
  pembayaran: "",
  tanggal_bayar: "",
  keterangan: "",
};

const SLIDES = [
  "Overview",
  "Goals",
  "Debts",
];

const getTodayString = () => {

  const now =
    new Date();

  const localDate =
    new Date(
      now.getTime() -
        now.getTimezoneOffset() *
          60000
    );

  return localDate
    .toISOString()
    .split("T")[0];
};

export default function DashboardSlider({
  loading,
  totalIncome,
  totalExpense,
  totalBalance,
  formatNumber,
  onOpenIncome,
  onOpenExpense,
}: Props) {

  const [activeSlide,
    setActiveSlide] =
    useState(0);

  const [selectedDate,
    setSelectedDate] =
    useState(
      getTodayString()
    );

  const [goals,
    setGoals] =
    useState<GoalItem[]>([]);

  const [kewajiban,
    setKewajiban] =
    useState<
      KewajibanItem[]
    >([]);

  const [goalModalOpen,
    setGoalModalOpen] =
    useState(false);

  const [editingGoal,
    setEditingGoal] =
    useState<GoalItem | null>(
      null
    );

  const [goalForm,
    setGoalForm] =
    useState(INITIAL_FORM);

  const [savingGoal,
    setSavingGoal] =
    useState(false);

  const [deleteTarget,
    setDeleteTarget] =
    useState<GoalItem | null>(
      null
    );

  const [deleting,
    setDeleting] =
    useState(false);

  const [paymentModalOpen,
    setPaymentModalOpen] =
    useState(false);

  const [selectedDebt,
    setSelectedDebt] =
    useState<KewajibanItem | null>(
      null
    );

  const [paymentForm,
    setPaymentForm] =
    useState(
      INITIAL_PAYMENT_FORM
    );

  const [savingPayment,
    setSavingPayment] =
    useState(false);

  const fetchGoals =
    async () => {

      try {

        const selected =
          new Date(
            `${selectedDate}T00:00:00`
          );

        const response =
          await getDailyGoals(
            selected.getDate(),
            selected.getMonth() +
              1,
            selected.getFullYear()
          );

        if (
          response.success
        ) {

          setGoals(
            response.data || []
          );

        } else {

          setGoals([]);
        }

      } catch (
        error
      ) {

        console.error(
          error
        );

        setGoals([]);
      }
    };

const fetchKewajiban =
  async () => {

    try {

      const response =
        await getKewajiban();

      console.log(
        "KEWAJIBAN RESPONSE:",
        response
      );

      if (
        response.success
      ) {

        console.log(
          "KEWAJIBAN DATA:",
          response.data
        );

        setKewajiban(
          response.data || []
        );

      } else {

        setKewajiban([]);
      }

    } catch (
      error
    ) {

      console.error(
        "ERROR KEWAJIBAN:",
        error
      );

      setKewajiban([]);
    }
  };
  
  useEffect(() => {

    fetchGoals();

  }, [selectedDate]);

  useEffect(() => {

    fetchKewajiban();

  }, []);

  const nextSlide = () => {

    setActiveSlide((prev) =>
      prev ===
      SLIDES.length - 1
        ? 0
        : prev + 1
    );
  };

  const prevSlide = () => {

    setActiveSlide((prev) =>
      prev === 0
        ? SLIDES.length - 1
        : prev - 1
    );
  };

  const formattedDate =
    useMemo(() => {

      return new Date(
        `${selectedDate}T00:00:00`
      ).toLocaleDateString(
        "id-ID",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

    }, [selectedDate]);

  const totalKewajiban =
    useMemo(() => {

      return kewajiban.reduce(
        (
          acc,
          item
        ) =>
          acc +
          Number(
            item
              .sisa_kewajiban ||
              0
          ),
        0
      );

    }, [kewajiban]);

const activeDebts =
  useMemo(() => {

    return kewajiban.filter(
      (item) =>
        String(
          item.status || ""
        )
          .trim()
          .toLowerCase() !==
        "lunas"
    );

  }, [kewajiban]);
  
  const openCreateModal =
    () => {

      setEditingGoal(null);

      setGoalForm(
        INITIAL_FORM
      );

      setGoalModalOpen(true);
    };

  const openEditModal =
    (
      item: GoalItem
    ) => {

      setEditingGoal(item);

      setGoalForm({
        goals:
          item.goals || "",
        target:
          item.target || "",
      });

      setGoalModalOpen(true);
    };

  const closeModal =
    () => {

      if (
        savingGoal
      ) {
        return;
      }

      setGoalModalOpen(false);

      setEditingGoal(null);

      setGoalForm(
        INITIAL_FORM
      );
    };

  const handleSubmit =
    async () => {

      if (
        !goalForm.goals
          .trim()
      ) {
        return;
      }

      try {

        setSavingGoal(
          true
        );

        const selected =
          new Date(
            `${selectedDate}T00:00:00`
          );

        const payload = {
          tanggal:
            selected.getDate(),

          bulan:
            selected.getMonth() +
            1,

          tahun:
            selected.getFullYear(),

          goals:
            goalForm.goals,

          target:
            goalForm.target,

          status:
            editingGoal
              ?.status || "",
        };

        if (
          editingGoal
        ) {

          await updateDailyGoal(
            editingGoal.rowIndex!,
            payload
          );

        } else {

          await createDailyGoal(
            payload
          );
        }

        await fetchGoals();

        closeModal();

      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          "Gagal menyimpan goals"
        );

      } finally {

        setSavingGoal(
          false
        );
      }
    };

  const openDeleteConfirm =
    (
      item: GoalItem
    ) => {

      setDeleteTarget(
        item
      );
    };

  const closeDeleteConfirm =
    () => {

      if (
        deleting
      ) {
        return;
      }

      setDeleteTarget(
        null
      );
    };

  const handleDelete =
    async () => {

      if (
        !deleteTarget
          ?.rowIndex
      ) {
        return;
      }

      try {

        setDeleting(
          true
        );

        await deleteDailyGoal(
          deleteTarget.rowIndex
        );

        await fetchGoals();

        closeDeleteConfirm();

      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          "Gagal menghapus goals"
        );

      } finally {

        setDeleting(
          false
        );
      }
    };

  const toggleGoalStatus =
    async (
      item: GoalItem
    ) => {

      const nextStatus =
        item.status ===
        "Achieve"
          ? ""
          : "Achieve";

      setGoals((prev) =>
        prev.map((goal) =>
          goal.rowIndex ===
          item.rowIndex
            ? {
                ...goal,
                status:
                  nextStatus,
              }
            : goal
        )
      );

      try {

        await updateDailyGoal(
          item.rowIndex!,
          {
            tanggal:
              item.tanggal,

            bulan:
              item.bulan,

            tahun:
              item.tahun,

            goals:
              item.goals,

            target:
              item.target || "",

            status:
              nextStatus,
          }
        );

      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          "Gagal update checklist"
        );
      }
    };

  const openPaymentModal =
    (
      item: KewajibanItem
    ) => {

      setSelectedDebt(
        item
      );

      setPaymentForm({
        pembayaran: "",
        tanggal_bayar:
          getTodayString(),
        keterangan: "",
      });

      setPaymentModalOpen(
        true
      );
    };

  const closePaymentModal =
    () => {

      if (
        savingPayment
      ) {
        return;
      }

      setPaymentModalOpen(
        false
      );

      setSelectedDebt(
        null
      );
    };

  const handlePayment =
    async () => {

      if (
        !selectedDebt
      ) {
        return;
      }

      try {

        setSavingPayment(
          true
        );

        const payDate =
          new Date(
            `${paymentForm.tanggal_bayar}T00:00:00`
          );

        const nominal =
          Number(
            paymentForm.pembayaran
          );

        const remaining =
          Math.max(
            0,
            Number(
              selectedDebt.sisa_kewajiban
            ) - nominal
          );

        await updateKewajiban(
          selectedDebt.rowIndex!,
          {
            ...selectedDebt,
            pembayaran:
              nominal,
            sisa_kewajiban:
              remaining,
            tanggal_bayar:
              payDate.getDate(),
            bulan_bayar:
              payDate.getMonth() +
              1,
            tahun_bayar:
              payDate.getFullYear(),
            keterangan:
              paymentForm.keterangan,
            status:
              remaining <= 0
                ? "Lunas"
                : "",
          }
        );

        await fetchKewajiban();

        closePaymentModal();

      } catch (
        error
      ) {

        console.error(
          error
        );

        alert(
          "Gagal menyimpan pembayaran"
        );

      } finally {

        setSavingPayment(
          false
        );
      }
    };

  return (
    <>
      <aside className="dashboard-slider">

        <div className="dashboard-slider-top">

          <button
            className="slider-nav-btn"
            onClick={prevSlide}
          >
            ←
          </button>

          <div className="slider-indicator">
            {
              SLIDES[
                activeSlide
              ]
            }
          </div>

          <button
            className="slider-nav-btn"
            onClick={nextSlide}
          >
            →
          </button>

        </div>

        <div className="dashboard-slider-body">

          {/* OVERVIEW */}

          <div
            className={`dashboard-slide ${
              activeSlide === 0
                ? "active"
                : ""
            }`}
          >

            <div className="summary-card balance-card">

              <span>
                Total Pemasukan
              </span>

              <h2>
                {loading
                  ? "Loading..."
                  : `Rp ${formatNumber(
                      totalIncome
                    )}`}
              </h2>

            </div>

            <div className="summary-card expense-card">

              <span>
                Total Pengeluaran
              </span>

              <h2>
                {loading
                  ? "Loading..."
                  : `Rp ${formatNumber(
                      totalExpense
                    )}`}
              </h2>

            </div>

            <div className="summary-card today-card">

              <span>
                Selisih
              </span>

              <h2
                className={
                  totalBalance >=
                  0
                    ? "plus"
                    : "minus"
                }
              >
                {loading
                  ? "Loading..."
                  : `Rp ${formatNumber(
                      totalBalance
                    )}`}
              </h2>

            </div>

            <div className="kpi-action-group">

              <button
                className="action-btn income-btn"
                onClick={
                  onOpenIncome
                }
              >
                + Pemasukan
              </button>

              <button
                className="action-btn expense-btn"
                onClick={
                  onOpenExpense
                }
              >
                - Pengeluaran
              </button>

            </div>

          </div>

          {/* GOALS */}

          <div
            className={`dashboard-slide ${
              activeSlide === 1
                ? "active"
                : ""
            }`}
          >

            <div className="daily-goals-card">

              <div className="daily-goals-header">

                <h3>
                  Daily Goals
                </h3>

                <button
                  className="goal-add-btn"
                  onClick={
                    openCreateModal
                  }
                >
                  + Tambah
                </button>

              </div>

              <div className="goals-date-section">

                <input
                  type="date"
                  className="goals-date-input"
                  value={
                    selectedDate
                  }
                  onChange={(e) =>
                    setSelectedDate(
                      e.target.value
                    )
                  }
                />

                <div className="goals-date-info">
                  {
                    formattedDate
                  }
                </div>

              </div>

              <div className="daily-goals-list custom-scrollbar">

                {goals.length >
                0 ? (
                  goals.map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.rowIndex
                        }
                        className="goal-strip"
                      >

                        <div className="goal-strip-left">

                          <input
                            type="checkbox"
                            checked={
                              item.status ===
                              "Achieve"
                            }
                            onChange={() =>
                              toggleGoalStatus(
                                item
                              )
                            }
                          />

                          <div className="goal-strip-content">

                            <div
                              className={`goal-strip-title ${
                                item.status ===
                                "Achieve"
                                  ? "checked"
                                  : ""
                              }`}
                            >
                              {
                                item.goals
                              }
                            </div>

                          </div>

                        </div>

                        <div className="goal-strip-actions">

                          <button
                            className="goal-icon-btn"
                            onClick={() =>
                              openEditModal(
                                item
                              )
                            }
                          >
                            ✎
                          </button>

                          <button
                            className="goal-icon-btn delete"
                            onClick={() =>
                              openDeleteConfirm(
                                item
                              )
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </div>
                    )
                  )
                ) : (
                  <div className="empty-goals">

                    Belum ada goals
                    untuk tanggal ini

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* DEBTS */}

          <div
            className={`dashboard-slide ${
              activeSlide === 2
                ? "active"
                : ""
            }`}
          >

            <div className="daily-goals-card">

              <div className="daily-goals-header">

                <h3>
                  Total Kewajiban
                </h3>

              </div>

              <div className="debt-total-card">

                <span>
                  Total Outstanding
                </span>

                <h2>
                  Rp{" "}
                  {formatNumber(
                    totalKewajiban
                  )}
                </h2>

              </div>

              <div className="daily-goals-list custom-scrollbar">

                {activeDebts.length >
                0 ? (
                  activeDebts.map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item.rowIndex
                        }
                        className="goal-strip"
                      >

                        <div className="goal-strip-content">

                          <div className="goal-strip-title">
                            {
                              item.akun
                            }
                          </div>

                          <div className="goal-strip-target">

                            Sisa Rp{" "}
                            {formatNumber(
                              item.sisa_kewajiban
                            )}

                          </div>

                        </div>

                        <button
                          className="debt-pay-btn"
                          onClick={() =>
                            openPaymentModal(
                              item
                            )
                          }
                        >
                          Bayar
                        </button>

                      </div>
                    )
                  )
                ) : (
                  <div className="empty-goals">

                    Tidak ada kewajiban aktif

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </aside>

      {goalModalOpen && (
        <div className="goal-modal-overlay">

          <div className="goal-modal">

            <div className="goal-modal-header">

              <h3>
                {editingGoal
                  ? "Edit Goals"
                  : "Tambah Goals"}
              </h3>

              <button
                className="goal-modal-close"
                onClick={
                  closeModal
                }
              >
                ✕
              </button>

            </div>

            <div className="goal-form-group">

              <label>
                Goals
              </label>

              <textarea
                className="goal-textarea"
                value={
                  goalForm.goals
                }
                onChange={(e) =>
                  setGoalForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      goals:
                        e.target
                          .value,
                    })
                  )
                }
              />

            </div>

            <button
              className="goal-submit-btn"
              onClick={
                handleSubmit
              }
              disabled={
                savingGoal
              }
            >
              {savingGoal
                ? "Menyimpan..."
                : "Simpan"}
            </button>

          </div>

        </div>
      )}

      {paymentModalOpen &&
        selectedDebt && (
          <div className="goal-modal-overlay">

            <div className="goal-modal">

              <div className="goal-modal-header">

                <h3>
                  Pembayaran
                </h3>

                <button
                  className="goal-modal-close"
                  onClick={
                    closePaymentModal
                  }
                >
                  ✕
                </button>

              </div>

              <div className="payment-history-card">

                <div>
                  Total Hutang
                </div>

                <strong>
                  Rp{" "}
                  {formatNumber(
                    selectedDebt.kewajiban
                  )}
                </strong>

              </div>

              <div className="payment-history-card">

                <div>
                  Sisa Hutang
                </div>

                <strong>
                  Rp{" "}
                  {formatNumber(
                    selectedDebt.sisa_kewajiban
                  )}
                </strong>

              </div>

              <div className="goal-form-group">

                <label>
                  Nominal Pembayaran
                </label>

                <input
                  type="number"
                  className="goal-input"
                  value={
                    paymentForm.pembayaran
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        pembayaran:
                          e.target
                            .value,
                      })
                    )
                  }
                />

              </div>

              <div className="goal-form-group">

                <label>
                  Tanggal Bayar
                </label>

                <input
                  type="date"
                  className="goal-input"
                  value={
                    paymentForm.tanggal_bayar
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        tanggal_bayar:
                          e.target
                            .value,
                      })
                    )
                  }
                />

              </div>

              <div className="goal-form-group">

                <label>
                  Keterangan
                </label>

                <textarea
                  className="goal-textarea"
                  value={
                    paymentForm.keterangan
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        prev
                      ) => ({
                        ...prev,
                        keterangan:
                          e.target
                            .value,
                      })
                    )
                  }
                />

              </div>

              <button
                className="goal-submit-btn"
                onClick={
                  handlePayment
                }
                disabled={
                  savingPayment
                }
              >
                {savingPayment
                  ? "Menyimpan..."
                  : "Simpan Pembayaran"}
              </button>

            </div>

          </div>
        )}
    </>
  );
}