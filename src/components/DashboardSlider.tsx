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
  updateDailyGoal,
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

const INITIAL_FORM = {
  goals: "",
  target: "",
};

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

  useEffect(() => {

    fetchGoals();

  }, [selectedDate]);

  const nextSlide = () => {

    setActiveSlide((prev) =>
      prev === 1
        ? 0
        : prev + 1
    );
  };

  const prevSlide = () => {

    setActiveSlide((prev) =>
      prev === 0
        ? 1
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

        setGoals((prev) =>
          prev.map((goal) =>
            goal.rowIndex ===
            item.rowIndex
              ? {
                  ...goal,
                  status:
                    item.status,
                }
              : goal
          )
        );

        alert(
          "Gagal update checklist"
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
            {activeSlide + 1} / 2
          </div>

          <button
            className="slider-nav-btn"
            onClick={nextSlide}
          >
            →
          </button>

        </div>

        <div className="dashboard-slider-body">

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

                            {item.target && (
                              <div className="goal-strip-target">

                                Rp{" "}
                                {formatNumber(
                                  Number(
                                    item.target
                                  )
                                )}

                              </div>
                            )}

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
                placeholder="Masukkan goals..."
              />

            </div>

            <div className="goal-form-group">

              <label>
                Target
              </label>

              <input
                type="number"
                className="goal-input"
                value={
                  goalForm.target
                }
                onChange={(e) =>
                  setGoalForm(
                    (
                      prev
                    ) => ({
                      ...prev,
                      target:
                        e.target
                          .value,
                    })
                  )
                }
                placeholder="Opsional"
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

      {deleteTarget && (
        <div className="goal-modal-overlay">

          <div className="delete-confirm-modal">

            <h3>
              Hapus Goals
            </h3>

            <p>
              Apakah yakin ingin
              menghapus goals ini?
            </p>

            <div className="delete-confirm-actions">

              <button
                className="delete-cancel-btn"
                onClick={
                  closeDeleteConfirm
                }
              >
                Batal
              </button>

              <button
                className="delete-confirm-btn"
                onClick={
                  handleDelete
                }
                disabled={
                  deleting
                }
              >
                {deleting
                  ? "Menghapus..."
                  : "Hapus"}
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}