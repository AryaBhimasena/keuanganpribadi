"use client";

import {
  useEffect,
  useState,
} from "react";

import "@/styles/input-modal.css";

type InputType =
  | "income"
  | "expense";

type HistoryItem = {
  id: number;
  rowIndex: number;
  description: string;
  amount: number;
  tanggal: number;
  bulan: number;
  tahun: number;
  date: string;
};

type InputModalProps = {
  open: boolean;
  type: InputType;
  initialDate: Date | null;
  onSuccess: () => Promise<void>;
  onClose: () => void;
};

const BASE_URL =
  "https://script.google.com/macros/s/AKfycbxLUHemZUZjplprrdjy61hh5-68YZAT-2Ob9u4jROiRIT3Q4IRtmojk2wPC-YCscnAAZA/exec";

export default function InputModal({
  open,
  type,
  initialDate,
  onSuccess,
  onClose,
}: InputModalProps) {

  const today =
    new Date();

  const [selectedDate,
    setSelectedDate] =
    useState(
      today
        .toISOString()
        .split("T")[0]
    );

  const selected =
    new Date(
      selectedDate
    );

  const [tanggal,
    setTanggal] =
    useState(
      selected
        .getDate()
        .toString()
    );

  const [bulan,
    setBulan] =
    useState(
      (
        selected.getMonth() + 1
      ).toString()
    );

  const [tahun,
    setTahun] =
    useState(
      selected
        .getFullYear()
        .toString()
    );

  const [nominal,
    setNominal] =
    useState("");

  const [keterangan,
    setKeterangan] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const [historyData,
    setHistoryData] =
    useState<
      HistoryItem[]
    >([]);

  const [editMode,
    setEditMode] =
    useState(false);

  const [selectedRowIndex,
    setSelectedRowIndex] =
    useState<
      number | null
    >(null);

  const isIncome =
    type === "income";

  const modalTitle = isIncome
    ? editMode
      ? "Edit Pemasukan"
      : "Input Pemasukan"
    : editMode
    ? "Edit Pengeluaran"
    : "Input Pengeluaran";

  const totalAmount =
    historyData.reduce(
      (acc, item) =>
        acc + item.amount,
      0
    );

  const formatNumber = (
    num: number
  ) =>
    num.toLocaleString(
      "id-ID"
    );

  const formatDate = (
    tanggal: number,
    bulan: number,
    tahun: number
  ) => {

    const date =
      new Date(
        tahun,
        bulan - 1,
        tanggal
      );

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const syncDateFields =
    (
      dateString: string
    ) => {

      const date =
        new Date(
          dateString
        );

      setTanggal(
        date
          .getDate()
          .toString()
      );

      setBulan(
        (
          date.getMonth() + 1
        ).toString()
      );

      setTahun(
        date
          .getFullYear()
          .toString()
      );
    };

  const changeDate =
    (
      direction:
        | "prev"
        | "next"
    ) => {

      const current =
        new Date(
          selectedDate
        );

      if (
        direction ===
        "prev"
      ) {

        current.setDate(
          current.getDate() -
            1
        );

      } else {

        current.setDate(
          current.getDate() +
            1
        );
      }

      const formatted =
        current
          .toISOString()
          .split("T")[0];

      setSelectedDate(
        formatted
      );

      syncDateFields(
        formatted
      );
    };

  const fetchHistory =
    async () => {

      try {

        const action =
          isIncome
            ? "getMonthlyIncome"
            : "getMonthlyExpense";

        const response =
          await fetch(
            `${BASE_URL}?action=${action}&bulan=${bulan}&tahun=${tahun}`
          );

        const result =
          await response.json();

        if (
          !result.success
        ) {

          return;
        }

        const filteredData =
          result.data.filter(
            (
              item: any
            ) =>
              Number(
                item.tanggal
              ) ===
              Number(
                tanggal
              )
          );

        const mappedData =
          filteredData.map(
            (
              item: any,
              index: number
            ) => {

              return {
                id:
                  index + 1,

                rowIndex:
                  item.rowIndex,

                description:
                  item.keterangan ||
                  "-",

                amount:
                  isIncome
                    ? Number(
                        item.pendapatan
                      )
                    : Number(
                        item.pengeluaran
                      ),

                tanggal:
                  item.tanggal,

                bulan:
                  item.bulan,

                tahun:
                  item.tahun,

                date:
                  formatDate(
                    item.tanggal,
                    item.bulan,
                    item.tahun
                  ),
              };
            }
          );

        setHistoryData(
          mappedData
        );

      } catch (err) {

        console.error(err);
      }
    };

  useEffect(() => {

    if (open) {

      fetchHistory();
    }

  }, [
    open,
    type,
    tanggal,
    bulan,
    tahun,
  ]);

  const resetForm =
    () => {

      syncDateFields(
        selectedDate
      );

      setNominal("");
      setKeterangan("");

      setEditMode(
        false
      );

      setSelectedRowIndex(
        null
      );
    };

  const handleSelectHistory =
    (
      item: HistoryItem
    ) => {

      setEditMode(true);

      setSelectedRowIndex(
        item.rowIndex
      );

      setTanggal(
        item.tanggal.toString()
      );

      setBulan(
        item.bulan.toString()
      );

      setTahun(
        item.tahun.toString()
      );

      setNominal(
        item.amount.toString()
      );

      setKeterangan(
        item.description
      );
    };

  const handleSubmit =
    async (
      e:
        React.FormEvent<HTMLFormElement>
    ) => {

      e.preventDefault();

      try {

        setLoading(true);

        const action =
          editMode
            ? isIncome
              ? "updateIncome"
              : "updateExpense"
            : isIncome
            ? "createIncome"
            : "createExpense";

        const params =
          new URLSearchParams();

        params.append(
          "action",
          action
        );

        if (
          editMode &&
          selectedRowIndex
        ) {

          params.append(
            "rowIndex",
            selectedRowIndex.toString()
          );
        }

        params.append(
          "tanggal",
          tanggal
        );

        params.append(
          "bulan",
          bulan
        );

        params.append(
          "tahun",
          tahun
        );

        params.append(
          isIncome
            ? "pendapatan"
            : "pengeluaran",

          nominal
        );

        params.append(
          "keterangan",
          keterangan
        );

        const response =
          await fetch(
            `${BASE_URL}?${params.toString()}`
          );

        const result =
          await response.json();

        if (
          !result.success
        ) {

          throw new Error(
            result.message
          );
        }

        await fetchHistory();
		await onSuccess();

        resetForm();

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  const handleDelete =
    async () => {

      if (
        !selectedRowIndex
      ) {

        return;
      }

      const confirmDelete =
        window.confirm(
          "Hapus transaksi ini?"
        );

      if (
        !confirmDelete
      ) {

        return;
      }

      try {

        setLoading(true);

        const action =
          isIncome
            ? "deleteIncome"
            : "deleteExpense";

        const response =
          await fetch(
            `${BASE_URL}?action=${action}&rowIndex=${selectedRowIndex}`
          );

        const result =
          await response.json();

        if (
          !result.success
        ) {

          throw new Error(
            result.message
          );
        }

        await fetchHistory();
		await onSuccess();

        resetForm();

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

  const emptyState =
    historyData.length === 0;

  if (!open) return null;

useEffect(() => {

  if (initialDate) {

    const formatted =
      initialDate
        .toISOString()
        .split("T")[0];

    setSelectedDate(
      formatted
    );

    syncDateFields(
      formatted
    );
  }

}, [initialDate]);

  return (
    <div
      className="input-modal-overlay"
      onClick={onClose}
    >
      <div
        className="input-modal-container"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="input-modal-left">

          <div className="input-modal-header">

            <div>

              <span className={`modal-badge ${
                isIncome
                  ? "income"
                  : "expense"
              }`}>
                {editMode
                  ? "Edit"
                  : isIncome
                  ? "Pemasukan"
                  : "Pengeluaran"}
              </span>

              <h2>
                {modalTitle}
              </h2>

              <p>
                Kelola transaksi
                keuangan harian
              </p>

            </div>

            <button
              className="modal-close-btn"
              onClick={onClose}
            >
              ✕
            </button>

          </div>

          <form
            className="input-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="form-row">

              <div className="form-group">

                <label>
                  Tanggal
                </label>

                <input
                  type="number"
                  value={
                    tanggal
                  }
                  onChange={(e) =>
                    setTanggal(
                      e.target
                        .value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Bulan
                </label>

                <input
                  type="number"
                  value={bulan}
                  onChange={(e) =>
                    setBulan(
                      e.target
                        .value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Tahun
                </label>

                <input
                  type="number"
                  value={tahun}
                  onChange={(e) =>
                    setTahun(
                      e.target
                        .value
                    )
                  }
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                {isIncome
                  ? "Pendapatan"
                  : "Pengeluaran"}
              </label>

              <input
                type="number"
                placeholder="Masukkan nominal"
                value={
                  nominal
                }
                onChange={(e) =>
                  setNominal(
                    e.target
                      .value
                  )
                }
              />

            </div>

            <div className="form-group">

              <label>
                Keterangan
              </label>

              <textarea
                rows={5}
                value={
                  keterangan
                }
                onChange={(e) =>
                  setKeterangan(
                    e.target
                      .value
                  )
                }
              />

            </div>

            <div className="input-form-footer">

              {editMode && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={
                    handleDelete
                  }
                >
                  Hapus
                </button>
              )}

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  resetForm
                }
              >
                Reset
              </button>

              <button
                type="submit"
                className={`submit-btn ${
                  isIncome
                    ? "income"
                    : "expense"
                }`}
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : editMode
                  ? "Update"
                  : "Simpan"}
              </button>

            </div>

          </form>

        </div>

        <div className="input-modal-right">

          <div className="history-header">

            <div>

              <span>
                Riwayat Transaksi
              </span>

              <h3>
                {isIncome
                  ? "Daftar Pemasukan"
                  : "Daftar Pengeluaran"}
              </h3>

            </div>

            <div className={`history-total ${
              isIncome
                ? "income"
                : "expense"
            }`}>
              Rp{" "}
              {formatNumber(
                totalAmount
              )}
            </div>

          </div>

          <div className="history-date-selector">

            <button
              className="date-nav-btn"
              onClick={() =>
                changeDate(
                  "prev"
                )
              }
            >
              ←
            </button>

            <input
              type="date"
              value={
                selectedDate
              }
              onChange={(e) => {

                setSelectedDate(
                  e.target.value
                );

                syncDateFields(
                  e.target.value
                );
              }}
            />

            <button
              className="date-nav-btn"
              onClick={() =>
                changeDate(
                  "next"
                )
              }
            >
              →
            </button>

          </div>

          <div className="history-list">

            {emptyState && (
              <div className="history-empty">
                Belum ada transaksi
              </div>
            )}

            {historyData.map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`history-card ${
                    selectedRowIndex ===
                    item.rowIndex
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectHistory(
                      item
                    )
                  }
                >

                  <div className="history-card-left">

                    <div className={`history-indicator ${
                      isIncome
                        ? "income"
                        : "expense"
                    }`}
                    />

                    <div className="history-content">

                      <strong>
                        {
                          item.description
                        }
                      </strong>

                      <span>
                        {
                          item.date
                        }
                      </span>

                    </div>

                  </div>

                  <div className={`history-amount ${
                    isIncome
                      ? "income"
                      : "expense"
                  }`}>
                    Rp{" "}
                    {formatNumber(
                      item.amount
                    )}
                  </div>

                </button>
              )
            )}

          </div>

        </div>

      </div>
    </div>
  );
}