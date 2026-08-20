import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref(null);

    const estaAutenticado = computed(() => !!token.value);

    function guardarSesion(respuesta) {
      token.value = respuesta.token;
    }

    function cerrarSesion() {
      token.value = null;
    }

    return {
      token,
      estaAutenticado,
      guardarSesion,
      cerrarSesion,
    };
  },
  {
    persist: true,
  }
);
