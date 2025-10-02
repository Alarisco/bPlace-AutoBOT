<p align="center">
  <a href="https://chromewebstore.google.com/detail/kjbodcmljdmjmcjdhoghcclejpmgfeoj?utm_source=item-share-cb" target="_blank" rel="noopener">
    <img src="https://raw.githubusercontent.com/Alarisco/WPlace-AutoBOT/refs/heads/main/src/addons/Auto-bot-extension/icons/icon128.png" alt="WPlace AutoBOT" width="160" height="160"/>
  </a>
</p>

<h1 align="center">BPLACE-AUTOBOT</h1>

<p align="center">
  <em>Adaptado para bPlace.org - Basado en WPlace-AutoBOT</em>
</p>

<!-- Botón Buy Me a Coffee -->
<p align="center">
  <a href="https://buymeacoffee.com/alariscoi" target="_blank" rel="noopener">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50" />
  </a>
</p>




<!-- Novedad: enlace al repositorio WPlace Master Server -->
<p align="center">
  🚀 Nueva herramienta relacionada: <br>
  <a href="https://github.com/Alarisco/Wplace-AutoBotnet-Server" target="_blank" rel="noopener">
    WPlace Master Server
  </a> – servidor central para coordinar bots con interfaz web.
</p>


<!-- Texto en otro párrafo centrado -->
<p align="center">
  <em>Best experience: install the browser extension.</em>
</p>

---



---

## Bookmarklet Injection
If you prefer not to install the extension, you can use a bookmarklet instead.
Create a new bookmark and paste one of the code snippets below as the URL.

### Launcher (choose any mode after loading)
```javascript
javascript:(async()=>{const U="https://raw.githubusercontent.com/Alarisco/WPlace-AutoBOT/refs/heads/main/Auto-Launcher.js";try{const r=await fetch(U,{cache:"no-cache"});if(!r.ok)throw new Error(r.status+" "+r.statusText);const code=await r.text();const blob=new Blob([code+"\n//# sourceURL="+U],{type:"text/javascript"});const blobUrl=URL.createObjectURL(blob);try{await new Promise((ok,err)=>{const s=document.createElement("script");s.src=blobUrl;s.onload=ok;s.onerror=err;document.documentElement.appendChild(s);});}catch(e){await import(blobUrl);}}catch(e){alert("[Auto-Launcher] Could not load/inject: "+e.message+"\nTry another page or use Option C (module).");}})();
```

### Guard (protect & auto-repair)
```javascript
javascript:(async()=>{const U="https://raw.githubusercontent.com/Alarisco/WPlace-AutoBOT/refs/heads/main/Auto-Guard.js";try{const r=await fetch(U,{cache:"no-cache"});if(!r.ok)throw new Error(r.status+" "+r.statusText);const code=await r.text();const blob=new Blob([code+"\n//# sourceURL="+U],{type:"text/javascript"});const blobUrl=URL.createObjectURL(blob);try{await new Promise((ok,err)=>{const s=document.createElement("script");s.src=blobUrl;s.onload=ok;s.onerror=err;document.documentElement.appendChild(s);});}catch(e){await import(blobUrl);}}catch(e){alert("[Auto-Guard] Could not load/inject: "+e.message+"\nTry another page or use Option C (module).");}})();
```

### Image (auto paint pixel art)
```javascript
javascript:(async(()=>{const U="https://raw.githubusercontent.com/Alarisco/WPlace-AutoBOT/refs/heads/main/Auto-Image.js";try{const r=await fetch(U,{cache:"no-cache"});if(!r.ok)throw new Error(r.status+" "+r.statusText);const code=await r.text();const blob=new Blob([code+"\n//# sourceURL="+U],{type:"text/javascript"});const blobUrl=URL.createObjectURL(blob);try{await new Promise((ok,err)=>{const s=document.createElement("script");s.src=blobUrl;s.onload=ok;s.onerror=err;document.documentElement.appendChild(s);});}catch(e){await import(blobUrl);}}catch(e){alert("[Auto-Image] Could not load/inject: "+e.message+"\nTry another page or use Option C (module).");}})();
```

### Farm (xp farming)
```javascript
javascript:(async()=>{const U="https://raw.githubusercontent.com/Alarisco/WPlace-AutoBOT/refs/heads/main/Auto-Farm.js";try{const r=await fetch(U,{cache:"no-cache"});if(!r.ok)throw new Error(r.status+" "+r.statusText);const code=await r.text();const blob=new Blob([code+"\n//# sourceURL="+U],{type:"text/javascript"});const blobUrl=URL.createObjectURL(blob);try{await new Promise((ok,err)=>{const s=document.createElement("script");s.src=blobUrl;s.onload=ok;s.onerror=err;document.documentElement.appendChild(s);});}catch(e){await import(blobUrl);}}catch(e){alert("[Auto-Farm] Could not load/inject: "+e.message+"\nTry another page or use Option C (module).");}})();
```

---

## 🔄 Updates
Both the extension and bookmarklets always pull the newest version. Just re-launch.

---

## 🤝 Contributing
Pull requests welcome. See CONTRIBUTING.md for architecture, workflow and standards.

---

<p align="center"><strong>Made with ❤️ for the WPlace community – use responsibly.</strong></p>
