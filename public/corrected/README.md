# Grupo Data - Sistema de Gestión e Informes de Obra

Sistema web integral desarrollado para **Grupo Data - Obras Eléctricas** (Santa Fe Capital, Argentina).

Permite la confección, edición en tiempo real, impresión en tamaño A4 oficial, descarga directa en PDF y exportación automática a **Google Drive** de:

1. **Generación de Presupuestos (`presupuesto.html`)**: Cómputo métrico de insumos, materiales y mano de obra con cálculo dinámico de totales en pesos argentinos.
2. **Órdenes de Trabajo (`orden_trabajo.html`)**: Asignación técnica de tareas para operarios, prioridades y doble firma de conformidad en obra.
3. **Detalle de Mano de Obra (`mano_obra.html`)**: Desglose de jornadas, especialidades técnicas, valor unitario y cómputo de totales.

---

## 🚀 Despliegue en Vercel

Este proyecto está 100% optimizado para Vercel:
* Incluye archivo `vercel.json` con `"cleanUrls": true` para navegación limpia (`/presupuesto`, `/orden_trabajo`, `/mano_obra`).
* Es una aplicación frontend estática sin dependencias de servidor complejas.

### Pasos para desplegar en Vercel:
1. Sube este repositorio a tu cuenta de GitHub.
2. Ingresa a [Vercel](https://vercel.com) y selecciona **"Add New Project"** > Importa tu repositorio.
3. Deja la configuración por defecto y haz clic en **Deploy**.

---

## ☁️ Integración con Google Drive

* El sistema utiliza **Google Identity Services** y la **Google Drive API** para guardar los archivos PDF generados directamente en tu nube.
* En **Google Cloud Console**, dentro de tu proyecto *Grupo Data*:
  * Asegúrate de agregar la URL de tu Vercel (`https://tu-proyecto.vercel.app`) en **"Orígenes autorizados de JavaScript"** dentro de tu ID de cliente OAuth 2.0.
  * Agrega tu correo en **"Usuarios de prueba"** en la Pantalla de Consentimiento de OAuth si el proyecto está en modo Testing.

---

## 🛠️ Tecnologías Utilizadas

* HTML5, CSS3 moderno con diseño responsivo para móviles y PC.
* FontAwesome 6 y Google Fonts (Segoe UI).
* [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) para exportación en alta definición vectorial A4.
* Google Identity Services & Google Drive REST API v3.
