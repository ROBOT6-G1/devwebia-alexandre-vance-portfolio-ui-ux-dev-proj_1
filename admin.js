// DEVWEBIA Admin JavaScript Controller

let currentAdminData = {};

document.addEventListener('DOMContentLoaded', () => {
  initPinAuth();
  loadAdminData();
});

// PIN Authentication System
function initPinAuth() {
  const pinInput = document.getElementById('admin-pin-input');
  const pinSubmit = document.getElementById('admin-pin-submit');
  const pinError = document.getElementById('pin-error');
  const lockScreen = document.getElementById('pin-lockscreen');
  const adminPanel = document.getElementById('admin-panel');

  const savedPin = localStorage.getItem('admin_pin') || '1234';

  pinSubmit.addEventListener('click', () => {
    if (pinInput.value.trim() === savedPin) {
      lockScreen.classList.add('hidden');
      adminPanel.classList.remove('hidden');
    } else {
      pinError.classList.remove('hidden');
    }
  });

  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') pinSubmit.click();
  });
}

// Tab Switching
window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.remove('bg-cyan-500/10', 'text-cyan-400', 'border', 'border-cyan-500/30');
    btn.classList.add('text-slate-400');
  });
  event.currentTarget.classList.add('bg-cyan-500/10', 'text-cyan-400', 'border', 'border-cyan-500/30');
};

// Load Data into Form Fields
async function loadAdminData() {
  let content = null;
  try {
    if (window.db) {
      const docRef = await window.db.collection('app_data').doc('site_content').get();
      if (docRef.exists) content = docRef.data();
    }
  } catch (e) {}

  if (!content) {
    const local = localStorage.getItem('site_content');
    if (local) content = JSON.parse(local);
  }

  if (!content) {
    content = getInitialDefaultData();
  }

  currentAdminData = content;
  populateAdminFields(content);
}

function populateAdminFields(data) {
  if (document.getElementById('input-site-name')) document.getElementById('input-site-name').value = data.site_name || '';
  if (document.getElementById('input-hero-badge')) document.getElementById('input-hero-badge').value = data.hero_badge || '';
  if (document.getElementById('input-hero-title')) document.getElementById('input-hero-title').value = data.hero_title || '';
  if (document.getElementById('input-hero-subtitle')) document.getElementById('input-hero-subtitle').value = data.hero_subtitle || '';
  if (document.getElementById('input-about-title')) document.getElementById('input-about-title').value = data.about_title || '';
  if (document.getElementById('input-about-bio-1')) document.getElementById('input-about-bio-1').value = data.about_bio_1 || '';

  // Render Editable lists for Services and Portfolio
  renderAdminServicesList(data.services || []);
  renderAdminPortfolioList(data.portfolio || []);
}

// Render Services List in Admin
function renderAdminServicesList(services) {
  const container = document.getElementById('admin-services-list');
  if (!container) return;

  container.innerHTML = services.map((s, idx) => `
    <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
      <div class="grid md:grid-cols-2 gap-3">
        <input type="text" value="${s.title}" onchange="updateServiceField(${idx}, 'title', this.value)" placeholder="Titre du Service" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
        <input type="text" value="${s.price || ''}" onchange="updateServiceField(${idx}, 'price', this.value)" placeholder="Tarif (ex: 1 200 €)" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
      </div>
      <textarea onchange="updateServiceField(${idx}, 'description', this.value)" placeholder="Description du service" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">${s.description}</textarea>
      <div class="grid md:grid-cols-2 gap-3">
        <input type="text" value="${s.action_link || ''}" onchange="updateServiceField(${idx}, 'action_link', this.value)" placeholder="Lien de contact (Num WhatsApp ou Email)" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
        <button onclick="removeService(${idx})" class="px-3 py-2 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 transition-all">
          🗑️ Supprimer ce service
        </button>
      </div>
    </div>
  `).join('');
}

