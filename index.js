/* ==========================================================================
   PROJETO: DJ MATO STUDIOS VIRTUAL ENGINE + EMAIL FORM SYSTEM (CORRIGIDO)
   MECÂNICA: AUDIO PLAYER, LED METERS, PARTICLES ENGINE & EMAIL INTERCEPTOR
   ARQUITETURA: REVISADA SEM ERROS DE CONTEXTO OU LOOP
   ========================================================================== */

// 1. CONFIGURAÇÃO DO REPRODUTOR DE ÁUDIO (MESA VIRTUAL)
const tracks = [
    { name: "PREPARA O COPO 2 - Perigo Beats", genre: "Funk", src: "https://soundhelix.com", emoji: "🔊" },
    { name: "MALANDRA MANIACA - Cyber Trap", genre: "Trap", src: "https://soundhelix.com", emoji: "🌌" },
    { name: "Selo Exclusive Beats - Studio Mix", genre: "Selo Mix", src: "https://soundhelix.com", emoji: "💎" }
];

let currentTrackIndex = 0;
let isPlaying = false;
let ledInterval = null;

const audio = document.getElementById('main-audio');
const playBtnL = document.getElementById('play-btn-l');
const playBtnR = document.getElementById('play-btn-r');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const currentTitle = document.getElementById('current-title');
const trackListContainer = document.getElementById('track-list');
const heroBtn = document.getElementById('hero-btn');

const consoleContainer = document.getElementById('pioneer-console');
const vinylL = document.getElementById('vinyl-l');
const vinylR = document.getElementById('vinyl-r');
const ledL = document.getElementById('led-l');
const ledR = document.getElementById('led-r');

if (heroBtn) {
    heroBtn.addEventListener('click', () => {
        document.getElementById('packages').scrollIntoView({ behavior: 'smooth' });
    });
}

function loadTrackList() {
    if (!trackListContainer) return;
    trackListContainer.innerHTML = '';
    tracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.classList.add('track-item');
        if (index === currentTrackIndex) item.classList.add('active');
        item.innerHTML = `<span>${track.emoji} ${track.name}</span><span>${track.genre}</span>`;
        item.addEventListener('click', () => selectTrack(index));
        trackListContainer.appendChild(item);
    });
}

function loadTrack(index) {
    if (!audio) return;
    currentTrackIndex = index;
    audio.src = tracks[index].src;
    currentTitle.innerText = tracks[index].name;
    
    const items = document.querySelectorAll('.track-item');
    items.forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });
}

function selectTrack(index) {
    loadTrack(index);
    playTrack();
}

function playTrack() {
    if (!audio) return;
    isPlaying = true;
    playBtnL.innerText = "⏸";
    playBtnR.innerText = "⏸";
    
    if (consoleContainer) consoleContainer.classList.add('playing');
    if (vinylL) vinylL.classList.add('playing');
    if (vinylR) vinylR.classList.add('playing');
    
    clearInterval(ledInterval);
    ledInterval = setInterval(() => {
        if (ledL && ledR) {
            const hL = Math.floor(Math.random() * 85) + 15;
            const hR = Math.floor(Math.random() * 85) + 15;
            ledL.style.height = `${hL}%`;
            ledR.style.height = `${hR}%`;
        }
    }, 80);

    audio.play().catch(e => console.log("Aguardando ativação do usuário na viewport."));
}

function pauseTrack() {
    if (!audio) return;
    isPlaying = false;
    playBtnL.innerText = "▶";
    playBtnR.innerText = "▶";
    
    if (consoleContainer) consoleContainer.classList.remove('playing');
    if (vinylL) vinylL.classList.remove('playing');
    if (vinylR) vinylR.classList.remove('playing');
    
    clearInterval(ledInterval);
    if (ledL && ledR) {
        ledL.style.height = '0%';
        ledR.style.height = '0%';
    }
    
    audio.pause();
}

if (playBtnL && playBtnR) {
    [playBtnL, playBtnR].forEach(btn => {
        btn.addEventListener('click', () => {
            if (isPlaying) pauseTrack();
            else playTrack();
        });
    });
}

