// NUTYVA® Alimentação Saudável / NUTYVA® Alimentación Saludable — Cozinha Artesanal & Ultracongelamento
// Script de Interações e Integração com WhatsApp

// ==========================================================================
// CONFIGURAÇÃO DO WHATSAPP DE ATENDIMENTO
// ==========================================================================
const WHATSAPP_PHONE = "5551981338580";

document.addEventListener("DOMContentLoaded", () => {
  initOrderForm();
  initLanguageSelector();
  initStickyNav();
  initVideoTrigger();
  initRealDishesCarousel();
  initDynamicWhatsAppLinks();
});

// Suporte a seletores dinâmicos de idioma se presentes
function initLanguageSelector() {
  const toggles = document.querySelectorAll(".lang-toggle");
  if (!toggles || toggles.length === 0) return;
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const lang = toggle.getAttribute("data-lang");
      if (lang === "es") {
        window.location.href = window.location.pathname.includes("/es/") ? "index.html" : "es/index.html";
      } else {
        window.location.href = window.location.pathname.includes("/es/") ? "../index.html" : "index.html";
      }
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

// 1. Gerador de Pedido via WhatsApp com Mensagem 100% Personalizada
function initOrderForm() {
  const form = document.getElementById("order-builder-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("f-name")?.value.trim() || "";
    const bairro = document.getElementById("f-bairro")?.value || "A combinar em CDE";
    const kit = document.getElementById("f-kit")?.value || "Kit da Semana";
    
    // Objetivo da Dieta
    const objetivoRadio = document.querySelector('input[name="f-objetivo"]:checked');
    const objetivo = objetivoRadio ? objetivoRadio.value : "Manutenção & Comer Bem";

    // Preferência de Proteínas
    const proteinaRadio = document.querySelector('input[name="f-proteina"]:checked');
    const proteina = proteinaRadio ? proteinaRadio.value : "Variado";

    // Preferência de Carboidratos/Base
    const carboRadio = document.querySelector('input[name="f-carbo"]:checked');
    const carbo = carboRadio ? carboRadio.value : "Tradicional";

    // Tags de dieta e restrições
    const checkedTags = Array.from(document.querySelectorAll('input[name="f-diet"]:checked'))
      .map(cb => cb.value);
    const dieta = checkedTags.length > 0 ? checkedTags.join(", ") : "Sem restrições adicionais";

    // Observações e gramaturas da nutri
    const obs = document.getElementById("f-obs")?.value.trim() || "Nenhuma observação extra";

    // Formato rico, claro e profissional para o WhatsApp:
    const message = `Olá! Acabei de montar minha dieta e pedido no site da NUTYVA® Alimentação Saudável:
👤 *Nome:* ${name}
📍 *Bairro / Região:* ${bairro}
📦 *Quantidade:* ${kit}
🎯 *Objetivo:* ${objetivo}
🥩 *Proteínas:* ${proteina}
🍚 *Base / Carbo:* ${carbo}
🥗 *Cuidados / Restrições:* ${dieta}
📝 *Gramaturas / Detalhes:* ${obs}

Gostaria de confirmar se ainda restam vagas no lote artesanal desta semana!`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    // Feedback visual no botão
    const submitBtn = document.getElementById("btn-submit-form");
    if (submitBtn) {
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>✓ Abrindo WhatsApp...</span>";
      submitBtn.style.backgroundColor = "#25D366";
      
      setTimeout(() => {
        submitBtn.innerHTML = originalHtml;
        submitBtn.style.backgroundColor = "";
      }, 3000);
    }

    // Abre o WhatsApp
    window.open(waUrl, "_blank");
  });

  // Formulário em Espanhol
  const formEs = document.getElementById("order-builder-form-es");
  if (!formEs) return;

  formEs.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("f-name-es")?.value.trim() || "";
    const bairro = document.getElementById("f-bairro-es")?.value || "A coordinar en CDE";
    const kit = document.getElementById("f-kit-es")?.value || "Kit de la Semana";
    
    const objetivoRadio = document.querySelector('input[name="f-objetivo-es"]:checked');
    const objetivo = objetivoRadio ? objetivoRadio.value : "Mantenimiento & Comer Saludable";

    const proteinaRadio = document.querySelector('input[name="f-proteina-es"]:checked');
    const proteina = proteinaRadio ? proteinaRadio.value : "Variado";

    const carboRadio = document.querySelector('input[name="f-carbo-es"]:checked');
    const carbo = carboRadio ? carboRadio.value : "Tradicional";

    const checkedTags = Array.from(document.querySelectorAll('input[name="f-diet-es"]:checked'))
      .map(cb => cb.value);
    const dieta = checkedTags.length > 0 ? checkedTags.join(", ") : "Sin restricciones adicionales";

    const obs = document.getElementById("f-obs-es")?.value.trim() || "Ninguna indicación extra";

    const message = `¡Hola! Acabo de armar mi dieta y pedido en la web de NUTYVA® Alimentación Saludable:
👤 *Nombre:* ${name}
📍 *Zona / Barrio:* ${bairro}
📦 *Cantidad:* ${kit}
🎯 *Objetivo:* ${objetivo}
🥩 *Proteínas:* ${proteina}
🍚 *Base / Carbohidratos:* ${carbo}
🥗 *Cuidados / Restricciones:* ${dieta}
📝 *Porciones / Detalles:* ${obs}

¿Aún quedan cupos disponibles en el lote artesanal de esta semana?`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    const submitBtn = document.getElementById("btn-submit-form-es");
    if (submitBtn) {
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>✓ Abriendo WhatsApp...</span>";
      submitBtn.style.backgroundColor = "#25D366";
      
      setTimeout(() => {
        submitBtn.innerHTML = originalHtml;
        submitBtn.style.backgroundColor = "";
      }, 3000);
    }

    window.open(waUrl, "_blank");
  });
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

// 5. Links Dinâmicos de WhatsApp
function initDynamicWhatsAppLinks() {
  document.querySelectorAll("[data-wa-dish]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const dishName = btn.getAttribute("data-wa-dish") || "este prato do cardápio semanal";
      const message = `Olá! Vi o prato *"${dishName}"* no carrossel do site e gostaria de saber se ele está no lote desta semana para incluir no meu kit!`;
      const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    });
  });
}
