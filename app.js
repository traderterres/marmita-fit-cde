// Marmitas Gourmet CDE - Core Controller
// Alta Gastronomia Caseira & Alta Conversão em Ciudad del Este

// CONFIGURAÇÃO DO WHATSAPP DE ATENDIMENTO
// Altere para o número de WhatsApp que atenderá os clientes (sem espaços ou caracteres especiais):
// Ex: "595981xxxxxx" para linha paraguaia ou "5545xxxxxxxxx" para linha brasileira em Foz/CDE
const WHATSAPP_PHONE = "595981000000";

let currentLang = 'pt';
let selectedPackage = {
  size: 10,
  priceBRL: 239,
  pricePYG: "299.000 Gs",
  name: "Kit 10 Potes Gourmet (Almoço + Jantar)"
};

const I18N = {
  pt: {
    hero_title: "Comida caseira de verdade. <br><em>Suculenta, saudável e pronta em 4 minutos.</em>",
    hero_subtitle: "Almoce e jante pratos clássicos brasileiros preparados sem óleos inflamatórios e calculados por Nutricionista. O sabor autêntico da fazenda por <strong>menos de R$ 20 por refeição</strong> (~24.900 Gs), entregue na sua porta em Ciudad del Este.",
    hero_cta: "Garantir Vaga no Meu Kit Semanal"
  },
  es: {
    hero_title: "Comida casera de verdad. <br><em>Jugosa, saludable y lista en 4 minutos.</em>",
    hero_subtitle: "Almorzá y cená platos clásicos brasileños preparados sin aceites inflamatorios y calculados por Nutricionista. El auténtico sabor casero por <strong>menos de 24.900 Gs por comida</strong>, entregado en tu puerta en Ciudad del Este.",
    hero_cta: "Asegurar Cupo en Mi Kit Semanal"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initLanguageToggle();
  initPlanSelection();
  initCustomScroll();
  initFormCustomization();
  initReservationForm();
  initAdminPanel();
  updateBadgeCount();
});

// Language Switcher
function initLanguageToggle() {
  const btns = document.querySelectorAll(".lang-toggle");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentLang = btn.dataset.lang;
      applyLanguage(currentLang);
    });
  });
}

function applyLanguage(lang) {
  const t = I18N[lang];
  if (!t) return;
  const title = document.getElementById("lbl-hero-title");
  const sub = document.getElementById("lbl-hero-subtitle");
  const cta = document.getElementById("btn-hero-cta");

  if (title) title.innerHTML = t.hero_title;
  if (sub) sub.innerHTML = t.hero_subtitle;
  if (cta) cta.textContent = t.hero_cta;
}

