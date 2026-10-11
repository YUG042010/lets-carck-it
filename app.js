const {createClient}=supabase;const sb=createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s);
// Edit chapters here to match your school's syllabus
const SUBJECTS={
"Mathematics":["Real Numbers","Polynomials","Pair of Linear Equations in Two Variables","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Introduction to Trigonometry","Some Applications of Trigonometry","Circles","Areas Related to Circles","Surface Areas and Volumes","Statistics","Probability"],
"Science":["Chemical Reactions and Equations","Acids, Bases and Salts","Metals and Non-metals","Carbon and its Compounds","Life Processes","Control and Coordination","How do Organisms Reproduce?","Heredity","Light – Reflection and Refraction","The Human Eye and the Colourful World","Electricity","Magnetic Effects of Electric Current","Our Environment"],
"Social Science":["History – The Rise of Nationalism in Europe","History – Nationalism in India","History – The Making of a Global World","History – The Age of Industrialisation","History – Print Culture and the Modern World","Geography – Resources and Development","Geography – Forest and Wildlife Resources","Geography – Water Resources","Geography – Agriculture","Geography – Minerals and Energy Resources","Geography – Manufacturing Industries","Geography – Lifelines of National Economy","Political Science – Power-sharing","Political Science – Federalism","Political Science – Gender, Religion and Caste","Political Science – Political Parties","Political Science – Outcomes of Democracy","Economics – Development","Economics – Sectors of the Indian Economy","Economics – Money and Credit","Economics – Globalisation and the Indian Economy","Economics – Consumer Rights"],
"English":["First Flight – Prose","First Flight – Poetry","Footprints Without Feet","Grammar and Writing Skills"],
"Hindi":["Kshitij – Kavya Khand","Kshitij – Gadya Khand","Kritika","Vyakaran","Lekhan"],
"Information Technology":["Communication Skills","Self-Management Skills","ICT Skills","Entrepreneurial Skills","Green Skills"]};
const ICON={"Mathematics":"📐","Science":"🔬","Social Science":"🌍","English":"📖","Hindi":"अ","Information Technology":"💻"};
const ROLE={leader:"Leader",co_leader:"Co-Leader",member:"Member"};
let me,ch,tab="material",cur="";
const staff=()=>me&&me.role!=="member";
const set=h=>{$("#app").innerHTML=h};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago=d=>{const s=(Date.now()-new Date(d))/1e3;return s<60?"just now":s<3600?~~(s/60)+" min ago":s<86400?~~(s/3600)+" h ago":s<604800?~~(s/86400)+" d ago":new Date(d).toLocaleDateString("en-IN")};

function login(msg=""){$("#tabs").hidden=true;set(`<h1>LET'S CRACK IT</h1><p class=sub>by Yug</p><form class=card onsubmit="doLogin(event)"><input id=u placeholder=Username autocapitalize=none autocomplete=username required><input id=p type=password placeholder=Password autocomplete=current-password required><button class=btn>Log in</button><p class=err>${msg}</p></form><p class=sub>Accounts are made by the Leader. Ask Yug for your username.</p>`)}
async function doLogin(e){e.preventDefault();const{error}=await sb.auth.signInWithPassword({email:$("#u").value.trim().toLowerCase()+"@lci.app",password:$("#p").value});if(error)login("Wrong username or password.")}
async function boot(s){if(!s){me=null;return login()}
const{data}=await sb.from("profiles").select("*").eq("id",s.user.id).single();me=data;$("#tabs").hidden=false;route()}
sb.auth.onAuthStateChange((ev,s)=>{if(["INITIAL_SESSION","SIGNED_IN","SIGNED_OUT"].includes(ev))setTimeout(()=>boot(s),0)});

async function route(){if(!me)return;if(ch){sb.removeChannel(ch);ch=null}
const[,p="home",a=""]=location.hash.split("/");const v={home,learning,resources,community,profile}[p]||home;
document.querySelectorAll("#tabs a").forEach(x=>x.classList.toggle("on",x.hash==="#/"+(p==="resources"?"learning":p)));
scrollTo(0,0);await v(decodeURIComponent(a))}
addEventListener("hashchange",route);

async function home(){set(`<h1>LET'S CRACK IT</h1><p class=sub>by Yug</p><h2>New</h2><div class=list id=feed></div>`);
const load=async()=>{const{data}=await sb.from("resources").select("*").order("created_at",{ascending:false}).limit(25);
const f=$("#feed");if(!f)return;f.innerHTML=data?.length?data.map(r=>`<a class=row href="${esc(r.url)}" target=_blank rel=noopener><span class=ic>${r.kind==="exam"?"📝":"📄"}</span><span class=t>${esc(r.title)}<small>${esc(r.subject)}${r.chapter?" · "+esc(r.chapter):""} · ${esc(r.added_by_name)}</small></span><span class=when>${ago(r.created_at)}</span></a>`).join(""):`<p class=empty>Nothing here yet. New resources show up here as soon as a Leader adds them.</p>`};
await load();ch=sb.channel("feed").on("postgres_changes",{event:"*",schema:"public",table:"resources"},load).subscribe()}

