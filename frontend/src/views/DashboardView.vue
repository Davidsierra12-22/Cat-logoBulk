<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { get } from "@/services/api.service";
import { useAuthStore } from "@/store/Auth";
import { useGeneralStore } from "@/store/General";

const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();

const cargandoStats = ref(false);
const stats = ref({ productos: 0, categorias: 0, proveedores: 0, usuarios: 0 });

const metricas = [
  { campo: "productos", titulo: "Productos", icono: "inventory_2", color: "primary", bgColor: "blue-1" },
  { campo: "categorias", titulo: "Categorias", icono: "category", color: "orange", bgColor: "orange-1" },
  { campo: "proveedores", titulo: "Proveedores", icono: "local_shipping", color: "green", bgColor: "green-1" },
  { campo: "usuarios", titulo: "Usuarios", icono: "people", color: "purple", bgColor: "purple-1" },
];

const opciones = [
  { titulo: "Productos", subtitulo: "Gestionar catalogo de productos", icono: "inventory_2", ruta: "productos", color: "primary", bgColor: "blue-1" },
  { titulo: "Categorias", subtitulo: "Administrar categorias del catalogo", icono: "category", ruta: "categorias", color: "orange", bgColor: "orange-1" },
  { titulo: "Proveedores", subtitulo: "Distribuidores y proveedores", icono: "local_shipping", ruta: "proveedores", color: "green", bgColor: "green-1" },
  { titulo: "Usuarios", subtitulo: "Administrar usuarios del sistema", icono: "people", ruta: "usuarios", color: "purple", bgColor: "purple-1" },
  { titulo: "Importaciones", subtitulo: "Importar catalogo desde Excel", icono: "upload_file", ruta: "imports", color: "teal", bgColor: "teal-1" },
];

const cargarStats = async () => {
  cargandoStats.value = true;
  try {
    const [productos, categorias, proveedores, usuarios] = await Promise.all([
      get("/productos?limit=1"),
      get("/categorias"),
      get("/proveedores?limit=1"),
      get("/usuarios?limit=1"),
    ]);
    stats.value.productos = productos.total || 0;
    stats.value.categorias = Array.isArray(categorias) ? categorias.length : (categorias.total || 0);
    stats.value.proveedores = proveedores.total || 0;
    stats.value.usuarios = usuarios.total || 0;
  } catch (e) {
    console.error(e);
  } finally {
    cargandoStats.value = false;
  }
};

onMounted(cargarStats);

const cerrarSesion = () => {
  auth.cerrarSesion();
  router.push({ name: "login" });
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="titulo-vista">Panel de administracion</div>
          <p class="texto-suave text-subtitle2 q-mt-none">
            Estado general del catalogo y acceso rapido a las secciones
          </p>
        </div>
        <q-btn
          unelevated no-caps color="primary" icon="refresh"
          label="Actualizar" :loading="cargandoStats" @click="cargarStats"
        />
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="metrica in metricas" :key="metrica.campo" class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="kpi-card">
            <q-card-section class="row items-center no-wrap q-pa-md">
              <div class="kpi-icono rounded-borders" :class="`bg-${metrica.bgColor}`">
                <q-icon :name="metrica.icono" size="28px" :color="metrica.color" />
              </div>
              <div class="q-ml-md">
                <div v-if="cargandoStats" class="q-skeleton" style="width:60px;height:30px" />
                <div v-else class="kpi-numero" :class="`text-${metrica.color}`">
                  {{ stats[metrica.campo] }}
                </div>
                <div class="text-caption text-grey-7">{{ metrica.titulo }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="opcion in opciones" :key="opcion.ruta" class="col-12 col-sm-6 col-lg-3">
          <q-card
            flat bordered
            class="cursor-pointer hover-elevated full-height modulo-card"
            @click="router.push({ name: opcion.ruta })"
          >
            <div class="modulo-barra" :class="`bg-${opcion.color}`" />
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <div class="modulo-icono rounded-borders" :class="`bg-${opcion.bgColor}`">
                  <q-icon :name="opcion.icono" size="24px" :color="opcion.color" />
                </div>
                <div class="text-subtitle1 text-weight-bold q-ml-sm">{{ opcion.titulo }}</div>
              </div>
              <div class="text-caption text-grey-7 q-mb-sm">{{ opcion.subtitulo }}</div>
              <div class="row items-center text-caption text-grey-6">
                <q-icon name="arrow_forward" size="16px" class="q-mr-xs" />
                Entrar
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.hover-elevated {
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.kpi-card {
  border-radius: 12px;
  overflow: hidden;
}

.kpi-icono {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-numero {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
}

.modulo-card {
  border-radius: 12px;
  overflow: hidden;
}

.modulo-barra {
  height: 6px;
  width: 100%;
}

.modulo-icono {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>