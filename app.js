var CID="5a1d2111eca849cdbcc19d193b925148";
var RED="https://muhammedersoy09.github.io/dalga-music/";
var SCOPE="user-read-playback-state user-modify-playback-state";
var ARTISTS=["Wegh","Motive","Uzi","Heijan","Muti","Kava"];
var state={};
function $(i){return document.getElementById(i)}
function note(t){var m=$("msg");m.textContent=t||"";m.style.display=t?"block":"none"}
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function rand(n){var a=new Uint8Array(n);crypto.getRandomValues(a);return Array.prototype.map.call(a,function(x){return("0"+x.toString(16)).slice(-2)}).join("").slice(0,n)}
function b64(buf){return btoa(String.fromCharCode.apply(null,new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
async function login(){
  var v=rand(96);localStorage.setItem("dm_v",v);
  var h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));
  location.href="https://accounts.spotify.com/authorize?"+new URLSearchParams({client_id:CID,response_type:"code",redirect_uri:RED,scope:SCOPE,code_challenge_method:"S256",code_challenge:b64(h)});
}
async function tokenReq(body){
  try{
    var r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(Object.assign({client_id:CID},body))});
    var j=await r.json();
    if(j.access_token){localStorage.setItem("dm_t",j.access_token);localStorage.setItem("dm_e",String(Date.now()+j.expires_in*1000-60000));if(j.refresh_token)localStorage.setItem("dm_r",j.refresh_token);return true}
  }catch(e){}
  return false;
}
async function tok(){
  if(Date.now()<Number(localStorage.getItem("dm_e")||0))return localStorage.getItem("dm_t");
  var r=localStorage.getItem("dm_r");
  if(r&&await tokenReq({grant_type:"refresh_token",refresh_token:r}))return localStorage.getItem("dm_t");
  return null;
}
async function api(path,opt){
  var t=await tok();if(!t){showLogin();throw new Error("Giriş gerekli")}
  opt=opt||{};
  var r=await fetch("https://api.spotify.com/v1"+path,{method:opt.method||"GET",body:opt.body,headers:{Authorization:"Bearer "+t,"Content-Type":"application/json"}});
  if(r.status===204||r.status===202)return {};
  var j={};try{j=await r.json()}catch(e){}
  if(!r.ok)throw new Error((j.error&&j.error.message)||("Hata "+r.status));
  return j;
}
function showLogin(){
  var o=$("out");o.textContent="";
  var b=el("button","btn","Spotify ile giriş yap");b.onclick=login;o.appendChild(b);
  o.appendChild(el("p","mute","Spotify Premium hesabınla giriş yapmalısın."));
  $("bar").textContent="";
}
function showApp(){
  var o=$("out");o.textContent="";
  var chips=el("div","chips");
  ARTISTS.forEach(function(a){var c=el("button","chip",a);c.onclick=function(){search('artist:"'+a+'"')};chips.appendChild(c)});
  o.appendChild(chips);
  var i=el("input");i.type="search";i.placeholder="Şarkı veya sanatçı ara";i.setAttribute("aria-label","Ara");
  i.onkeydown=function(e){if(e.key==="Enter"&&i.value.trim())search(i.value.trim())};
  o.appendChild(i);o.appendChild(el("div","","")).id="res";
  poll();
}
async function search(q){
  note("");var res=$("res");res.textContent="Aranıyor…";
  try{
    var j=await api("/search?"+new URLSearchParams({q:q,type:"track",limit:10}));
    var items=(j.tracks&&j.tracks.items)||[];res.textContent="";
    if(!items.length){res.textContent="Sonuç bulunamadı.";return}
    items.forEach(function(t){
      var r=el("div","row");r.tabIndex=0;
      var img=t.album&&t.album.images&&t.album.images.length?t.album.images[t.album.images.length-1].url:"";
      if(img){var im=el("img");im.src=img;im.alt="";r.appendChild(im)}else r.appendChild(el("div","ph"));
      var m=el("div","meta");m.appendChild(el("b","",t.name));m.appendChild(el("span","mute",t.artists.map(function(a){return a.name}).join(", ")));r.appendChild(m);
      r.onclick=function(){playUri(t.uri)};
      r.onkeydown=function(e){if(e.key==="Enter")playUri(t.uri)};
      res.appendChild(r);
    });
  }catch(e){res.textContent="";note("Arama çalışmadı: "+e.message)}
}
async function playUri(u){
  note("Gönderiliyor…");
  var devs=null,dev=null;
  try{var d=await api("/me/player/devices");devs=d.devices||[]}catch(e){devs=null}
  if(devs){
    i
