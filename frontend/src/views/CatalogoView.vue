<script setup>
import { onMounted, ref } from "vue";

import { get } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import logo from "@/assets/logo.svg";

const general = useGeneralStore();

const productos = ref([]);
const cargando = ref(false);
const pagina = ref(1);
const totalPaginas = ref(1);
const filtroCategoria = ref("");

const cargar = async () => {
  cargando.value = true;
  try {
    let url = `/catalogo?page=${pagina.value}&limit=12`;
    if (filtroCategoria.value) url += `&categoria=${filtroCategoria.value}`;
    const respuesta = await get(url);
    productos.value = respuesta.data;
    totalPaginas.value = Math.ceil(respuesta.total / 12) || 1;
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold row items-center">
          <img :src="logo" width="32" height="32" class="q-mr-sm" />
          {{ general.titulo }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="text-center q-mb-xl">
          <div class="text-h4 text-weight-bold">{{ general.titulo }}</div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Catalogo de productos disponibles
          </div>
        </div>

        <div class="row q-col-gutter-sm q-mb-lg" style="max-width:500px;margin:0 auto">
          <div class="col-12">
            <q-input
              v-model="filtroCategoria"
              outlined dense
              label="Buscar por categoria"
              clearable
              @clear="filtroCategoria = ''; pagina = 1; cargar()"
              @keyup.enter="pagina = 1; cargar()"
            >
              <template #append>
                <q-btn flat dense icon="search" @click="pagina = 1; cargar()" />
              </template>
            </q-input>
          </div>
        </div>

        <div v-if="cargando" class="row q-col-gutter-md">
          <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card flat bordered>
              <q-skeleton type="rect" height="180px" />
              <q-card-section>
                <q-skeleton type="text" width="60%" />
                <q-skeleton type="text" width="40%" />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else-if="productos.length === 0" class="text-center q-py-xl">
          <q-icon name="inventory_2" size="64px" color="grey-4" />
          <div class="text-h6 text-grey-6 q-mt-md">No hay productos disponibles</div>
        </div>

        <div v-else class="row q-col-gutter-md">
          <div v-for="p in productos" :key="p._id" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <q-card flat bordered class="full-height">
              <q-img
                v-if="p.imagenUrl"
                :src="p.imagenUrl"
                :alt="p.nombre"
                height="180px"
                fit="cover"
              />
              <q-card-section v-else class="bg-grey-3 flex flex-center" style="height:180px">
                <q-icon name="image" size="48px" color="grey-5" />
              </q-card-section>

              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">{{ p.nombre }}</div>
                <div class="text-caption text-grey-7 q-mb-xs">SKU: {{ p.sku }}</div>
                <div class="row items-center justify-between">
                  <div class="text-h6 text-primary">${{ Number(p.precio).toFixed(2) }}</div>
                  <q-badge :color="p.stock > 0 ? 'positive' : 'negative'" :label="p.stock > 0 ? `Stock: ${p.stock}` : 'Sin stock'" />
                </div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-chip dense size="sm" color="blue-1" text-color="blue-9">
                  {{ p.categoria }}
                </q-chip>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row justify-center q-mt-lg">
          <q-pagination v-model="pagina" :max="totalPaginas" color="primary" flat @update:model-value="cargar" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
