import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";

import { useAuthStore } from "@/store/Auth";

import AdminLayout from "@/layouts/AdminLayout.vue";

import LoginView from "@/views/LoginView.vue";
import ProductosView from "@/views/ProductosView.vue";
import ProveedoresView from "@/views/ProveedoresView.vue";
import CategoriasView from "@/views/CategoriasView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: { titulo: "Iniciar sesion", soloInvitados: true },
  },
  {
    path: "/",
    component: AdminLayout,
    children: [
      {
        path: "productos",
        name: "productos",
        component: ProductosView,
        meta: { titulo: "Productos", requiereAuth: true },
      },
      {
        path: "proveedores",
        name: "proveedores",
        component: ProveedoresView,
        meta: { titulo: "Proveedores", requiereAuth: true },
      },
      {
        path: "categorias",
        name: "categorias",
        component: CategoriasView,
        meta: { titulo: "Categorias", requiereAuth: true },
      },
      {
        path: ":pathMatch(.*)*",
        name: "no-encontrado",
        component: NotFoundView,
        meta: { titulo: "Pagina no encontrada" },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

function protegerRutas(to) {
  const auth = useAuthStore();

  if (to.meta.requiereAuth === true && !auth.estaAutenticado) {
    Notify.create({
      type: "negative",
      message: "Debes iniciar sesion para entrar a esa pagina",
      icon: "lock",
      position: "top-right",
    });
    return { name: "login" };
  }

  if (to.meta.soloInvitados === true && auth.estaAutenticado) {
    return { name: "productos" };
  }

  return true;
}

router.beforeEach(protegerRutas);

router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITULO || "CatalogoBulk";
  document.title = to.meta.titulo ? `${to.meta.titulo} | ${base}` : base;
});
