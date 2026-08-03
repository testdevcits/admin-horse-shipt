import React, { useEffect, useState } from "react";
import {
  FiPackage,
  FiDollarSign,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheck,
  FiToggleRight,
  FiXCircle,
  FiX,
} from "react-icons/fi";
import { useStripeAdmin } from "../../context/StripeAdminContext";
import PageLoader from "../../components/common/PageLoader";

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
      <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-slate-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-950">
        <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-[13px] text-gray-700 dark:text-gray-300">
          {revealed ? value : maskId(value)}
        </code>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          className="flex flex-shrink-0 items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:border-[#BF9B53] hover:text-[#BF9B53] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {revealed ? <FiEyeOff size={13} /> : <FiEye size={13} />}
          {revealed ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-shrink-0 min-w-[68px] items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:border-[#BF9B53] hover:text-[#BF9B53] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};

const StatusPill = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
      active
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        active ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

/* =========================
    MODAL SHELL
========================= */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-400 hover:bg-slate-50 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#BF9B53] focus:ring-2 focus:ring-[#BF9B53]/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400";

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
            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creatingPrice}
            className="inline-flex items-center gap-2 rounded-md bg-[#BF9B53] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#997C42] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiPlus size={14} />
            {creatingPrice ? "Creating..." : "Create price"}
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
  const [amount, setAmount] = useState(plan.amount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await updateSubscriptionPrice(plan.priceId, {
      active,
      amount: Number(amount),
    });
    if (res.success) onClose();
  };

  return (
    <Modal title="Edit price" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-md border border-gray-100 bg-slate-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
          ${plan.amount} {plan.currency.toUpperCase()} / {plan.interval}
          <div className="mt-1 text-xs text-gray-400">
            Stripe prices are immutable. Changing amount creates a new active
            price and deactivates this old price automatically.
          </div>
        </div>

        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            className={inputClass}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActive(true)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-gray-300 text-gray-500 hover:border-gray-400 dark:border-gray-700"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setActive(false)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                !active
                  ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : "border-gray-300 text-gray-500 hover:border-gray-400 dark:border-gray-700"
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
            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              updatingPrice ||
              (active === plan.active && Number(amount) === Number(plan.amount))
            }
            className="rounded-md bg-[#BF9B53] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#997C42] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatingPrice ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* =========================
    DEACTIVATE CONFIRM MODAL
========================= */
const DeactivateConfirmModal = ({ plan, onClose, onConfirm, isDeactivating }) => (
  <Modal title="Deactivate price" onClose={onClose}>
    <div className="space-y-4">
      <div className="rounded-md border border-red-100 bg-red-50 px-3 py-3 text-sm dark:border-red-500/20 dark:bg-red-500/10">
        <p className="font-semibold text-gray-900 dark:text-white">
          Deactivate ${plan.amount} {plan.currency.toUpperCase()} /{" "}
          {plan.interval}?
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Existing subscribers keep their plan, but new customers won't be
          able to subscribe at this price. This can be reversed from Edit
          status.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-slate-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeactivating}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiXCircle size={14} />
          {isDeactivating ? "Deactivating..." : "Deactivate"}
        </button>
      </div>
    </div>
  </Modal>
);

/* =========================
    MAIN PAGE
========================= */
const SubscriptionSettings = () => {
  const {
    subscriptionProduct,
    fetchSubscriptionProduct,
    loading,
    deactivateSubscriptionPrice,
  } = useStripeAdmin();

  const [createModalProduct, setCreateModalProduct] = useState(null);
  const [editModalPlan, setEditModalPlan] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  useEffect(() => {
    fetchSubscriptionProduct();
  }, [fetchSubscriptionProduct]);

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivatingId(deactivateTarget.priceId);
    const res = await deactivateSubscriptionPrice(deactivateTarget.priceId);
    setDeactivatingId(null);
    if (res.success) setDeactivateTarget(null);
  };

  if (loading && !subscriptionProduct?.length) {
    return <PageLoader text="Loading subscription data..." variant="spinner" />;
  }

  return (
    <div className="space-y-6 font-montserrat">
      {/* Header — matches AdminProfile eyebrow/title pattern */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#BF9B53]">
          Billing
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          Subscription Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
          Manage Stripe products and pricing plans. IDs are masked by
          default — use Show or Copy as needed.
        </p>
      </div>

      {!subscriptionProduct?.length ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
            No subscription products found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a product in Stripe to see it listed here.
          </p>
        </div>
      ) : (
        subscriptionProduct.map((product) => (
          <section
            key={product.productId}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Product header — icon badge, same as AdminProfile sections */}
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-[#BF9B53]/10 text-[#BF9B53]">
                  <FiPackage size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    {product.productName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.description || "No description provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md border border-gray-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
                  {product.subscriptionPlans?.length || 0} plan
                  {product.subscriptionPlans?.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={() => setCreateModalProduct(product)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#BF9B53] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#997C42]"
                >
                  <FiPlus size={13} />
                  Add price
                </button>
              </div>
            </div>

            <IdField label="Product ID" value={product.productId} />

            {/* Plans */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {product.subscriptionPlans.map((plan) => (
                <div
                  key={plan.priceId}
                  className="rounded-md border border-gray-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <FiDollarSign size={13} className="text-[#BF9B53]" />
                      {plan.interval}
                      {plan.intervalCount > 1
                        ? ` × ${plan.intervalCount}`
                        : ""}
                    </span>
                    <StatusPill active={plan.active} />
                  </div>

                  <div className="mb-4 flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                      ${plan.amount}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {plan.currency.toUpperCase()} / {plan.interval}
                    </span>
                  </div>

                  <IdField label="Price ID" value={plan.priceId} />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditModalPlan(plan)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white py-1.5 text-xs font-bold text-gray-600 transition hover:border-[#BF9B53] hover:text-[#BF9B53] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                    >
                      <FiToggleRight size={14} />
                      Edit status
                    </button>

                    {plan.active && (
                      <button
                        type="button"
                        onClick={() => setDeactivateTarget(plan)}
                        disabled={deactivatingId === plan.priceId}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-gray-900"
                      >
                        <FiXCircle size={14} />
                        {deactivatingId === plan.priceId
                          ? "Deactivating..."
                          : "Deactivate"}
                      </button>
                    )}
                  </div>
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
      {deactivateTarget && (
        <DeactivateConfirmModal
          plan={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onConfirm={handleConfirmDeactivate}
          isDeactivating={deactivatingId === deactivateTarget.priceId}
        />
      )}
    </div>
  );
};

export default SubscriptionSettings;
