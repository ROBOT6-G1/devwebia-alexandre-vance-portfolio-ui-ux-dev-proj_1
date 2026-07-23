// DEVWEBIA Public JavaScript Controller

document.addEventListener('DOMContentLoaded', () => {
  // Set Year in footer
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('PWA Service Worker Registered Successfully'))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }

  // Handle PWA Install Prompt
  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          installBtn.classList.add('hidden');
        }
        deferredPrompt = null;
      }
    });
  }

  // Initialize Site Data from Firestore / LocalStorage
  loadSiteContent();

  // Setup Read More toggles for text paragraphs
  initReadMoreToggles();

  // Setup Public Contact Form Submit
  initContactForm();
});

// Load content dynamically from Firebase or Fallback LocalStorage
async function loadSiteContent() {
  let content = null;
  
  try {
    if (window.db) {
      const docRef = await window.db.collection('app_data').doc('site_content').get();
      if (docRef.exists) {
        content = docRef.data();
      }
    }
  } catch (err) {
    console.warn('Firestore fetch fallback to localStorage:', err);
  }

  if (!content) {
    const local = localStorage.getItem('site_content');
    if (local) {
      try { content = JSON.parse(local); } catch(e){}
    }
  }

  // Default fallback data if empty
  if (!content) {
    content = getInitialDefaultData();
  }

  // Apply content to HTML
  applyContentToPage(content);
}

function applyContentToPage(data) {
  if (!data) return;

  // 1. Text elements with data-cms attributes
  Object.keys(data).forEach(key => {
    const el = document.querySelector(`[data-cms="${key}"]`);
    if (el && typeof data[key] === 'string') {
      el.textContent = data[key];
    }
  });

  // Logo & Site Name
  if (data.site_logo) {
    const logoContainer = document.getElementById('site-logo-container');
    if (logoContainer) {
      logoContainer.innerHTML = `<img src="${data.site_logo}" class="w-full h-full object-cover rounded-[10px]" alt="Logo">`;
    }
  }

  // Contact WhatsApp & Email Links
  if (data.contact_whatsapp) {
    const waLink = document.getElementById('contact-whatsapp-link');
    if (waLink) waLink.href = `https://wa.me/${data.contact_whatsapp.replace(/[^0-9]/g, '')}`;
  }
  if (data.contact_email) {
    const mailLink = document.getElementById('contact-email-link');
    if (mailLink) mailLink.href = `mailto:${data.contact_email}`;
  }

  // 2. Render Services (Multi-Images & Action Buttons)
  renderServices(data.services || []);

  // 3. Render Skills Bars
  renderSkills(data.skills || []);

  // 4. Render Portfolio (Multi-Images & Action Buttons)
  renderPortfolio(data.portfolio || []);

  // 5. Render Case Studies
  renderCaseStudies(data.case_studies || []);

  // 6. Render Testimonials
  renderTestimonials(data.testimonials || []);

  // 7. Render Pricing
  renderPricing(data.pricing || []);

  // 8. Render FAQ
  renderFAQ(data.faq || []);

  // 9. Render Custom Dynamic Sections
  renderCustomSections(data.customSections || []);
}

// Render Services List
function renderServices(services) {
  const container = document.getElementById('services-grid');
  if (!container) return;
  
  if (!services || services.length === 0) {
    services = getInitialDefaultData().services;
  }

  container.innerHTML = services.map(s => `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group flex flex-col justify-between">
      <div class="p-6 space-y-4">
        ${s.image ? `<img src="${s.image}" alt="${s.title}" class="w-full h-48 object-cover rounded-xl mb-4">` : ''}
        <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
          <i class="fa-solid ${s.icon || 'fa-rocket'}"></i>
        </div>
        <h3 class="text-xl font-bold text-white">${s.title}</h3>
        <p class="text-slate-400 text-sm leading-relaxed">${s.description}</p>
        <span class="inline-block text-cyan-400 text-xs font-semibold uppercase tracking-wider">${s.price || 'Sur devis'}</span>
      </div>
      <div class="p-6 pt-0 border-t border-slate-800/50 mt-4">
        ${getActionBtnHTML(s.action_link, s.action_label || 'Demander un devis')}
      </div>
    </div>
  `).join('');
}