const cueL = document.getElementById('cue-btn-l');
const cueR = document.getElementById('cue-btn-r');
if (cueL) cueL.addEventListener('click', () => { if (audio) audio.currentTime = 0; if(isPlaying) playTrack(); });
if (cueR) cueR.addEventListener('click', () => { if (audio) audio.currentTime = 0; if(isPlaying) playTrack(); });

if (audio) {
    audio.addEventListener('timeupdate', (e) => {
        const { duration, currentTime } = e.srcElement;
        if (!duration) return;
        if (progressFill) progressFill.style.width = `${(currentTime / duration) * 100}%`;

        let mins = Math.floor(currentTime / 60);
        let secs = Math.floor(currentTime % 60);
        if (currentTimeEl) currentTimeEl.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    });
}

if (progressContainer) {
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        if (audio && audio.duration) audio.currentTime = (e.offsetX / width) * audio.duration;
    });
}


// ==========================================================================
// 2. GESTÃO DE FORMULÁRIO ENVIANDO PARA O E-MAIL (johnny.oliveofc@gmail.com)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.querySelector(".contact-form-panel form");
    
    if (contactForm) {
        contactForm.removeAttribute("onsubmit");
        
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            
            const submitButton = contactForm.querySelector(".btn-form-submit");
            const originalButtonText = submitButton ? submitButton.innerText : "Enviar";
            
            if (submitButton) {
                submitButton.innerText = "ENVIANDO PROPOSTA...";
                submitButton.disabled = true;
                submitButton.style.opacity = "0.6";
            }

            const formData = new FormData(contactForm);
            formData.append("_to", "johnny.oliveofc@gmail.com");
            formData.append("_subject", "Nova Proposta Musical - DJ MATO STUDIOS");

            try {
                const response = await fetch("https://formspree.io", {
                    method: "POST",
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    alert("Sucesso! Sua proposta musical foi enviada direto para o e-mail do DJ MATO. Responderemos em breve.");
                    contactForm.reset();
                } else {
                    alert("Ocorreu um erro ao enviar pelo site. Por favor, utilize o botão direto do WhatsApp exposto ao lado.");
                }
            } catch (error) {
                alert("Erro de conexão. Verifique sua rede de internet ou chame direto no WhatsApp.");
            } finally {
                if (submitButton) {
                    submitButton.innerText = originalButtonText;
                    submitButton.disabled = false;
                    submitButton.style.opacity = "1";
                }
            }
        });
    }
});


// ==========================================================================
// 3. MOTOR DE ANIMAÇÃO DE SÍMBOLOS MUSICAIS (CANVAS API BACKGROUND) - CORRIGIDO
// ==========================================================================
const canvas = document.getElementById('studio-particles-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 30; 
    const musicSymbols = ["♩", "♪", "♫", "♬", "♭", "♮", "♯", "𝄞", "𝄢"];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    class MusicSymbolParticle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.symbol = musicSymbols[Math.floor(Math.random() * musicSymbols.length)];
            this.fontSize = Math.floor(Math.random() * 24) + 12; 
            this.speedX = Math.random() * 0.4 - 0.2; 
            this.speedY = Math.random() * -0.5 - 0.1; // Ajustado para flutuar para cima de forma limpa
            this.rotation = Math.random() * Math.PI; 
            this.rotationSpeed = Math.random() * 0.02 - 0.01; 
            this.opacity = Math.random() * 0.15 + 0.05; 
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            if (this.y < -50) { 
                this.y = canvas.height + 50; 
                this.x = Math.random() * canvas.width; 
            }
            if (this.x < -50) this.x = canvas.width + 50;
            if (this.x > canvas.width + 50) this.x = -50;
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.fontSize}px Inter, sans-serif`;
            ctx.fillStyle = `rgba(197, 168, 128, ${this.opacity})`;
            ctx.fillText(this.symbol, 0, 0);
            ctx.restore();
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new MusicSymbolParticle());
        }
    }

