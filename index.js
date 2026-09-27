// ===== MESA DJ MATO FUNCIONAL =====
let ctxMato, gA, gB, iniciado = false;

function iniciaAudioMato(){
  if(iniciado) return;
  ctxMato = new (window.AudioContext || window.webkitAudioContext)();
  const a = document.getElementById('somA');
  const b = document.getElementById('somB');
  if(!a || !b) return;
  const sA = ctxMato.createMediaElementSource(a);
  const sB = ctxMato.createMediaElementSource(b);
  gA = ctxMato.createGain();
  gB = ctxMato.createGain();
  sA.connect(gA).connect(ctxMato.destination);
  sB.connect(gB).connect(ctxMato.destination);
  gA.gain.value = 0.5;
  gB.gain.value = 0.5;
  iniciado = true;
}

function tocaMato(deck){
  iniciaAudioMato();
  if(ctxMato) ctxMato.resume();
  const audio = document.getElementById('som'+deck);
  const jog = document.getElementById('jog'+deck);
  const btn = document.getElementById('btn'+deck);
  if(!audio) return;
  if(audio.paused){
    audio.play();
    jog.classList.add('tocando');
    btn.textContent = '❚❚';
    btn.classList.add('on');
  } else {
    audio.pause();
    jog.classList.remove('tocando');
    btn.textContent = '▶';
    btn.classList.remove('on');
  }
}

document.addEventListener('DOMContentLoaded', ()=>{

  // Liga botões da mesa
  const btnA = document.getElementById('btnA');
  const btnB = document.getElementById('btnB');
  const cross = document.getElementById('crossMato');
  if(btnA) btnA.onclick = () => tocaMato('A');
  if(btnB) btnB.onclick = () => tocaMato('B');
  if(cross){
    cross.oninput = (e)=>{
      if(!iniciado) return;
      const v = e.target.value/100;
      gA.gain.value = 1 - v;
      gB.gain.value = v;
    }
  }

  // ===== ANIMAÇÃO DE NOTAS MUSICAIS SUBINDO =====
  const canvas = document.getElementById('studio-particles-bg');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, notes = [];
  const isMobile = window.innerWidth < 768;
  const icons = ['♪','♫','♩','♬'];
  const totalNotes = isMobile ? 12 : 35;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Note{
    constructor(){
      this.x = Math.random()*w;
      this.y = h + 20 + Math.random()*h;
      this.size = isMobile ? 10 + Math.random()*12 : 14 + Math.random()*20;
      this.speed = isMobile ? 0.3 + Math.random()*0.8 : 0.5 + Math.random()*1.5;
      this.icon = icons[Math.floor(Math.random()*icons.length)];
      this.color = `hsl(${280 + Math.random()*60}, 100%, 65%)`;
      this.swing = Math.random()*1.2;
      this.swingSpeed = 0.01 + Math.random()*0.02;
    }
    update(){
      this.y -= this.speed;
      this.x += Math.sin(this.y * this.swingSpeed) * this.swing;
      if(this.y < -50){
        this.y = h + 20;
        this.x = Math.random()*w;
      }
    }
    draw(){
      ctx.font = `${this.size}px Arial`;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = isMobile ? 0.35 : 0.6;
      ctx.fillText(this.icon, this.x, this.y);
      ctx.globalAlpha = 1;
    }
  }

  for(let i=0;i<totalNotes;i++) notes.push(new Note());

  function anim(){
    ctx.clearRect(0,0,w,h);
    notes.forEach(n=>{ n.update(); n.draw(); });
    requestAnimationFrame(anim);
  }
  anim();
});
