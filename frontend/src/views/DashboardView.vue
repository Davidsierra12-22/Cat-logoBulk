<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { get } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";

const router = useRouter();
const general = useGeneralStore();

const opciones = [
  { titulo: "Productos", subtitulo: "Gestionar catalogo", icono: "inventory_2", ruta: "productos", color: "primary", bgColor: "blue-1" },
  { titulo: "Categorias", subtitulo: "Administrar categorias", icono: "category", ruta: "categorias", color: "orange", bgColor: "orange-1" },
  { titulo: "Proveedores", subtitulo: "Distribuidores", icono: "local_shipping", ruta: "proveedores", color: "green", bgColor: "green-1" },
  { titulo: "Usuarios", subtitulo: "Administrar sistema", icono: "people", ruta: "usuarios", color: "purple", bgColor: "purple-1" },
  { titulo: "Importaciones", subtitulo: "Importar en Excel", icono: "upload_file", ruta: "imports", color: "teal", bgColor: "teal-1" },
];

const cargando = ref(false);
const productos = ref([]);
const totalProductos = ref(0);
const categorias = ref([]);
const totalProveedores = ref(0);
const totalUsuarios = ref(0);
const error = ref(false);

const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor || 0);

const fechaHoy = computed(() => {
  const hoy = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return hoy.charAt(0).toUpperCase() + hoy.slice(1);
});

const kpis = computed(() => [
  {
    titulo: "Productos",
    icono: "inventory_2",
    valor: totalProductos.value,
    sub: `${productos.value.filter((p) => p.activo !== false).length} activos`,
    gradiente: "linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
  },
  {
    titulo: "Categorias",
    icono: "category",
    valor: categorias.value.length,
    sub: "del catalogo",
    gradiente: "linear-gradient(135deg, #E65100 0%, #FFA726 100%)",
  },
  {
    titulo: "Proveedores",
    icono: "local_shipping",
    valor: totalProveedores.value,
    sub: "registrados",
    gradiente: "linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)",
  },
  {
    titulo: "Usuarios",
    icono: "people",
    valor: totalUsuarios.value,
    sub: "del sistema",
    gradiente: "linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)",
  },
]);

const ultimosProductos = computed(() => productos.value.slice(0, 5));

const estadoProducto = (p) => {
  if (p.activo === false) return { label: "Inactivo", color: "negative" };
  if (p.stock <= 0) return { label: "Agotado", color: "warning" };
  return { label: "Disponible", color: "positive" };
};

const paleta = [
  "primary",
  "orange",
  "green",
  "purple",
  "teal",
  "indigo",
  "pink",
  "brown",
  "deep-orange",
  "light-blue",
];