// Plan Selection & Direct WhatsApp Orders
function initPlanSelection() {
  const cards = document.querySelectorAll(".plan-card");

  // Botões de envio direto para o WhatsApp em cada pacote
  const waButtons = document.querySelectorAll(".btn-pkg-wa");
  waButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Não dispara o evento de clique do card
      const card = btn.closest(".plan-card");
      if (!card) return;

      const pkgSize = card.dataset.package;
      const pkgPriceBRL = parseFloat(card.dataset.price);
      const pkgPricePYG = card.dataset.pyg;
      const pkgTitle = card.querySelector("h3")?.textContent || `Kit ${pkgSize} Potes`;
      const pkgLabel = card.querySelector(".plan-label")?.textContent || "";

      // Salva métrica de intenção de compra rápida no localStorage
      let leads = JSON.parse(localStorage.getItem("marmitas_gourmet_cde_leads") || "[]");
      leads.unshift({
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR'),
        name: "Lead Direto (Botão do Pacote)",
        phone: "Via WhatsApp",
        location: "A confirmar",
        address: "A confirmar",
        orderMode: "Direto pelo Card do Pacote",
        dietPreferences: "Cardápio padrão da semana",
        notes: `Interesse direto no ${pkgTitle}`,
        package: `${pkgTitle} (${pkgLabel})`,
        totalBrl: pkgPriceBRL,
        totalPyg: pkgPricePYG
      });
      localStorage.setItem("marmitas_gourmet_cde_leads", JSON.stringify(leads));
      updateBadgeCount();

      // Monta mensagem do pacote específico com foco em reserva de vaga
      const waMsg = `Olá! Vi o site e quero agendar meu pedido do *${pkgTitle}* (${pkgLabel}) por R$ ${pkgPriceBRL.toFixed(2).replace('.', ',')} (~ ${pkgPricePYG})!\n\n` +
        `Ainda restam vagas disponíveis para o próximo lote de entrega em Ciudad del Este?`;

      btn.textContent = "✓ Abrindo WhatsApp...";
      btn.style.backgroundColor = "#16a34a";

      const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(waMsg)}`;
      setTimeout(() => {
        window.location.href = waUrl;
        setTimeout(() => {
          btn.textContent = `Pedir Kit ${pkgSize} no WhatsApp 📲`;
          btn.style.backgroundColor = "";
        }, 2000);
      }, 350);
    });
  });

  // Botões e clique nos cards para selecionar e personalizar no formulário abaixo
  cards.forEach(card => {
    const handleCardSelection = () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      selectedPackage = {
        size: parseInt(card.dataset.package),
        priceBRL: parseFloat(card.dataset.price),
        pricePYG: card.dataset.pyg,
        name: card.querySelector("h3").textContent + " (" + card.querySelector(".plan-label").textContent + ")"
      };

      // Atualiza a barra de resumo do formulário
      const sumPkg = document.getElementById("sum-pkg-name");
      const sumBrl = document.getElementById("sum-brl-text");
      const sumPyg = document.getElementById("sum-pyg-text");

      if (sumPkg) sumPkg.textContent = selectedPackage.name;
      if (sumBrl) sumBrl.textContent = `R$ ${selectedPackage.priceBRL.toFixed(2).replace('.', ',')}`;
      if (sumPyg) sumPyg.textContent = `~ ${selectedPackage.pricePYG} Guaranis`;
    };

    card.addEventListener("click", () => {
      handleCardSelection();
    });

    const custBtn = card.querySelector(".btn-pkg-customize");
    if (custBtn) {
      custBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        handleCardSelection();
        const formEl = document.getElementById("reservation-form");
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  });
}

// Quick Scroll to Custom Options
function initCustomScroll() {
  const btnCustom = document.getElementById("btn-custom-scroll");
  if (btnCustom) {
    btnCustom.addEventListener("click", (e) => {
      e.preventDefault();
      // Select the custom radio
      const customRadio = document.querySelector('input[name="order-mode"][value="custom"]');
      if (customRadio) {
        customRadio.checked = true;
        customRadio.dispatchEvent(new Event('change'));
      }
      const orderSection = document.getElementById("pedidos");
      if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Form Customization Mode & Tags
function initFormCustomization() {
  const modeRadios = document.querySelectorAll('input[name="order-mode"]');
  const prefPanel = document.getElementById("diet-preferences-panel");
  const modeCards = document.querySelectorAll(".mode-option-card");

  modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      modeCards.forEach(card => card.classList.remove("active"));
      radio.closest(".mode-option-card")?.classList.add("active");

      if (radio.value === "custom") {
        prefPanel?.classList.add("active");
      } else {
        prefPanel?.classList.remove("active");
      }
    });
  });

  const dietCheckboxes = document.querySelectorAll('.diet-tag-checkbox input[type="checkbox"]');
  dietCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      const parent = cb.closest(".diet-tag-checkbox");
      if (cb.checked) {
        parent?.classList.add("checked");
      } else {
        parent?.classList.remove("checked");
      }
    });
  });
}

// Reservation Form Submission - Direct to WhatsApp
function initReservationForm() {
  const form = document.getElementById("reservation-form");
  const submitBtn = document.getElementById("btn-submit-order");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("order-name").value.trim();
    const phone = document.getElementById("order-phone").value.trim();
    const location = document.getElementById("order-location").value;
    const address = document.getElementById("order-address").value.trim();
    const notes = document.getElementById("order-notes").value.trim();

    const selectedMode = document.querySelector('input[name="order-mode"]:checked')?.value || 'standard';
    const checkedTags = Array.from(document.querySelectorAll('input[name="diet-pref"]:checked')).map(cb => cb.value);

    const isCustom = selectedMode === 'custom';
    const modeLabel = isCustom ? "Montado para Minha Dieta" : "Cardápio Variado da Semana";

    const newLead = {
      id: Date.now(),
      date: new Date().toLocaleString('pt-BR'),
      name,
      phone,
      location,
      address,
      orderMode: modeLabel,
      dietPreferences: checkedTags.length > 0 ? checkedTags.join(", ") : "Nenhuma tag específica",
      notes: notes || "Nenhuma observação informada",
      package: selectedPackage.name,
      totalBrl: selectedPackage.priceBRL,
      totalPyg: selectedPackage.pricePYG
    };

    // Save lead in local store
    let leads = JSON.parse(localStorage.getItem("marmitas_gourmet_cde_leads") || "[]");
    leads.unshift(newLead);
    localStorage.setItem("marmitas_gourmet_cde_leads", JSON.stringify(leads));
    updateBadgeCount();

    // Visual Feedback on Button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "✓ Abrindo WhatsApp Oficial...";
      submitBtn.style.backgroundColor = "#16a34a";
    }

    // Build Structured WhatsApp message
    let waMsg = `Olá! Gostaria de agendar a pré-reserva do meu kit de marmitas pelo site:\n\n` +
      `📦 PACOTE ESCOLHIDO: ${selectedPackage.name}\n` +
      `💰 VALOR: R$ ${selectedPackage.priceBRL.toFixed(2).replace('.', ',')} (~ ${selectedPackage.pricePYG})\n` +
      `🍽️ PREFERÊNCIA: ${modeLabel}\n`;

    if (isCustom && checkedTags.length > 0) {
      waMsg += `🥑 DIRETRIZES/DIETA: ${checkedTags.join(", ")}\n`;
    }

    waMsg += `👤 NOME: ${name}\n` +
      `📍 REGIÃO EM CDE: ${location}\n` +
      `🏠 ENDEREÇO: ${address}\n` +
      `📱 WHATSAPP: ${phone}\n` +
      `📝 OBSERVAÇÕES: ${notes || 'Nenhuma'}\n\n` +
      `Quero garantir minha vaga no próximo lote semanal com 15% OFF!`;

    const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(waMsg)}`;

    // Redireciona diretamente para o WhatsApp sem fricção
    setTimeout(() => {
      window.location.href = waUrl;
    }, 450);
  });
}

