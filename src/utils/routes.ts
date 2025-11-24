export const routes = {
  // Public - Landing
  home: "/",
  about: "/quienes-somos",
  questions: "/preguntas-frecuentes",
  contact: "/contactenos",
  complaints_book: "/libro-reclamaciones",
  tyc: "/terminos-condiciones",
  privacy_policy: "/politica-privacidad",
  NotFound: "*",

  // Public - Auth
  login: "/login",
  register: "/registro",

  // Public - Shop
  shop: "/tienda",
  product: "/producto/",
  shop_cart: "/carrito",

  // Private - Shop & User profile
  checkout: "/checkout",
  profile_user: "/perfil/usuario",
  profile_cotization: "/perfil/cotizaciones/",
  cotizaciones: "/perfil/cotizaciones",

  //Admin Pages
  dashboard: "/dashboard",
  dashboard_profile: "/dashboard/profile",

  // Products Management
  dashboard_products: "/dashboard/products",
  dashboard_product: "/dashboard/product/",
  dashboard_product_new: "/dashboard/product/new",
  dashboard_product_edit: "/dashboard/product/edit/:id",

  // Categories Management
  dashboard_categories: "/dashboard/categories",
  dashboard_category: "/dashboard/category/:id",
  dashboard_category_new: "/dashboard/category/new",
  dashboard_category_edit: "/dashboard/category/edit/:id",

  // Cotizations Management
  dashboard_cotizations: "/dashboard/cotizaciones",
  dashboard_cotization: "/dashboard/cotizacion/:id",

  // Users Management
  dashboard_users: "/dashboard/usuarios",
  dashboard_user: "/dashboard/usuario/:id",
  dashboard_user_new: "/dashboard/usuario/nuevo",
  dashboard_user_edit: "/dashboard/usuario/edit/:id",

  // Messages Management
  dashboard_messages: "/dashboard/mensajes",
  dashboard_message: "/dashboard/mensaje/:id",
};

export const publicRoutes = [
  routes.home,
  routes.about,
  routes.questions,
  routes.contact,
  routes.complaints_book,
  routes.tyc,
  routes.privacy_policy,
];
