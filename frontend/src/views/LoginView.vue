<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { post } from "@/services/api.service";
import { useAuthStore } from "@/store/Auth";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { requerido, esEmail, minimo } from "@/utils/reglas";
import logo from "@/assets/logo.svg";

const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const formulario = ref({ email: "", password: "" });
const verPassword = ref(false);
const enviando = ref(false);

const iniciarSesion = async () => {
  enviando.value = true;

  try {
    const respuesta = await post("/auth/login", {
      email: formulario.value.email.trim(),
      password: formulario.value.password,
    });

    auth.guardarSesion(respuesta);
    notificarOk(`Bienvenido`);
    router.push({ name: "admin" });
  } catch (e) {
    notificarError(e);
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div class="window-height flex flex-center q-pa-md">
    <div class="columna-login">
      <q-card flat class="tarjeta">
        <q-card-section class="text-center q-pb-none">
          <img :src="logo" alt="Logo" width="56" height="56" />
          <div class="text-h6 text-weight-bold q-mt-sm">{{ general.titulo }}</div>
          <p class="texto-suave text-body2">
            Gestion de catalogo de productos
          </p>
        </q-card-section>

        <q-form greedy @submit="iniciarSesion">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="formulario.email"
              outlined
              dense
              type="email"
              label="Email *"
              autocomplete="email"
              autofocus
              :rules="[requerido('El email'), esEmail()]"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="mail" />
              </template>
            </q-input>

            <q-input
              v-model="formulario.password"
              outlined
              dense
              label="Contrasena *"
              autocomplete="current-password"
              :type="verPassword ? 'text' : 'password'"
              :rules="[requerido('La contrasena'), minimo(6, 'La contrasena')]"
              lazy-rules
            >
              <template #prepend>
                <q-icon name="lock" />
              </template>
              <template #append>
                <q-icon
                  :name="verPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="verPassword = !verPassword"
                />
              </template>
            </q-input>
          </q-card-section>

          <q-card-actions class="q-px-md q-pb-md">
            <q-btn
              unelevated
              no-caps
              type="submit"
              color="primary"
              class="full-width"
              label="Entrar"
              :loading="enviando"
            />
          </q-card-actions>
        </q-form>

        <q-separator />

        <q-card-section class="text-caption texto-suave">
          <q-icon name="info" size="14px" class="q-mr-xs" />
          Usuario de prueba: <strong>admin@sena.edu.co</strong> / <strong>123456</strong>
        </q-card-section>
      </q-card>

      <p class="text-center text-caption texto-suave q-mt-md q-mb-none">
        <q-icon name="dns" size="14px" class="q-mr-xs" />{{ general.urlApi }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.columna-login {
  width: 400px;
  max-width: 92vw;
}

code {
  background: #f1f3f5;
  border-radius: 4px;
  padding: 1px 5px;
}
</style>
