"use client";

import "@/styles/detail-modal.css";

type IncomeItem = {
  pendapatan: number;
  keterangan: string;
};

type ExpenseItem = {
  pengeluaran: number;
  keterangan: string;
};

type Props = {
  open: boolean;
  date: Date | null;
  incomeList: IncomeItem[];
  expenseList: ExpenseItem[];
  onClose: () => void;
};

export default function DetailModal({
  open,
  date,
  incomeList,
  expenseList,
  onClose,
}: Props) {

  if (!open || !date)
    return null;

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

  const balance =
    totalIncome -
    totalExpense;

  const formatNumber =
    (num: number) =>
      num.toLocaleString(
        "id-ID"
      );

  return (
    <div
      className="detail-modal-overlay"
      onClick={onClose}
    >
      <div
        className="detail-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="detail-header">

          <div>

            <h2>
              Detail Transaksi
            </h2>

            <p>
              {date.toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>

          </div>

          <button
            onClick={onClose}
            className="close-btn"
          >
            ✕
          </button>

        </div>

        <div className="summary-cards">

          <div className="summary-card income">

            <span>
              Pemasukan
            </span>

            <strong>
              Rp{" "}
              {formatNumber(
                totalIncome
              )}
            </strong>

          </div>

          <div className="summary-card expense">

            <span>
              Pengeluaran
            </span>

            <strong>
              Rp{" "}
              {formatNumber(
                totalExpense
              )}
            </strong>

          </div>

          <div className="summary-card balance">

            <span>
              Selisih
            </span>

            <strong>
              Rp{" "}
              {formatNumber(
                balance
              )}
            </strong>

          </div>

        </div>

        <div className="comparison-grid">

          <div className="comparison-column">

            <div className="column-title income">
              Pemasukan
            </div>

            <div className="transaction-list">

              {incomeList.length ===
              0 ? (
                <div className="empty">
                  Tidak ada pemasukan
                </div>
              ) : (
                incomeList.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="transaction-card"
                    >
                      <strong>
                        {
                          item.keterangan
                        }
                      </strong>

                      <span>
                        Rp{" "}
                        {formatNumber(
                          item.pendapatan
                        )}
                      </span>
                    </div>
                  )
                )
              )}

            </div>

          </div>

          <div className="comparison-column">

            <div className="column-title expense">
              Pengeluaran
            </div>

            <div className="transaction-list">

              {expenseList.length ===
              0 ? (
                <div className="empty">
                  Tidak ada pengeluaran
                </div>
              ) : (
                expenseList.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="transaction-card"
                    >
                      <strong>
                        {
                          item.keterangan
                        }
                      </strong>

                      <span>
                        Rp{" "}
                        {formatNumber(
                          item.pengeluaran
                        )}
                      </span>
                    </div>
                  )
                )
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}