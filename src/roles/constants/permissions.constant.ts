export enum AppPermission {
  // Categories
  CATEGORY_CREATE = 'category.create',
  CATEGORY_UPDATE = 'category.update',
  CATEGORY_DELETE = 'category.delete',

  // Products
  PRODUCT_CREATE = 'product.create',
  PRODUCT_UPDATE = 'product.update',
  PRODUCT_DELETE = 'product.delete',

  // Orders
  ORDER_READ_ALL = 'order.read.all',
  ORDER_READ_SELF = 'order.read.self',
  ORDER_CREATE = 'order.create',
  ORDER_UPDATE_STATUS = 'order.update.status',

  // Addresses
  ADDRESS_MANAGE_SELF = 'address.manage.self',

  // Bookmarks & Basket
  BOOKMARK_MANAGE_SELF = 'bookmark.manage.self',
  BASKET_MANAGE_SELF = 'basket.manage.self',

  // Payments
  PAYMENT_PROCESS = 'payment.process',

  USERS_MANAGE = 'users.manage',
}

// تعریف دسترسی‌های هر نقش
export const ROLE_PERMISSIONS: Record<string, AppPermission[]> = {
  admin: Object.values(AppPermission), // دسترسی به همه‌چیز

  seller: [
    AppPermission.PRODUCT_CREATE,
    AppPermission.PRODUCT_UPDATE,
    AppPermission.PRODUCT_DELETE,
    AppPermission.ORDER_READ_ALL,
  ],

  customer: [
    AppPermission.ORDER_CREATE,
    AppPermission.ORDER_READ_SELF,
    AppPermission.ADDRESS_MANAGE_SELF,
    AppPermission.BOOKMARK_MANAGE_SELF,
    AppPermission.BASKET_MANAGE_SELF,
    AppPermission.PAYMENT_PROCESS,
  ],

  support: [AppPermission.ORDER_READ_ALL, AppPermission.ORDER_UPDATE_STATUS],
};
