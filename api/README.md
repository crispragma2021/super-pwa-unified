1. Cuenta Cloudflare → Workers & Pages → Create Worker
2. Copiar api/gemini.js → sustituir GEMINI_API_KEY por tu clave
3. Deploy → obtener URL tipo https://tu-worker.workers.dev
4. En tu JS del frontend:
   fetch("https://tu-worker.workers.dev",{method:"POST",body:JSON.stringify({prompt:"hola Gemini"})})
   .then(r=>r.text()).then(console.log)
