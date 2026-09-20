// NUTYVA® Alimentação Saudável / NUTYVA® Alimentación Saludable — Cozinha Artesanal & Ultracongelamento
// Script de Interações e Integração com WhatsApp

// ==========================================================================
// CONFIGURAÇÃO DO WHATSAPP DE ATENDIMENTO
// ==========================================================================
const WHATSAPP_PHONE = "5551981338580";

document.addEventListener("DOMContentLoaded", () => {
  initLanguageSelector();
  initStickyNav();
  initVideoTrigger();
  initShowcaseVideo();
  initRealDishesCarousel();
  initDynamicWhatsAppLinks();
  initClosingCTA();
});

// Suporte a seletores dinâmicos de idioma e persistência da escolha manual
function initLanguageSelector() {
  // Bandeira / Link de Português
  document.querySelectorAll('a[href="/"], a[href="index.html"], a[href="../index.html"], [title*="Português"], [title*="Brasil"]').forEach(link => {
    link.addEventListener("click", () => {
      try { localStorage.setItem("nutyva_user_lang", "pt"); } catch(e) {}
    });
  });

  // Bandeira / Link de Espanhol
  document.querySelectorAll('a[href="/es"], a[href="es/index.html"], a[href="../es/index.html"], [title*="Español"], [title*="Paraguay"]').forEach(link => {
    link.addEventListener("click", () => {
      try { localStorage.setItem("nutyva_user_lang", "es"); } catch(e) {}
    });
  });
}

function initVideoTrigger() {
  const playBtn = document.getElementById("btn-video-trigger");
  if (!playBtn) return;

  playBtn.addEventListener("click", () => {
    alert("📹 Demonstração de Suculência e Textura Real (20s sem edição):\n\nAqui entrará o vídeo gravado mostrando o pote saindo do freezer, os 4 min de micro-ondas e o garfo entrando na alcatra macia e no feijão cremoso sem água no prato.\n\nPara colocar o vídeo real, basta substituir a tag pela sua filmagem em .mp4!");
  });
}

// Reprodução Imediata do Vídeo Demonstrativo ao Carregar e na Rolagem
function initShowcaseVideo() {
  const video = document.querySelector(".hero-video-player");
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const tryPlay = () => {
    const promise = video.play();
    if (promise !== undefined) {
      promise.catch(() => {});
    }
  };

  // Tenta tocar imediatamente
  tryPlay();

  // Dispara autoplay logo que a pontinha (5%) do vídeo entrar na tela
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          tryPlay();
        }
      });
    }, { threshold: 0.05, rootMargin: "60px 0px" });
    observer.observe(video);
  }

  // Toque ou scroll inicia imediatamente se o browser exigir gesto
  window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
  window.addEventListener("scroll", tryPlay, { once: true, passive: true });
}

// Rastreamento de Lead no Botão Final de Consulta de Vagas
function initClosingCTA() {
  const btnPt = document.getElementById("btn-ver-vagas-final");
  if (btnPt) {
    btnPt.addEventListener("click", () => {
      if (typeof fbq === "function") {
        fbq("track", "Lead", {
          content_name: "Consulta de Vagas Semanais",
          content_category: "Atendimento Direto",
          value: 199.00,
          currency: "BRL"
        });
      }
    });
  }

  const btnEs = document.getElementById("btn-ver-vagas-final-es");
  if (btnEs) {
    btnEs.addEventListener("click", () => {
      if (typeof fbq === "function") {
        fbq("track", "Lead", {
          content_name: "Consulta de Cupos Semanales",
          content_category: "Atención Directa",
          value: 249000,
          currency: "PYG"
        });
      }
    });
  }
}

// 3. Efeito sutil no scroll para a barra de navegação
function initStickyNav() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      nav.style.boxShadow = "0 4px 20px rgba(26, 26, 26, 0.08)";
    } else {
      nav.style.boxShadow = "none";
    }
  }, { passive: true });
}

// 4. Carrossel Interativo Mobile / Desktop de Pratos Reais
function initRealDishesCarousel() {
  const track = document.getElementById("dishes-carousel-track");
  const prevBtn = document.getElementById("carousel-prev-btn");
  const nextBtn = document.getElementById("carousel-next-btn");
  const dotsContainer = document.getElementById("carousel-dots-container");

  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".carousel-dish-card"));
  if (cards.length === 0) return;

  // Criar dots indicadores
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    cards.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.className = `carousel-dot ${idx === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Ver prato ${idx + 1}`);
      dot.addEventListener("click", () => {
        cards[idx].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Atualizar dot ativo conforme o scroll
  let scrollTimeout;
  track.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const trackRect = track.getBoundingClientRect();
      let closestIdx = 0;
      let minDiff = Infinity;

      cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const diff = Math.abs(cardRect.left - trackRect.left);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      const dots = dotsContainer ? dotsContainer.querySelectorAll(".carousel-dot") : [];
      dots.forEach((d, idx) => {
        d.classList.toggle("active", idx === closestIdx);
      });
    }, 60);
  }, { passive: true });

  // Botões de navegação
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const cardWidth = cards[0].offsetWidth + 18;
      track.scrollBy({ left: -cardWidth, behavior: "smooth" });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const cardWidth = cards[0].offsetWidth + 18;
      track.scrollBy({ left: cardWidth, behavior: "smooth" });
    });
  }
}

// 5. Links Dinâmicos de WhatsApp & Rastreamento Global de Cliques
function initDynamicWhatsAppLinks() {
  // Pratos do carrossel
  document.querySelectorAll("[data-wa-dish]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const dishName = btn.getAttribute("data-wa-dish") || "este prato do cardápio semanal";
      const message = `Olá! Vi o prato *"${dishName}"* no carrossel do site e gostaria de saber se ele está no lote desta semana para incluir no meu kit!`;

      if (typeof fbq === "function") {
        fbq("track", "Contact", { content_name: `Prato: ${dishName}` });
      }

      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    });
  });

  // Rastreamento de todos os demais botões/links direcionando para o WhatsApp
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener("click", () => {
      if (typeof fbq === "function") {
        const text = link.innerText.trim() || link.getAttribute("aria-label") || "Link WhatsApp";
        fbq("track", "Contact", { content_name: text });
      }
    });
  });
}
