export const ADMIN_PERMISSIONS = [
  {
    key: "dashboard:view",
    label: "Dashboard",
    description: "View dashboard overview and admin API catalog.",
  },
  {
    key: "shippers:view",
    label: "Shippers",
    description: "View and manage shippers.",
  },
  {
    key: "customers:view",
    label: "Customers",
    description: "View and manage customers.",
  },
  {
    key: "shipments:view",
    label: "Shipments",
    description: "View shipments and tracking.",
  },
  {
    key: "horse_attributes:manage",
    label: "Horse Attributes",
    description: "Manage breeds, colors, and sexes.",
  },
  {
    key: "newsletter:manage",
    label: "Newsletter",
    description: "Manage subscribers and newsletters.",
  },
  {
    key: "notifications:view",
    label: "Notifications",
    description: "View and manage admin notifications.",
  },
  {
    key: "platform:manage",
    label: "Platform",
    description: "Manage platform settings, Stripe, payments, and subscriptions.",
  },
  {
    key: "legal:manage",
    label: "Legal",
    description: "Manage privacy policy and terms.",
  },
  {
    key: "account:manage",
    label: "Account Settings",
    description: "Access profile and settings pages.",
  },
];

export const ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map(
  (permission) => permission.key
);

export const hasAdminPermission = (user, permission) => {
  if (!permission) return true;
  if (user?.role === "super-admin") return true;
  return Array.isArray(user?.permissions) && user.permissions.includes(permission);
};