const distribucionCategorias = computed(() => {
  const contador = {};
  productos.value.forEach((p) => {
    contador[p.categoria] = (contador[p.categoria] || 0) + 1;
  });

  const nombres = categorias.value.reduce((mapa, c) => {
    mapa[c.slug] = c.nombre;
    return mapa;
  }, {});

  const total = Math.max(1, Object.values(contador).reduce((a, b) => a + b, 0));

  return Object.entries(contador)
    .map(([slug, count], i) => ({
      slug,
      nombre: nombres[slug] || slug,
      count,
      color: paleta[i % paleta.length],
      porcentaje: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
});

const cargarDatos = async () => {
  cargando.value = true;
  error.value = false;
  try {
    const [resProductos, resCategorias, resProveedores, resUsuarios] = await Promise.all([
      get("/productos?limit=100"),
      get("/categorias"),
      get("/proveedores?limit=1"),
      get("/usuarios?limit=1"),
    ]);
    productos.value = resProductos.data || [];
    totalProductos.value = resProductos.total || 0;
    categorias.value = resCategorias || [];
    totalProveedores.value = resProveedores.total || 0;
    totalUsuarios.value = resUsuarios.total || 0;
  } catch (e) {
    console.error(e);
    error.value = true;
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarDatos);
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <div class="hero-banner rounded-borders q-pa-lg q-mb-lg text-white">
        <div class="row items-center justify-between no-wrap">
          <div>
            <div class="text-h5 text-weight-bold">Panel de administracion</div>
            <div class="text-body1 text-white q-opacity-80 q-mt-xs">{{ fechaHoy }}</div>
          </div>
          <q-btn
            unelevated no-caps outline color="white" icon="refresh" label="Actualizar"
            :loading="cargando" @click="cargarDatos"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="kpi in kpis" :key="kpi.titulo" class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="kpi-card text-white" :style="{ background: kpi.gradiente }">
            <q-card-section class="row items-center justify-between q-pa-md">
              <div>
                <div class="kpi-valor">{{ kpi.valor }}</div>
                <div class="kpi-titulo">{{ kpi.titulo }}</div>
                <div class="text-white q-opacity-75 text-caption q-mt-xs">{{ kpi.sub }}</div>
              </div>
              <div class="kpi-icono">
                <q-icon :name="kpi.icono" size="34px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-lg-8">
          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center justify-between q-pb-none q-pt-md q-px-lg">
              <div class="text-subtitle1 text-weight-bold">Ultimos productos añadidos</div>
              <q-btn flat dense no-caps color="primary" icon="launch" :to="{ name: 'productos' }">
                Ver todos
              </q-btn>
            </q-card-section>

            <q-card-section class="q-pa-lg" :class="{ 'text-center': error }">
              <q-inner-loading :showing="cargando" color="primary" />
              <div v-if="error" class="text-negative">No se pudieron cargar los datos</div>
              <q-list v-else-if="ultimosProductos.length" separator>
                <q-item v-for="p in ultimosProductos" :key="p._id" class="q-pa-sm">
                  <q-item-section avatar>
                    <q-avatar rounded :color="estadoProducto(p).color" text-color="white" font-size="16px">
                      {{ p.nombre.charAt(0).toUpperCase() }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ p.nombre }}</q-item-label>
                    <q-item-label caption>
                      <q-icon name="tag" size="13px" class="q-mr-xs" />
                      {{ p.sku }}
                      <span class="q-ml-md">
                        <q-icon name="category" size="13px" class="q-mr-xs" />
                        {{ categorias.find((c) => c.slug === p.categoria)?.nombre || p.categoria }}
                      </span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side class="items-end">
                    <div class="text-weight-bold">{{ formatearPrecio(p.precio) }}</div>
                    <q-badge :color="estadoProducto(p).color" outline :label="estadoProducto(p).label" />
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="q-pa-md">
                <q-icon name="inventory_2" size="42px" color="grey-4" />
                <div class="empty-title">Aun no hay productos</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-4">
          <q-card flat bordered class="panel-card">
            <q-card-section class="q-pb-none q-pt-md q-px-lg">
              <div class="text-subtitle1 text-weight-bold">Productos por categoria</div>
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <q-inner-loading :showing="cargando" color="primary" />
              <template v-if="distribucionCategorias.length">
                <div v-for="cat in distribucionCategorias" :key="cat.slug" class="q-mb-md">
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-body2 text-weight-medium">{{ cat.nombre }}</div>
                    <div class="text-caption text-grey-7">
                      {{ cat.count }} · {{ cat.porcentaje }}%
                    </div>
                  </div>
                  <q-linear-progress
                    :value="cat.porcentaje / 100" size="10px" :color="cat.color" rounded
                    class="q-mt-xs"
                  />
                </div>
              </template>
              <div v-else class="text-center q-pa-md">
                <q-icon name="category" size="42px" color="grey-4" />
                <div class="empty-title">Sin categorias</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="text-subtitle1 text-weight-bold q-mb-sm">Accesos rapidos</div>
      <div class="row q-col-gutter-md">
        <div
          v-for="opcion in opciones" :key="opcion.ruta"
          class="col-12 col-sm-6 col-lg"
        >
          <q-card
            flat bordered class="cursor-pointer hover-elevated full-height modulo-card q-pa-md"
            @click="router.push({ name: opcion.ruta })"
          >
            <q-card-section class="q-pa-none row items-center">
              <div class="modulo-icono rounded-borders" :class="`bg-${opcion.bgColor}`">
                <q-icon :name="opcion.icono" size="22px" :color="opcion.color" />
              </div>
              <div class="q-ml-sm">
                <div class="text-subtitle2 text-weight-bold">{{ opcion.titulo }}</div>
                <div class="text-caption text-grey-7">{{ opcion.subtitulo }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.hero-banner {
  background: linear-gradient(120deg, #0d47a1 0%, #1565c0 45%, #00838f 100%);
  box-shadow: 0 6px 18px rgba(21, 101, 192, 0.35);
}

.kpi-card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.10);
}

.kpi-valor {
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
}

.kpi-titulo {
  font-size: 15px;
  font-weight: 600;
  opacity: 0.92;
}

.kpi-icono {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.panel-card {
  border-radius: 14px;
  height: 100%;
}

.hover-elevated {
  transition: all 0.2s ease;
  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);
    transform: translateY(-2px);
  }
}

.modulo-card {
  border-radius: 12px;
  overflow: hidden;
}

.modulo-icono {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>