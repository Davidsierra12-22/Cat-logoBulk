<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "@/store/Auth";
import { useGeneralStore } from "@/store/General";

const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();

const opciones = [
  {
    titulo: "Productos",
    subtitulo: "Gestionar catalogo de productos",
    icono: "inventory_2",
    ruta: "productos",
    color: "primary",
    bgColor: "blue-1",
  },
  {
    titulo: "Categorias",
    subtitulo: "Administrar categorias del catalogo",
    icono: "category",
    ruta: "categorias",
    color: "orange",
    bgColor: "orange-1",
  },
  {
    titulo: "Proveedores",
    subtitulo: "Distribuidores y proveedores",
    icono: "local_shipping",
    ruta: "proveedores",
    color: "green",
    bgColor: "green-1",
  },
  {
    titulo: "Usuarios",
    subtitulo: "Administrar usuarios del sistema",
    icono: "people",
    ruta: "usuarios",
    color: "purple",
    bgColor: "purple-1",
  },
];

const cerrarSesion = () => {
  auth.cerrarSesion();
  router.push({ name: "login" });
};
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="admin_panel_settings" class="q-mr-sm" />
          {{ general.titulo }} - Admin
        </q-toolbar-title>
        <q-btn
          flat dense no-caps label="Catalogo"
          icon="storefront"
          @click="router.push({ name: 'catalogo' })"
        />
        <q-btn flat dense round icon="logout" @click="cerrarSesion">
          <q-tooltip>Cerrar sesion</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="q-mb-lg">
          <div class="text-h5 text-weight-bold">Panel de administracion</div>
          <div class="text-subtitle2 text-grey-7">Selecciona una seccion para gestionar</div>
        </div>

        <div class="row q-col-gutter-md">
          <div v-for="opcion in opciones" :key="opcion.ruta" class="col-12 col-sm-6 col-lg-3">
            <q-card
              flat bordered
              class="cursor-pointer hover-elevated full-height"
              @click="router.push({ name: opcion.ruta })"
            >
              <q-card-section class="text-center q-py-lg">
                <q-icon :name="opcion.icono" size="48px" :color="opcion.color" class="q-mb-md" />
                <div class="text-h6 text-weight-bold">{{ opcion.titulo }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">{{ opcion.subtitulo }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.hover-elevated {
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}
</style>
