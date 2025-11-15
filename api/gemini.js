addEventListener("fetch", e => e.respondWith(handle(e.request)));
async function handle(req){
  if(req.method!=="POST")return new Response("POST /api/gemini {prompt}");
  const {prompt}=await req.json();
  const key=GEMINI_API_KEY; // la guardarás en Variables de entorno de CF
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})
  });
  const data=await res.json();
  return new Response(data.candidates[0].content.parts[0].text,{headers:{"Access-Control-Allow-Origin":"*"}});
}
