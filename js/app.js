/* MultiDownloads · sitio oficial. Sin dependencias, sin cookies y sin rastreadores.
   Con «require-trusted-types-for 'script'» en la política de seguridad: nada de innerHTML. */
(function () {
  "use strict";

  var REPO = "jxzzestrong-alt/multidownloads";
  var raiz = document.documentElement;

  // Si alguien mete el sitio oficial dentro de un marco ajeno, se sale (en el dominio propio)
  if (/(^|\.)fsst\.site$/.test(location.hostname) && window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { raiz.hidden = true; }
  }

  // ─── Qué equipo es (para mostrar el QR en la computadora o el aviso en iPhone) ───
  var ua = navigator.userAgent || "";
  var esIos = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var esAndroid = /Android/i.test(ua);
  raiz.classList.add(esIos ? "es-ios" : esAndroid ? "es-android" : "es-escritorio");

  // ─── Modo claro u oscuro (se recuerda en este navegador) ───
  function guardado() { try { return localStorage.getItem("tema"); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem("tema", v); } catch (e) { /* sin almacenamiento */ } }
  var inicial = guardado();
  if (inicial === "dark" || inicial === "light") raiz.setAttribute("data-theme", inicial);

  function oscuroAhora() {
    var t = raiz.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var botonTema = document.getElementById("tema");
    function rotular() {
      botonTema.setAttribute("aria-label", oscuroAhora() ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    }
    rotular();
    botonTema.addEventListener("click", function () {
      var nuevo = oscuroAhora() ? "light" : "dark";
      raiz.setAttribute("data-theme", nuevo);
      guardar(nuevo);
      rotular();
    });

    // ─── Menú en teléfono ───
    var menu = document.getElementById("menu");
    var hamburguesa = document.getElementById("hamburguesa");
    function cerrarMenu() { menu.classList.remove("abierto"); hamburguesa.setAttribute("aria-expanded", "false"); hamburguesa.setAttribute("aria-label", "Abrir menú"); }
    hamburguesa.addEventListener("click", function () {
      var abrir = !menu.classList.contains("abierto");
      menu.classList.toggle("abierto", abrir);
      hamburguesa.setAttribute("aria-expanded", String(abrir));
      hamburguesa.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) cerrarMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") cerrarMenu(); });

    // Borde de la barra al bajar
    var barra = document.getElementById("barra");
    var subir = document.getElementById("subir");
    function borde() {
      barra.classList.toggle("con-borde", window.scrollY > 8);
      if (subir) subir.classList.toggle("visible", window.scrollY > window.innerHeight * 1.5);
    }
    window.addEventListener("scroll", borde, { passive: true });
    borde();

    // ─── Carrusel de capturas ───
    var carrusel = document.getElementById("carrusel");
    var puntos = document.getElementById("puntos-carrusel");
    if (carrusel && puntos) (function () {
    var flechas = document.querySelectorAll("[data-mover]");
    flechas.forEach(function (b) {
      b.addEventListener("click", function () {
        var paso = carrusel.clientWidth * 0.8 * Number(b.getAttribute("data-mover"));
        carrusel.scrollBy({ left: paso, behavior: "smooth" });
      });
    });
    var fotos = carrusel.children.length;
    for (var i = 0; i < fotos; i++) puntos.appendChild(document.createElement("span"));
    function estadoCarrusel() {
      var max = carrusel.scrollWidth - carrusel.clientWidth;
      var t = max > 0 ? carrusel.scrollLeft / max : 0;
      var actual = Math.round(t * (fotos - 1));
      Array.prototype.forEach.call(puntos.children, function (p, k) { p.classList.toggle("actual", k === actual); });
      flechas[0].disabled = carrusel.scrollLeft < 4;
      flechas[1].disabled = carrusel.scrollLeft > max - 4;
    }
    carrusel.addEventListener("scroll", estadoCarrusel, { passive: true });
    window.addEventListener("resize", estadoCarrusel);
    carrusel.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { carrusel.scrollBy({ left: 260, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { carrusel.scrollBy({ left: -260, behavior: "smooth" }); e.preventDefault(); }
    });
    estadoCarrusel();
    })();

    // ─── Correo: armado aquí para que los robots de spam no lo lean del código ───
    var correo = document.getElementById("correo");
    var correoTexto = document.getElementById("correo-texto");
    var direccion = "";
    try { direccion = atob(correo.getAttribute("data-c")).split("").reverse().join(""); } catch (e) { /* queda el texto */ }
    if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(direccion)) {
      if (correoTexto) correoTexto.textContent = direccion; else correo.textContent = direccion;
      correo.href = "mailto:" + direccion + "?subject=" + encodeURIComponent("MultiDownloads");
    }
    function copiarTexto(texto, boton, original) {
      var hecho = function () {
        boton.textContent = "Copiado"; boton.classList.add("listo");
        setTimeout(function () { boton.textContent = original; boton.classList.remove("listo"); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(hecho, function () { avisar(texto); });
      else avisar(texto);
    }
    var copiar = document.getElementById("copiar-correo");
    copiar.addEventListener("click", function () { if (direccion) copiarTexto(direccion, copiar, "Copiar"); });
    var copiarEnlace = document.getElementById("copiar-enlace");
    if (copiarEnlace) copiarEnlace.addEventListener("click", function () { copiarTexto("https://fsst.site/#instalar", copiarEnlace, "Copiar enlace"); });

    // ─── Aviso flotante ───
    var aviso = document.getElementById("aviso");
    var avisoTiempo = 0;
    function avisar(texto) {
      if (!aviso) return;
      aviso.textContent = texto;
      aviso.classList.add("visible");
      clearTimeout(avisoTiempo);
      avisoTiempo = setTimeout(function () { aviso.classList.remove("visible"); }, 4200);
    }

    // Al tocar descargar: guía a los pasos de instalación
    document.querySelectorAll("a[data-apk]").forEach(function (a) {
      a.addEventListener("click", function () {
        if (esIos) { avisar("Esta app es solo para Android."); return; }
        avisar(esAndroid ? "Tu descarga empezó. Cuando termine, ábrela y sigue los pasos." : "Descargando el APK. Pásalo a tu teléfono Android para instalarlo.");
        var instalar = document.getElementById("instalar");
        if (instalar && esAndroid && !a.closest("#instalar")) setTimeout(function () { instalar.scrollIntoView({ behavior: "smooth" }); }, 900);
      });
    });

    // ─── Herramientas: buscar y filtrar ───
    var buscar = document.getElementById("buscar-herramienta");
    if (buscar) (function () {
    var grupos = Array.prototype.slice.call(document.querySelectorAll("[data-grupo]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filtro]"));
    var cuenta = document.getElementById("cuenta-herramientas");
    var sinResultados = document.getElementById("sin-resultados");
    var filtro = "todas";
    function normal(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
    grupos.forEach(function (g) { g.querySelectorAll("li").forEach(function (li) { li.setAttribute("data-texto", normal(li.textContent + " " + g.querySelector("h3").textContent)); }); });
    function filtrar() {
      var q = normal((buscar.value || "").trim());
      var total = 0;
      grupos.forEach(function (g) {
        var enFiltro = filtro === "todas" || g.getAttribute("data-grupo") === filtro;
        var visibles = 0;
        g.querySelectorAll("li").forEach(function (li) {
          var ver = enFiltro && (!q || li.getAttribute("data-texto").indexOf(q) !== -1);
          li.hidden = !ver;
          if (ver) visibles++;
        });
        g.hidden = visibles === 0;
        total += visibles;
      });
      cuenta.textContent = total === 1 ? "1 herramienta" : total + " herramientas";
      sinResultados.hidden = total !== 0;
    }
    buscar.addEventListener("input", filtrar);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        filtro = c.getAttribute("data-filtro");
        chips.forEach(function (o) { var on = o === c; o.classList.toggle("activo", on); o.setAttribute("aria-pressed", String(on)); });
        filtrar();
      });
    });
    })();

    // ─── Menú: marca la sección en la que estás ───
    var enlaces = Array.prototype.slice.call(document.querySelectorAll(".menu a[href^='#']"));
    if ("IntersectionObserver" in window) {
      var porId = {};
      enlaces.forEach(function (a) { porId[a.getAttribute("href").slice(1)] = a; });
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting && porId[e.target.id]) {
            enlaces.forEach(function (a) { a.classList.remove("actual"); });
            porId[e.target.id].classList.add("actual");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(porId).forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s); });

      // Barra de descarga fija: aparece al pasar la portada y se esconde en «Instalar»
      var barraDescarga = document.getElementById("barra-descarga");
      if (barraDescarga) (function () {
      var portadaVisible = true, instalarVisible = false;
      function barraFija() {
        var ver = !portadaVisible && !instalarVisible && !esIos;
        barraDescarga.classList.toggle("visible", ver);
        barraDescarga.setAttribute("aria-hidden", String(!ver));
        barraDescarga.querySelector("a").tabIndex = ver ? 0 : -1;
      }
      new IntersectionObserver(function (e) { portadaVisible = e[0].isIntersecting; barraFija(); }).observe(document.querySelector(".descarga"));
      new IntersectionObserver(function (e) { instalarVisible = e[0].isIntersecting; barraFija(); }).observe(document.getElementById("instalar"));
      })();
    }

    // Teléfonos de 32 bits: se sugiere la versión armv7 (Chrome lo dice si se le pregunta)
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      navigator.userAgentData.getHighEntropyValues(["bitness", "architecture"]).then(function (v) {
        if (v && v.architecture === "arm" && v.bitness === "32") {
          var nota = document.getElementById("nota-equipo");
          if (!nota) return;
          nota.textContent = "Tu teléfono es de 32 bits: usa la versión armv7.";
          document.querySelectorAll('a.boton-descarga[data-apk="arm64"]').forEach(function (a) {
            a.href = "https://github.com/" + REPO + "/releases/latest/download/MultiDownloads-armv7.apk";
          });
        }
      }).catch(function () {});
    }

    actualizarVersion();
  });

  // ─── La versión, el peso y las novedades salen de la última publicación ───
  function mb(bytes) { return Math.round(bytes / 1048576) + " MB"; }
  function fecha(iso) {
    try { return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; }
  }
  function poner(sel, texto) { document.querySelectorAll(sel).forEach(function (n) { n.textContent = texto; }); }

  function novedades(cuerpo) {
    var lista = document.getElementById("novedades-lista");
    if (!lista) return;
    var items = [];
    cuerpo.split("\n").forEach(function (l) {
      var m = /^\s*-\s+\*\*(.+?)\*\*\s*(.*)$/.exec(l);
      if (m) items.push([m[1], m[2]]);
    });
    if (!items.length) return;
    while (lista.firstChild) lista.removeChild(lista.firstChild);
    items.slice(0, 8).forEach(function (it) {
      var li = document.createElement("li");
      var b = document.createElement("strong");
      b.textContent = it[0];
      li.appendChild(b);
      li.appendChild(document.createTextNode(" " + it[1].replace(/\*\*/g, "")));
      lista.appendChild(li);
    });
  }

  function actualizarVersion() {
    if (!window.fetch || !window.AbortController) return;
    var ctrl = new AbortController();
    var limite = setTimeout(function () { ctrl.abort(); }, 6000);
    fetch("https://api.github.com/repos/" + REPO + "/releases/latest", {
      signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" }, credentials: "omit", referrerPolicy: "no-referrer",
    }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      clearTimeout(limite);
      if (!j || typeof j.tag_name !== "string") return;
      var m = /^v?(\d+(?:\.\d+)*)/.exec(j.tag_name);
      if (m) poner("[data-version]", m[1]);
      if (j.published_at) poner("[data-fecha]", fecha(j.published_at));
      (j.assets || []).forEach(function (a) {
        var tipo = /arm64/.test(a.name) ? "arm64" : /armv7/.test(a.name) ? "armv7" : null;
        if (!tipo) return;
        if (a.size) poner('[data-peso="' + tipo + '"]', mb(a.size));
        if (typeof a.digest === "string" && /^sha256:[0-9a-f]{64}$/.test(a.digest)) poner('[data-sha="' + tipo + '"]', a.digest.slice(7));
      });
      if (typeof j.body === "string") novedades(j.body);
    }).catch(function () { clearTimeout(limite); /* se queda lo que ya trae la página */ });
  }
})();
