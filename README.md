# Plan de negocios 2026–2027

Estructura de costos, capital necesario y punto de equilibrio para tres negocios, con supuestos editables:

- **Plataforma de carga** con Safe Trip como operador fundador
- **Cocinas** en Colombia y Miami, en paralelo
- **Baked**, pollo horneado en Cajicá, por fases

En vivo: https://werockagencia.github.io/werock-plan-negocios/

## Estructura

- `src/models.js`: modelos financieros (funciones puras)
- `src/app.js`: interfaz, tablas y gráficas
- `src/template.html`: contenido y estilos
- `src/build.js`: genera `index.html` (GitHub Pages) y `plan-de-negocios.html` (Artifact)

```
node src/build.js
```

Es un modelo de planeación, no una asesoría contable ni legal.
