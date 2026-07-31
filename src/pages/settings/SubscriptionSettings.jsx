import React, { useEffect, useState } from "react";
import { useStripeAdmin } from "../../context/StripeAdminContext";

const maskId = (id) => {
  if (!id) return "";
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}••••••${id.slice(-4)}`;
};

const IdField = ({ label, value }) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="mb-4">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-custom border border-gray-200 bg-light/60 px-3 py-2">
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-dark">
          {revealed ? value : maskId(value)}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-system-primary hover:text-tabActive"
        >
          {revealed ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 min-w-[56px] rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-system-primary hover:text-tabActive"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};

const StatusPill = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      active ? "bg-success-50 text-success-700" : "bg-danger/10 text-danger"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-success-600" : "bg-danger"
      }`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

/* =========================
    MODAL SHELL
========================= */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/50 px-4">
    <div className="w-full max-w-md animate-slide-fade-in rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-dark">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:bg-light hover:text-dark"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

const inputClass =
  "w-full rounded-custom border border-gray-200 px-3 py-2 text-sm text-dark focus:border-system-primary focus:outline-none focus:ring-1 focus:ring-system-primary";
const labelClass = "mb-1.5 block text-xs font-medium text-gray-500";

/* =========================
    CREATE PRICE MODAL
========================= */
const CreatePriceModal = ({ product, onClose }) => {
  const { createSubscriptionPrice, creatingPrice } = useStripeAdmin();
  const [form, setForm] = useState({
    amount: "",
    currency: "usd",
    interval: "month",
    intervalCount: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createSubscriptionPrice({
      productId: product.productId,
      amount: Number(form.amount),
      currency: form.currency,
      interval: form.interval,
      intervalCount: Number(form.intervalCount),
    });
    if (res.success) onClose();
  };

  return (
    <Modal title={`Add price · ${product.productName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className={inputClass}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="e.g. 29.00"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Currency</label>
            <input
              type="text"
              required
              maxLength={3}
              className={`${inputClass} uppercase`}
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value.toLowerCase() })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Interval</label>
            <select
              className={inputClass}
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Interval count</label>
          <input
            type="number"
            min="1"
            required
            className={inputClass}
            value={form.intervalCount}
            onChange={(e) =>
              setForm({ ...form, intervalCount: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-light"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creatingPrice}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {creatingPrice ? "Creating…" : "Create price"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* =========================
    EDIT PRICE MODAL
========================= */
const EditPriceModal = ({ plan, onClose }) => {
  const { updateSubscriptionPrice, updatingPrice } = useStripeAdmin();
  const [active, setActive] = useState(plan.active);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateSubscriptionPrice(plan.priceId, { active });
    if (res.success) onClose();
  };

  return (
    <Modal title="Edit price" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-custom bg-light/60 px-3 py-2 text-sm text-gray-500">
          ${plan.amount} {plan.currency.toUpperCase()} / {plan.interval}
          <div className="mt-1 text-xs text-gray-400">
            Stripe prices are immutable — only status can be changed here.
            Create a new price to change the amount.
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActive(true)}
              className={`flex-1 rounded-custom border px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-success-600 bg-success-50 text-success-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setActive(false)}
              className={`flex-1 rounded-custom border px-3 py-2 text-sm font-medium transition-colors ${
                !active
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-light"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updatingPrice || active === plan.active}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updatingPrice ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* =========================
    MAIN PAGE
========================= */
const SubscriptionSettings = () => {
  const { subscriptionProduct, fetchSubscriptionProduct, loading } =
    useStripeAdmin();

  const [createModalProduct, setCreateModalProduct] = useState(null);
  const [editModalPlan, setEditModalPlan] = useState(null);

  useEffect(() => {
    fetchSubscriptionProduct();
  }, [fetchSubscriptionProduct]);

  if (loading && !subscriptionProduct?.length) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 font-montserrat text-gray-400">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-gray-200 border-t-system-primary" />
        <p className="text-sm">Loading subscription data…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-montserrat text-dark sm:px-6">
      {/* Header */}
      <div className="mb-8 rounded-2xl bg-header px-6 py-6 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-dark">
          Subscription Settings
        </h1>
        <p className="mt-1 text-sm text-systemText/70">
          Manage Stripe products and pricing plans. IDs are masked by
          default — use Show or Copy as needed.
        </p>
      </div>

      {!subscriptionProduct?.length ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-gray-400">
          <h3 className="text-base font-medium text-gray-500">
            No subscription products found
          </h3>
          <p className="mt-1 text-sm">
            Create a product in Stripe to see it listed here.
          </p>
        </div>
      ) : (
        subscriptionProduct.map((product) => (
          <section
            key={product.productId}
            className="mb-6 animate-slide-fade-in rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
          >
            {/* Product header */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-dark">
                  {product.productName}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  {product.description || "No description provided"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-system-primary/10 px-3 py-1 text-xs font-semibold text-tabActive">
                  {product.subscriptionPlans?.length || 0} plan
                  {product.subscriptionPlans?.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => setCreateModalProduct(product)}
                  className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  + Add price
                </button>
              </div>
            </div>

            <IdField label="Product ID" value={product.productId} />

            {/* Plans */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {product.subscriptionPlans.map((plan) => (
                <div
                  key={plan.priceId}
                  className="rounded-xl border border-gray-200 bg-light/40 p-5 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold capitalize text-gray-500">
                      {plan.interval}
                      {plan.intervalCount > 1
                        ? ` × ${plan.intervalCount}`
                        : ""}
                    </span>
                    <StatusPill active={plan.active} />
                  </div>

                  <div className="mb-4 flex items-baseline gap-1.5">
                    <span className="text-[28px] font-bold leading-none tracking-tight text-primary">
                      ${plan.amount}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {plan.currency.toUpperCase()} / {plan.interval}
                    </span>
                  </div>

                  <IdField label="Price ID" value={plan.priceId} />

                  <button
                    type="button"
                    onClick={() => setEditModalPlan(plan)}
                    className="mt-1 w-full rounded-custom border border-gray-200 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-system-primary hover:text-tabActive"
                  >
                    Edit status
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {createModalProduct && (
        <CreatePriceModal
          product={createModalProduct}
          onClose={() => setCreateModalProduct(null)}
        />
      )}
      {editModalPlan && (
        <EditPriceModal
          plan={editModalPlan}
          onClose={() => setEditModalPlan(null)}
        />
      )}
    </div>
  );
};

export default SubscriptionSettings;