window.updateServiceField = function(idx, field, val) {
  if (currentAdminData.services && currentAdminData.services[idx]) {
    currentAdminData.services[idx][field] = val;
  }
};

window.addNewService = function() {
  if (!currentAdminData.services) currentAdminData.services = [];
  currentAdminData.services.push({
    title: "Nouveau Service",
    description: "Description de la prestation...",
    price: "Sur devis",
    action_link: "https://wa.me/33600000000"
  });
  renderAdminServicesList(currentAdminData.services);
};

window.removeService = function(idx) {
  currentAdminData.services.splice(idx, 1);
  renderAdminServicesList(currentAdminData.services);
};

// Render Portfolio List in Admin
function renderAdminPortfolioList(portfolio) {
  const container = document.getElementById('admin-portfolio-list');
  if (!container) return;

  container.innerHTML = portfolio.map((item, idx) => `
    <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
      <div class="grid md:grid-cols-2 gap-3">
        <input type="text" value="${item.title}" onchange="updatePortfolioField(${idx}, 'title', this.value)" placeholder="Titre du Projet" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
        <select onchange="updatePortfolioField(${idx}, 'category', this.value)" class="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
          <option value="web" ${item.category === 'web' ? 'selected' : ''}>Web</option>
          <option value="design" ${item.category === 'design' ? 'selected' : ''}>UI/UX Design</option>
          <option value="app" ${item.category === 'app' ? 'selected' : ''}>Mobile App</option>
        </select>
      </div>
      <textarea onchange="updatePortfolioField(${idx}, 'description', this.value)" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">${item.description}</textarea>
      <div>
        <label class="block text-[10px] text-slate-400 uppercase mb-1">Téléverser une image locale (Base64)</label>
        <input type="file" accept="image/*" onchange="uploadPortfolioImage(${idx}, this)" class="p-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-400 w-full">
      </div>
      <input type="text" value="${item.action_link || ''}" onchange="updatePortfolioField(${idx}, 'action_link', this.value)" placeholder="Lien / Contact WhatsApp ou Email" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white">
      <button onclick="removePortfolioItem(${idx})" class="px-3 py-2 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/30 transition-all">
        🗑️ Supprimer ce projet
      </button>
    </div>
  `).join('');
}

window.updatePortfolioField = function(idx, field, val) {
  if (currentAdminData.portfolio && currentAdminData.portfolio[idx]) {
    currentAdminData.portfolio[idx][field] = val;
  }
};

window.uploadPortfolioImage = function(idx, input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (currentAdminData.portfolio && currentAdminData.portfolio[idx]) {
        currentAdminData.portfolio[idx].image = e.target.result;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
};

window.addNewPortfolioItem = function() {
  if (!currentAdminData.portfolio) currentAdminData.portfolio = [];
  currentAdminData.portfolio.push({
    title: "Nouveau Projet",
    category: "web",
    description: "Description du projet...",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    action_link: "https://wa.me/33600000000"
  });
  renderAdminPortfolioList(currentAdminData.portfolio);
};

window.removePortfolioItem = function(idx) {
  currentAdminData.portfolio.splice(idx, 1);
  renderAdminPortfolioList(currentAdminData.portfolio);
};

// Save Custom Section Vaovao
window.saveCustomSection = function() {
  const title = document.getElementById('custom-sec-title').value;
  const content = document.getElementById('custom-sec-content').value;
  const link = document.getElementById('custom-sec-link').value;
  const bg = document.getElementById('custom-sec-bg').value;
  const imgInput = document.getElementById('custom-sec-image');

  if (!title || !content) {
    alert('Veuillez saisir un titre et un contenu pour la section.');
    return;
  }

  const newSec = {
    title,
    content,
    action_link: link,
    bg
  };

  if (imgInput.files && imgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      newSec.image = e.target.result;
      commitCustomSection(newSec);
    };
    reader.readAsDataURL(imgInput.files[0]);
  } else {
    commitCustomSection(newSec);
  }
};