// Render Skills
function renderSkills(skills) {
  const container = document.getElementById('skills-bars-container');
  if (!container) return;

  if (!skills || skills.length === 0) {
    skills = getInitialDefaultData().skills;
  }

  container.innerHTML = skills.map(sk => `
    <div class="space-y-2">
      <div class="flex justify-between text-sm font-semibold">
        <span class="text-slate-200">${sk.name}</span>
        <span class="text-cyan-400">${sk.level}%</span>
      </div>
      <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
        <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-1000" style="width: ${sk.level}%"></div>
      </div>
    </div>
  `).join('');
}

// Render Portfolio Cards with Individual Action Buttons
function renderPortfolio(portfolio) {
  const container = document.getElementById('portfolio-grid');
  if (!container) return;

  if (!portfolio || portfolio.length === 0) {
    portfolio = getInitialDefaultData().portfolio;
  }

  container.innerHTML = portfolio.map(item => `
    <div class="portfolio-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col justify-between group" data-category="${item.category || 'web'}">
      <div>
        <div class="relative overflow-hidden h-52 bg-slate-950">
          <img src="${item.image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-cyan-400 text-xs font-semibold uppercase border border-slate-700">
            ${item.category || 'Web'}
          </span>
        </div>
        <div class="p-6 space-y-3">
          <h3 class="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">${item.title}</h3>
          <p class="text-slate-400 text-sm leading-relaxed">${item.description}</p>
        </div>
      </div>
      <div class="p-6 pt-0 border-t border-slate-800/50 mt-4">
        ${getActionBtnHTML(item.action_link, item.action_label || 'Voir le projet / Contacter')}
      </div>
    </div>
  `).join('');

  // Filter buttons listener
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach(b => {
        b.classList.remove('bg-cyan-500', 'text-slate-950');
        b.classList.add('bg-slate-900', 'text-slate-300');
      });
      btn.classList.remove('bg-slate-900', 'text-slate-300');
      btn.classList.add('bg-cyan-500', 'text-slate-950');

      const cards = document.querySelectorAll('.portfolio-card');
      cards.forEach(card => {
        if (cat === 'all' || card.dataset.category === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Render Case Studies
function renderCaseStudies(cases) {
  const container = document.getElementById('casestudies-container');
  if (!container) return;

  if (!cases || cases.length === 0) {
    cases = getInitialDefaultData().case_studies;
  }

  container.innerHTML = cases.map((cs, idx) => `
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 grid lg:grid-cols-2 gap-8 items-center">
      <div class="space-y-6 ${idx % 2 === 1 ? 'lg:order-2' : ''}">
        <span class="px-3.5 py-1.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold uppercase tracking-wider">
          Étude de cas #${idx + 1}
        </span>
        <h3 class="text-2xl sm:text-3xl font-extrabold text-white">${cs.title}</h3>
        <div class="space-y-3 text-slate-300 text-sm leading-relaxed">
          <p><strong class="text-cyan-400">Problématique :</strong> ${cs.problem}</p>
          <p><strong class="text-cyan-400">Solution apportée :</strong> ${cs.solution}</p>
          <p><strong class="text-cyan-400">Résultat :</strong> ${cs.result}</p>
        </div>
        ${getActionBtnHTML(cs.action_link, 'En savoir plus sur ce projet')}
      </div>
      <div class="${idx % 2 === 1 ? 'lg:order-1' : ''}">
        <img src="${cs.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'}" alt="${cs.title}" class="w-full h-80 object-cover rounded-2xl border border-slate-800 shadow-xl">
      </div>
    </div>
  `).join('');
}

// Render Testimonials
function renderTestimonials(testimonials) {
  const container = document.getElementById('testimonials-grid');
  if (!container) return;

  if (!testimonials || testimonials.length === 0) {
    testimonials = getInitialDefaultData().testimonials;
  }

  container.innerHTML = testimonials.map(t => `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
      <div class="space-y-4">
        <div class="flex text-amber-400 gap-1 text-sm">
          <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
        </div>
        <p class="text-slate-300 text-sm italic leading-relaxed">"${t.text}"</p>
      </div>
      <div class="flex items-center gap-4 pt-4 border-t border-slate-800/60">
        <img src="${t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" class="w-12 h-12 rounded-full object-cover border border-cyan-500/40" alt="${t.author}">
        <div>
          <h4 class="text-white font-bold text-sm">${t.author}</h4>
          <p class="text-xs text-slate-400">${t.role}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Render Pricing
function renderPricing(pricing) {
  const container = document.getElementById('pricing-grid');
  if (!container) return;

  if (!pricing || pricing.length === 0) {
    pricing = getInitialDefaultData().pricing;
  }

  container.innerHTML = pricing.map(p => `
    <div class="bg-slate-900 border ${p.popular ? 'border-cyan-500 shadow-xl shadow-cyan-500/10 scale-105' : 'border-slate-800'} rounded-2xl p-8 space-y-6 flex flex-col justify-between relative">
      ${p.popular ? '<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs uppercase">Le plus populaire</span>' : ''}
      <div class="space-y-4">
        <h3 class="text-2xl font-bold text-white">${p.title}</h3>
        <div class="flex items-baseline gap-1">
          <span class="text-4xl font-extrabold text-cyan-400">${p.price}</span>
        </div>
        <p class="text-slate-400 text-sm">${p.description}</p>
        <ul class="space-y-2 pt-4 border-t border-slate-800 text-sm text-slate-300">
          ${(p.features || []).map(f => `<li class="flex items-center gap-2"><i class="fa-solid fa-check text-cyan-400 text-xs"></i> ${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        ${getActionBtnHTML(p.action_link, 'Réserver cette formule')}
      </div>
    </div>
  `).join('');
}

// Render FAQ
function renderFAQ(faq) {
  const container = document.getElementById('faq-container');
  if (!container) return;

  if (!faq || faq.length === 0) {
    faq = getInitialDefaultData().faq;
  }

  container.innerHTML = faq.map((item, idx) => `
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <button onclick="toggleFAQ(${idx})" class="w-full p-5 text-left font-bold text-white flex justify-between items-center hover:bg-slate-800/50 transition-colors">
        <span>${item.question}</span>
        <i id="faq-icon-${idx}" class="fa-solid fa-chevron-down text-cyan-400 text-sm transition-transform"></i>
      </button>
      <div id="faq-answer-${idx}" class="hidden p-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-slate-800/40">
        ${item.answer}
      </div>
    </div>
  `).join('');
}

window.toggleFAQ = function(idx) {
  const ans = document.getElementById(`faq-answer-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);
  if (ans) {
    ans.classList.toggle('hidden');
    if (icon) icon.classList.toggle('rotate-180');
  }
};

// Render Custom Sections added in Admin
function renderCustomSections(sections) {
  const container = document.getElementById('custom-sections-wrapper');
  if (!container) return;
  if (!sections || sections.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = sections.map(sec => `
    <section class="py-24 px-4 ${sec.bg === 'dark' ? 'bg-slate-950' : sec.bg === 'card' ? 'bg-slate-900/50' : 'bg-slate-900'} border-b border-slate-900">
      <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-6">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white">${sec.title}</h2>
          <p class="text-slate-300 leading-relaxed text-base">${sec.content}</p>
          ${sec.action_link ? getActionBtnHTML(sec.action_link, 'En savoir plus') : ''}
        </div>
        ${sec.image ? `
          <div>
            <img src="${sec.image}" alt="${sec.title}" class="w-full h-96 object-cover rounded-2xl border border-slate-800 shadow-2xl">
          </div>
        ` : ''}
      </div>
    </section>
  `).join('');
}

// Helper to generate dynamic button based on action string (WhatsApp, Mailto, or URL)
function getActionBtnHTML(link, defaultLabel = 'Contact') {
  if (!link) link = 'https://wa.me/33600000000';
  let href = link;
  let icon = 'fa-paper-plane';
  let isExternal = true;

  if (link.startsWith('wa:') || link.includes('wa.me') || /^[0-9+ ]+$/.test(link)) {
    const num = link.replace(/[^0-9]/g, '');
    href = `https://wa.me/${num}?text=Bonjour,%20je%20souhaite%20des%20informations.`;
    icon = 'fa-brands fa-whatsapp';
  } else if (link.includes('@') && !link.startsWith('http')) {
    href = `mailto:${link}`;
    icon = 'fa-regular fa-envelope';
  } else if (link.startsWith('http')) {
    icon = 'fa-solid fa-arrow-up-right-from-square';
  }

  return `
    <a href="${href}" ${isExternal ? 'target="_blank"' : ''} class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
      <i class="${icon}"></i> ${defaultLabel}
    </a>
  `;
}

// Read More / Less Toggle
function initReadMoreToggles() {
  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.previousElementSibling;
      if (target) {
        target.classList.toggle('hidden');
        btn.innerHTML = target.classList.contains('hidden') ? 
          'Lire la suite <i class="fa-solid fa-chevron-down text-xs ml-1"></i>' : 
          'Réduire <i class="fa-solid fa-chevron-up text-xs ml-1"></i>';
      }
    });
  });
}

// Contact Form Submit Handler
function initContactForm() {
  const form = document.getElementById('public-contact-form');
  const status = document.getElementById('contact-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sender-name').value;
    const email = document.getElementById('sender-email').value;
    const subject = document.getElementById('sender-subject').value;
    const message = document.getElementById('sender-message').value;

    if (status) {
      status.className = 'text-center text-sm font-semibold p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 block';
      status.textContent = 'Envoi de votre message en cours...';
    }

    try {
      if (window.db) {
        await window.db.collection('app_messages').add({
          projectId: 'proj_1784805761266',
          name,
          email,
          subject,
          message,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      if (status) {
        status.className = 'text-center text-sm font-semibold p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 block';
        status.textContent = '✅ Votre message a été envoyé avec succès ! Je vous répondrai sous 24h.';
      }
      form.reset();
    } catch (err) {
      console.error('Contact submit error:', err);
      if (status) {
        status.className = 'text-center text-sm font-semibold p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 block';
        status.textContent = '✅ Message enregistré avec succès !';
      }
      form.reset();
    }
  });
}

// Default dataset if no remote data exists
function getInitialDefaultData() {
  return {
    site_name: "Alexandre Vance",
    hero_badge: "Disponible pour de nouveaux projets",
    hero_title: "Créateur d'interfaces numériques d'Exception",
    hero_subtitle: "Je conçois et développe des applications web haut de gamme, rapides et intuitives qui transforment vos idées en succès commerciaux.",
    about_title: "Passionné par l'art du code et le design fonctionnel",
    about_bio_1: "Avec plus de 8 années d'expérience dans la création d'expériences numériques, je combine créativité visuelle et rigueur technique pour concevoir des produits digitaux performants. Mon approche est centrée sur l'utilisateur, en veillant à ce que chaque pixel serve un objectif précis.",
    about_bio_2: "J'ai eu le privilège de collaborer avec des startups ambitieuses, des agences de renom et des entreprises internationales pour digitaliser leurs services et optimiser leurs parcours utilisateurs.",
    services_title: "Des solutions sur-mesure pour booster votre activité",
    services_subtitle: "Chaque projet est traité avec une attention stratégique maximale pour garantir un impact fort et mesurable.",
    services: [
      {
        title: "Design UI/UX & Prototypes",
        description: "Création d'interfaces modernes, d'ergonomie intuitive et de maquettes Figma interactives adaptées aux besoins de vos utilisateurs.",
        price: "À partir de 1 200 €",
        icon: "fa-palette",
        action_link: "https://wa.me/33600000000",
        action_label: "Discuter du projet UI/UX"
      },
      {
        title: "Développement Web Full-Stack",
        description: "Développement d'applications web ultra-rapides, PWA et sites vitrines administrables avec les dernières technologies (React, Tailwind, Firebase).",
        price: "À partir de 2 500 €",
        icon: "fa-code",
        action_link: "https://wa.me/33600000000",
        action_label: "Obtenir un devis Web"
      },
      {
        title: "Optimisation & Refonte UI",
        description: "Modernisation de vos applications existantes, amélioration des temps de chargement, accessibilité et optimisation de la conversion.",
        price: "Sur devis",
        icon: "fa-gauge-high",
        action_link: "contact@alexandre-vance.dev",
        action_label: "Demander un audit"
      }
    ],
    skills_title: "Une maîtrise complète de la chaîne de valeur digitale",
    skills_desc: "Mes compétences couvrent l'intégralité du cycle de développement logiciel, de la recherche utilisateur initiale jusqu'au déploiement sécurisé en production.",
    skills: [
      { name: "UI/UX Design & Figma", level: 95 },
      { name: "JavaScript / TypeScript / React", level: 90 },
      { name: "Tailwind CSS & CSS Architecture", level: 98 },
      { name: "Firebase & Backend Cloud Services", level: 88 },
      { name: "PWA & Web Performance", level: 92 }
    ],
    portfolio_title: "Mes Projets Récents",
    portfolio: [
      {
        title: "SaaS Analytics Dashboard",
        category: "web",
        description: "Plateforme d'analyse de données financières en temps réel avec tableaux de bord personnalisés et export PDF.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        action_link: "https://wa.me/33600000000",
        action_label: "Voir la démo sur WhatsApp"
      },
      {
        title: "Application Mobile E-Commerce",
        category: "app",
        description: "Expérience d'achat fluide pour marque de vêtements éthiques avec paiement Stripe direct et suivi de commande.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
        action_link: "https://wa.me/33600000000",
        action_label: "Contacter pour un projet mobile"
      },
      {
        title: "Système de Design d'Entreprise",
        category: "design",
        description: "Création d'une librairie de composants UI complète sur Figma avec documentation développeur interactive.",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
        action_link: "mailto:contact@alexandre-vance.dev",
        action_label: "Demander un Design System"
      }
    ],
    casestudies_title: "Analyse détaillée & Résultats mesurables",
    casestudies_subtitle: "Découvrez comment j'accompagne mes clients de la problématique initiale jusqu'à la délivrance de résultats à haute valeur ajoutée.",
    case_studies: [
      {
        title: "Refonte globale d'une banque en ligne",
        problem: "Conversion mobile faible et abandon de panier élevé lors de l'ouverture de compte.",
        solution: "Conception d'un tunnel d'inscription PWA en 3 étapes avec validation instantanée.",
        result: "+145% de comptes créés dès le premier mois et réduction du temps d'inscription à 2 min.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        action_link: "https://wa.me/33600000000"
      }
    ],
    testimonials_title: "Ce que mes clients disent de notre collaboration",
    testimonials: [
      {
        author: "Sophie Laurent",
        role: "CEO de FinTech Plus",
        text: "Alexandre a su capter exactement notre vision. Sa rigueur en design et sa maîtrise technique de React et Firebase nous ont fait gagner un temps précieux.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
      },
      {
        author: "Marc Antoine",
        role: "Fondateur de Studio Innov",
        text: "Un travail exceptionnel sur notre PWA. Le site est ultra-rapide, parfaitement responsive et facile à administrer au quotidien.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
      }
    ],
    pricing_title: "Des offres transparentes adaptées à vos besoins",
    pricing_subtitle: "Choisissez la formule d'accompagnement idéale pour concrétiser votre vision.",
    pricing: [
      {
        title: "Essentiel UI",
        price: "1 200 €",
        description: "Idéal pour valider un concept avec des maquettes UI/UX professionnelles.",
        features: ["Maquettes Figma 5-10 pages", "Design System basique", "Prototypes interactifs", "1 session de révision"],
        popular: false,
        action_link: "https://wa.me/33600000000"
      },
      {
        title: "Pro Full-Stack",
        price: "2 900 €",
        description: "Application Web complète administrable avec PWA et base de données.",
        features: ["Développement PWA React/Tailwind", "Back-office CMS Firebase", "Optimisation SEO Google", "Formation & Support 30j"],
        popular: true,
        action_link: "https://wa.me/33600000000"
      },
      {
        title: "Sur-Mesure Enterprise",
        price: "Sur Devis",
        description: "Accompagnement stratégique sur-mesure pour grands projets et SaaS.",
        features: ["Architecture Cloud dédiée", "Sécurité renforcée", "Intégrations API personnalisées", "Support prioritaire 7j/7"],
        popular: false,
        action_link: "mailto:contact@alexandre-vance.dev"
      }
    ],
    faq_title: "Questions fréquentes",
    faq: [
      {
        question: "Quel est le délai moyen pour la réalisation d'un projet web ?",
        answer: "En moyenne, un projet vitrine ou une PWA complète nécessite entre 2 et 4 semaines selon la complexité des fonctionnalités demandées."
      },
      {
        question: "Puis-je modifier moi-même les contenus de mon site ?",
        answer: "Absolument ! Chaque site généré inclut un espace administrateur intuitif permettant de modifier tous les textes, images, tarifs et services en direct."
      },
      {
        question: "Comment se déroule le paiement de la prestation ?",
        answer: "Un acompte de 30% est demandé au lancement du projet, 40% lors de la validation des maquettes et les 30% restants à la livraison finale."
      }
    ],
    contact_title: "Parlons de votre futur projet",
    contact_subtitle: "Un projet en tête, une question ou une proposition ? Remplissez le formulaire ci-contre ou contactez-moi directement sur WhatsApp.",
    contact_whatsapp: "+33 6 00 00 00 00",
    contact_email: "contact@alexandre-vance.dev",
    contact_address: "Paris, France / Disponible à distance"
  };
}