function learning(){tab="material";set(`<h1>Learning</h1><p class=sub>Pick a subject</p><div class=list>${Object.keys(SUBJECTS).map(s=>`<a class=row href="#/resources/${encodeURIComponent(s)}"><span class=ic>${ICON[s]}</span><span class=t>${s}<small>${SUBJECTS[s].length} chapters</small></span><span class=chev>›</span></a>`).join("")}</div>`)}

async function resources(sub){const chs=SUBJECTS[sub];if(!chs)return location.hash="#/learning";cur=sub;
set(`<a class=back href="#/learning">‹ Learning</a><h1>${sub}</h1><div class=seg><button data-k=material>Study Material</button><button data-k=exam>Exam Prep</button></div><div id=form></div><div id=body></div>`);
$(".seg").onclick=e=>{const k=e.target.dataset.k;if(k){tab=k;draw()}};
const draw=async()=>{document.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.k===tab));
$("#form").innerHTML=staff()?`<details class=card><summary>Add resource</summary><form onsubmit="add(event)"><input name=t placeholder="Title" required>${tab==="material"?`<select name=c>${chs.map(c=>`<option>${esc(c)}</option>`).join("")}</select>`:""}<input name=l placeholder="Link (https://…)"><label class=file>or upload a file<input name=f type=file></label><button class=btn>Add resource</button></form></details>`:"";
const{data=[]}=await sb.from("resources").select("*").eq("subject",sub).eq("kind",tab).order("created_at",{ascending:false});
const item=r=>`<div class=row><a class=t href="${esc(r.url)}" target=_blank rel=noopener>${esc(r.title)}<small>${esc(r.added_by_name)} · ${ago(r.created_at)}</small></a>${staff()?`<button class=x onclick="del(${r.id})">Remove</button>`:""}</div>`;
const body=tab==="exam"?(data.length?`<div class=list>${data.map(item).join("")}</div>`:""):chs.filter(c=>data.some(r=>r.chapter===c)).map(c=>`<h2>${esc(c)}</h2><div class=list>${data.filter(r=>r.chapter===c).map(item).join("")}</div>`).join("");
$("#body").innerHTML=body||`<p class=empty>Nothing added yet.${staff()?" Use Add resource above.":""}</p>`};
await draw()}
async function add(e){e.preventDefault();const f=e.target,file=f.f.files[0],btn=f.querySelector("button");let url=f.l.value.trim();btn.disabled=true;
try{if(file){const path=`${cur}/${Date.now()}-${file.name.replace(/[^\w.-]/g,"_")}`;const{error}=await sb.storage.from("files").upload(path,file);if(error)throw error;url=sb.storage.from("files").getPublicUrl(path).data.publicUrl}
if(!/^https?:\/\//.test(url))throw Error("Add a file, or a link that starts with https://");
const{error}=await sb.from("resources").insert({subject:cur,kind:tab,chapter:tab==="material"?f.c.value:null,title:f.t.value.trim(),url,added_by_name:me.name});if(error)throw error;route()}
catch(x){btn.disabled=false;alert(x.message)}}
async function del(id){if(confirm("Remove this resource?")){await sb.from("resources").delete().eq("id",id);route()}}

async function community(){set(`<h1>Community</h1><p class=sub>Chat and share links with your class</p><div id=msgs class=chat></div><form class=send onsubmit="send(event)"><input id=m placeholder=Message autocomplete=off required maxlength=1000><button class=btn>Send</button></form>`);
const{data=[]}=await sb.from("messages").select("*").order("created_at",{ascending:false}).limit(100);data.reverse().forEach(bub);
ch=sb.channel("chat").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>bub(p.new)).subscribe()}
const link=s=>esc(s).replace(/https?:\/\/[^\s<]+/g,u=>`<a href="${u}" target=_blank rel=noopener>${u}</a>`);
function bub(m){const d=$("#msgs");if(!d)return;const mine=m.user_id===me.id;d.insertAdjacentHTML("beforeend",`<div class="b ${mine?"me":""}">${mine?"":`<small>${esc(m.name)}</small>`}${link(m.body)}</div>`);scrollTo(0,document.body.scrollHeight)}
async function send(e){e.preventDefault();const i=$("#m"),body=i.value.trim();if(!body)return;i.value="";await sb.from("messages").insert({body,name:me.name})}

async function profile(){let team="";
if(me.role==="leader"){const{data=[]}=await sb.from("profiles").select("*").order("name");
team=`<h2>Members</h2><div class=list>${data.map(p=>`<div class=row><span class=t>${esc(p.name)}</span>${p.id===me.id?`<span class=when>${ROLE[p.role]}</span>`:`<select onchange="setRole('${p.id}',this.value)">${Object.entries(ROLE).map(([k,v])=>`<option value=${k} ${k===p.role?"selected":""}>${v}</option>`).join("")}</select>`}</div>`).join("")}</div>`}
set(`<h1>Profile</h1><div class="card me"><div class=av>${esc(me.name[0])}</div><div><b>${esc(me.name)}</b><span class=badge>${ROLE[me.role]}</span></div></div>${team}<button class="btn out" onclick="sb.auth.signOut()">Log out</button>`)}
async function setRole(id,r){const{error}=await sb.from("profiles").update({role:r}).eq("id",id);if(error)alert(error.message)}