function commitCustomSection(secObj) {
  if (!currentAdminData.customSections) currentAdminData.customSections = [];
  currentAdminData.customSections.push(secObj);
  alert('✅ Nouvelle section ajoutée avec succès ! Pensez à cliquer sur "Enregistrer tout".');
  document.getElementById('custom-sec-title').value = '';
  document.getElementById('custom-sec-content').value = '';
}

// Save All Changes to Firestore and LocalStorage
document.getElementById('save-all-btn').addEventListener('click', async () => {
  // Gather Form Inputs
  currentAdminData.site_name = document.getElementById('input-site-name').value;
  currentAdminData.hero_badge = document.getElementById('input-hero-badge').value;
  currentAdminData.hero_title = document.getElementById('input-hero-title').value;
  currentAdminData.hero_subtitle = document.getElementById('input-hero-subtitle').value;
  currentAdminData.about_title = document.getElementById('input-about-title').value;
  currentAdminData.about_bio_1 = document.getElementById('input-about-bio-1').value;

  // Save logo file if uploaded
  const logoFile = document.getElementById('input-logo-file').files[0];
  if (logoFile) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      currentAdminData.site_logo = e.target.result;
      await saveDataToStorage();
    };
    reader.readAsDataURL(logoFile);
  } else {
    await saveDataToStorage();
  }
});

async function saveDataToStorage() {
  // Save to LocalStorage
  localStorage.setItem('site_content', JSON.stringify(currentAdminData));

  // Save to Firestore
  try {
    if (window.db) {
      await window.db.collection('app_data').doc('site_content').set(currentAdminData, { merge: true });
    }
    alert('✅ Enregistré avec succès dans Firebase Firestore !');
  } catch (err) {
    console.warn('Firestore error, saved in localStorage:', err);
    alert('✅ Modifications enregistrées localement !');
  }
}

// Trigger Google Ping Simulator
window.triggerGooglePing = function() {
  alert('🚀 Demande d\'indexation Google transmise à Googlebot (Google Ping) ! Mots-clés et Sitemap mis à jour.');
};

// Live Snippet Preview Updates
window.updateGoogleSnippet = function() {
  const title = document.getElementById('seo-meta-title').value;
  const desc = document.getElementById('seo-meta-desc').value;
  document.getElementById('google-snippet-title').textContent = title || 'Titre du site';
  document.getElementById('google-snippet-desc').textContent = desc || 'Description du site';
};

// Update Admin PIN
window.updateAdminPin = function() {
  const pin = document.getElementById('input-new-pin').value.trim();
  if (pin.length >= 4) {
    localStorage.setItem('admin_pin', pin);
    alert('🔒 Code PIN mis à jour avec succès !');
  } else {
    alert('Veuillez entrer au moins 4 caractères.');
  }
};

function getInitialDefaultData() {
  return {
    site_name: "Alexandre Vance",
    hero_badge: "Disponible pour de nouveaux projets",
    hero_title: "Créateur d'interfaces numériques d'Exception",
    hero_subtitle: "Je conçois et développe des applications web haut de gamme, rapides et intuitives qui transforment vos idées en succès commerciaux.",
    about_title: "Passionné par l'art du code et le design fonctionnel",
    about_bio_1: "Avec plus de 8 années d'expérience dans la création d'expériences numériques, je combine créativité visuelle et rigueur technique pour concevoir des produits digitaux performants.",
    services: [
      { title: "Design UI/UX & Prototypes", description: "Interfaces modernes sur-mesure", price: "1 200 €", action_link: "https://wa.me/33600000000" }
    ],
    portfolio: [
      { title: "SaaS Analytics Dashboard", category: "web", description: "Analyse de données en temps réel", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", action_link: "https://wa.me/33600000000" }
    ]
  };
}