// Admin Panel Controller
function initAdminPanel() {
  const openBtn = document.getElementById("btn-open-admin");
  const closeBtn = document.getElementById("btn-close-admin");
  const modal = document.getElementById("modal-admin");
  const clearBtn = document.getElementById("btn-clear-leads");
  const copyBtn = document.getElementById("btn-copy-leads");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      renderAdminLeads();
      modal.classList.add("open");
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("open");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Deseja apagar todos os registros de teste salvos?")) {
        localStorage.removeItem("marmitas_gourmet_cde_leads");
        renderAdminLeads();
        updateBadgeCount();
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const raw = localStorage.getItem("marmitas_gourmet_cde_leads") || "[]";
      navigator.clipboard.writeText(raw).then(() => {
        alert("Lista copiada com sucesso para a área de transferência!");
      });
    });
  }
}

function updateBadgeCount() {
  const leads = JSON.parse(localStorage.getItem("marmitas_gourmet_cde_leads") || "[]");
  const badge = document.getElementById("count-badge");
  if (badge) badge.textContent = leads.length;
}

function renderAdminLeads() {
  const container = document.getElementById("admin-leads-list");
  if (!container) return;
  const leads = JSON.parse(localStorage.getItem("marmitas_gourmet_cde_leads") || "[]");

  if (leads.length === 0) {
    container.innerHTML = `<p style="color: #78716c; font-size: 0.85rem; padding: 10px;">Nenhuma reserva registrada ainda. Faça um teste pelo formulário da página!</p>`;
    return;
  }

  container.innerHTML = "";
  leads.forEach(lead => {
    const el = document.createElement("div");
    el.className = "lead-entry";
    el.innerHTML = `
      <div class="lead-entry-top">
        <span>${lead.name} (${lead.location})</span>
        <span style="color: #234338;">R$ ${lead.totalBrl.toFixed(2)}</span>
      </div>
      <div class="lead-entry-meta">
        WhatsApp: ${lead.phone} • Data: ${lead.date}<br>
        Plano: ${lead.package}<br>
        Modo: <strong>${lead.orderMode || 'Padrão'}</strong><br>
        ${lead.dietPreferences && lead.dietPreferences !== 'Nenhuma tag específica' ? `Diretrizes: <em>${lead.dietPreferences}</em><br>` : ''}
        Endereço: ${lead.address}<br>
        Notas: ${lead.notes}
      </div>
      <a href="https://api.whatsapp.com/send?phone=${lead.phone.replace(/\D/g,'')}&text=Olá%20${encodeURIComponent(lead.name.split(' ')[0])}!%20Tudo%20bem?%20Aqui%20é%20da%20equipe%20das%20Marmitas%20Gourmet%20CDE." target="_blank" class="btn-wa-direct">
        Chamar no WhatsApp
      </a>
    `;
    container.appendChild(el);
  });
}
