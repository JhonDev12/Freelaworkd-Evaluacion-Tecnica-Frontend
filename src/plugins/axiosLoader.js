// src/api/axiosLoader.js
/**
 * ===========================================================
 * axiosLoader
 * -----------------------------------------------------------
 * Plugin que conecta los interceptores de Axios con el store
 * de carga para mostrar u ocultar el banner automáticamente.
 * ===========================================================
 */
export function instalarAxiosLoader(api, loaderStore) {
  api.interceptors.request.use(
    (config) => {
      if (!config.headers?.["x-sin-carga"]) loaderStore.mostrar();
      return config;
    },
    (error) => {
      loaderStore.ocultar();
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      if (!response.config.headers?.["x-sin-carga"]) loaderStore.ocultar();
      return response;
    },
    (error) => {
      if (!error.config?.headers?.["x-sin-carga"]) loaderStore.ocultar();

     
      if (error.response?.status === 401) {
        console.warn("[Loader] Petición no autorizada — ignorando reload.");
      }

      return Promise.reject(error);
    }
  );
}
