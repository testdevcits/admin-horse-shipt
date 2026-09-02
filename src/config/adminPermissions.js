export const ADMIN_PERMISSION_GROUPS = [
  {
    key: "dashboard:view",
    label: "Dashboard",
    description: "View dashboard overview and admin API catalog.",
    permissions: [
      {
        key: "dashboard:view",
        label: "Admin overview",
        description: "View dashboard metrics and API catalog.",
      },
    ],
  },
  {
    key: "shippers:view",
    label: "Shippers",
    description: "View and manage shippers.",
    permissions: [
      {
        key: "shippers:list",
        label: "Shippers List",
        description: "View and manage shipper accounts.",
      },
    ],
  },
  {
    key: "customers:view",
    label: "Customers",
    description: "View and manage customers.",
    permissions: [
      {
        key: "customers:list",
        label: "Customers List",
        description: "View and manage customer accounts.",
      },
    ],
  },
  {
    key: "shipments:view",
    label: "Shipments",
    description: "View shipments and tracking.",
    permissions: [
      {
        key: "shipments:list",
        label: "All Shipments",
        description: "View shipments and tracking details.",
      },
    ],
  },
  {
    key: "horse_attributes:manage",
    label: "Horse Attributes",
    description: "Manage breeds, colors, and sexes.",
    permissions: [
      {
        key: "horse_attributes:breeds",
        label: "Breed List",
        description: "Manage horse breeds.",
      },
      {
        key: "horse_attributes:colors",
        label: "Colors",
        description: "Manage horse colors.",
      },
      {
        key: "horse_attributes:sexes",
        label: "Sexes",
        description: "Manage horse sex options.",
      },
    ],
  },
  {
    key: "newsletter:manage",
    label: "Newsletter",
    description: "Manage subscribers and newsletters.",
    permissions: [
      {
        key: "newsletter:subscribers",
        label: "Subscribers",
        description: "Manage subscribers and send newsletters.",
      },
    ],
  },
  {
    key: "notifications:view",
    label: "Notifications",
    description: "View and manage admin notifications.",
    permissions: [
      {
        key: "notifications:list",
        label: "All Notifications",
        description: "View and manage notification activity.",
      },
    ],
  },
  {
    key: "support:manage",
    label: "Support",
    description: "View and reply to shipper and customer support requests.",
    permissions: [
      {
        key: "support:list",
        label: "Support Inbox",
        description: "Manage support tickets and mark them resolved.",
      },
    ],
  },
  {
    key: "platform:manage",
    label: "Platform",
    description: "Manage platform settings, Stripe, payments, and subscriptions.",
    permissions: [
      {
        key: "platform:settings",
        label: "Platform Settings",
        description: "Manage platform fee and operational settings.",
      },
      {
        key: "platform:stripe_payments",
        label: "Stripe Payments",
        description: "View Stripe balances, transfers, and transactions.",
      },
      {
        key: "platform:subscriptions",
        label: "Subscription Settings",
        description: "Manage subscription plans and prices.",
      },
    ],
  },
  {
    key: "legal:manage",
    label: "Legal",
    description: "Manage privacy policy and terms.",
    permissions: [
      {
        key: "legal:privacy_policy",
        label: "Privacy Policy",
        description: "Manage privacy policy content.",
      },
      {
        key: "legal:terms_conditions",
        label: "Terms & Conditions",
        description: "Manage terms and conditions content.",
      },
    ],
  },
  {
    key: "account:manage",
    label: "Account Settings",
    description: "Access profile and settings pages.",
    permissions: [
      {
        key: "account:profile",
        label: "Admin Profile",
        description: "View and edit own profile.",
      },
      {
        key: "account:settings",
        label: "Settings",
        description: "Manage account and social media settings.",
      },
    ],
  },
];

export const ADMIN_PERMISSIONS = ADMIN_PERMISSION_GROUPS.flatMap(
  (group) => group.permissions
);

export const ADMIN_PERMISSION_KEYS = ADMIN_PERMISSIONS.map(
  (permission) => permission.key
);

export const LEGACY_PERMISSION_GRANTS = {
  "shippers:view": ["shippers:list"],
  "customers:view": ["customers:list"],
  "shipments:view": ["shipments:list"],
  "horse_attributes:manage": [
    "horse_attributes:breeds",
    "horse_attributes:colors",
    "horse_attributes:sexes",
  ],
  "newsletter:manage": ["newsletter:subscribers"],
  "notifications:view": ["notifications:list"],
  "support:manage": ["support:list"],
  "platform:manage": [
    "platform:settings",
    "platform:stripe_payments",
    "platform:subscriptions",
  ],
  "legal:manage": ["legal:privacy_policy", "legal:terms_conditions"],
  "account:manage": ["account:profile", "account:settings"],
};

export const hasAdminPermission = (user, permission) => {
  if (!permission) return true;
  if (user?.role === "super-admin") return true;
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  return permissions.some(
    (assignedPermission) =>
      assignedPermission === permission ||
      LEGACY_PERMISSION_GRANTS[assignedPermission]?.includes(permission)
  );
};

export const expandAdminPermissions = (permissions = []) => [
  ...new Set(
    permissions.flatMap((permission) => [
      ...(LEGACY_PERMISSION_GRANTS[permission] || []),
      ...(ADMIN_PERMISSION_KEYS.includes(permission) ? [permission] : []),
    ])
  ),
];
