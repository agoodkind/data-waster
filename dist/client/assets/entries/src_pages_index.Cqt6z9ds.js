import{r as o,j as e,i as U,L as C,o as O}from"../chunks/chunk-DvQwP9im.js";import"../chunks/chunk-BBHFXXKC.js";/* empty css                      *//* empty css                      */const _=s=>{const a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=new Uint32Array(s);return crypto.getRandomValues(r),Array.from(r,c=>a[c%a.length]).join("")},B=s=>new Promise(a=>setTimeout(a,s)),I=()=>{let s=0;const a=1e3;return r=>{const c=Date.now();c-s>a&&(console.error(r),s=c)}},P=I(),D=1048576,H="./data-waste.bin",W="./wastebin.html",V=2e3,$=64,F=1e3,Y=10,G=2,K=50,Q=50,X=30,q=30,J=1,R=1,Z=8,ee=100,te=1e3;function re(){const[s,a]=o.useState({downloadedMB:0,uploadedMB:0,totalMB:0,speedMBps:0,downloadPct:0,uploadPct:0,totalPct:0,status:""}),r=o.useRef(!1),c=o.useRef(0),b=o.useRef(0),E=o.useRef(0),h=o.useRef(!1),N=o.useRef([]),v=o.useRef([]),g=o.useRef(void 0),n=o.useRef({sizeMB:0,threads:Z,download:!0,upload:!0}),x=()=>{if(n.current.sizeMB===0)return!1;const t=c.current+b.current,d=n.current.sizeMB*D;return t>=d},T=()=>{const t=n.current,d=c.current/D,l=b.current/D,u=d+l,j=t.sizeMB||1/0,f=m=>j===1/0?0:m/j*ee,i=(Date.now()-E.current)/te,p=i?u/i:0;a(m=>({...m,downloadedMB:d,uploadedMB:l,totalMB:u,speedMBps:p,downloadPct:f(d),uploadPct:f(l),totalPct:f(u)})),t.sizeMB&&u>=t.sizeMB&&r.current&&(w(),a(m=>({...m,status:"Completed"}))),r.current&&i>q&&p<J&&h.current&&t.sizeMB&&a(m=>({...m,status:"Network too slow to waste efficiently"}))},S=o.useCallback(t=>{if(!r.current){if(!t.download&&!t.upload){a(d=>({...d,status:"Select at least one mode"}));return}n.current=t,c.current=0,b.current=0,N.current=[],v.current=[],h.current=!1,E.current=Date.now(),r.current=!0,T(),g.current=setInterval(T,K),t.download&&y(),t.upload&&A()}},[]),w=o.useCallback(()=>{r.current&&(r.current=!1,N.current.forEach(t=>t.abort()),v.current.forEach(t=>t.abort()),g.current&&clearInterval(g.current),a(t=>({...t,status:"Stopped",speedMBps:0})))},[]),y=()=>{const t=n.current.upload?Math.max(R,Math.floor(n.current.threads/2)):n.current.threads;Array.from({length:t},(d,l)=>L(l))},L=async t=>{const d=new AbortController;for(N.current[t]=d;r.current&&!x();){try{const l=`${Date.now()}-${Math.random()}`,u=await fetch(`${H}?t=${l}`,{headers:{"Accept-Encoding":"identity"},signal:d.signal});h.current=!0;const j=u.body.getReader();for(;r.current&&!x();){const{done:f,value:i}=await j.read();if(f)break;c.current+=i.length}}catch(l){P(l)}!x()&&r.current&&await B(Q)}},A=()=>{const t=n.current.download?Math.max(R,Math.floor(n.current.threads/2)):n.current.threads;Array.from({length:t},(d,l)=>z(l))},z=async t=>{const d=new AbortController;for(v.current[t]=d;r.current&&!x();){try{const l=_(V),u=Array.from({length:$},()=>{const i=`X-Random-${_(Y)}`,p=_(F),m=i.length+p.length+G;return{name:i,value:p,bytes:m}}),j=u.reduce((i,{name:p,value:m})=>(i[p]=m,i),{}),f=u.reduce((i,{bytes:p})=>i+p,0);await fetch(`${W}?waste=${l}`,{method:"GET",headers:{"Content-Encoding":"identity",...j},signal:d.signal}),h.current=!0,b.current+=l.length+f}catch(l){P(l)}!x()&&r.current&&await B(X)}};return o.useEffect(()=>w,[w]),{metrics:s,start:S,stop:w,running:r.current}}function ae({onSwitchToModern:s}){return o.useEffect(()=>{const a=document.createElement("script");return a.src="/legacy.js",a.async=!0,document.body.appendChild(a),()=>{document.body.removeChild(a),window.dataWaster&&(window.dataWaster.stop&&window.dataWaster.stop(),delete window.dataWaster)}},[]),e.jsxs("div",{className:"legacy-container",children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:se}}),e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"text-center mb-5",children:[e.jsx("h1",{id:"title",className:"display-4 fw-bold",children:"Data Waster"}),e.jsx("p",{id:"desc",className:"lead text-muted",children:"Burn bandwidth for tests or throttling detection."}),s&&e.jsx("button",{onClick:s,className:"btn btn-link",style:{color:"#0d6efd",textDecoration:"none",marginTop:"1rem"},children:"← Switch to Modern UI"})]}),e.jsx("div",{className:"card shadow-sm",children:e.jsxs("div",{className:"card-body",children:[e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"d-flex justify-content-center gap-3",children:[e.jsx("button",{id:"downloadOption",className:"btn btn-outline-primary mode-toggle active","data-active":"true",children:e.jsx("span",{id:"downloadLabel",children:"Download"})}),e.jsx("button",{id:"uploadOption",className:"btn btn-outline-primary mode-toggle active","data-active":"true",children:e.jsx("span",{id:"uploadLabel",children:"Upload"})})]}),e.jsx("small",{id:"toggleHint",className:"text-muted d-block text-center mt-2",children:"Click to toggle download/upload modes"})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{htmlFor:"dataSize",className:"form-label",children:e.jsx("span",{id:"sizeLabel",children:"Target size (MB, 0 = ∞)"})}),e.jsx("input",{type:"number",className:"form-control",id:"dataSize",defaultValue:"100",min:"0"})]}),e.jsxs("div",{className:"mb-4",children:[e.jsxs("label",{htmlFor:"threadCount",className:"form-label",children:[e.jsx("span",{id:"threadLabel",children:"Threads"}),": ",e.jsx("span",{id:"threadValue",children:"8"})]}),e.jsx("input",{type:"range",className:"form-range",id:"threadCount",min:"1",max:"64",defaultValue:"8"})]}),e.jsx("button",{id:"startButton",className:"btn btn-primary w-100 mb-4",children:"Start"}),e.jsxs("div",{className:"mb-3",children:[e.jsx("label",{className:"form-label",children:e.jsx("span",{id:"downloadProgressLabel",children:"Download Progress"})}),e.jsx("div",{className:"progress",children:e.jsx("div",{id:"downloadProgress",className:"progress-bar bg-info",role:"progressbar",style:{width:"0%"},"aria-valuenow":0,"aria-valuemin":0,"aria-valuemax":100})})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("label",{className:"form-label",children:e.jsx("span",{id:"uploadProgressLabel",children:"Upload Progress"})}),e.jsx("div",{className:"progress",children:e.jsx("div",{id:"uploadProgress",className:"progress-bar bg-success",role:"progressbar",style:{width:"0%"},"aria-valuenow":0,"aria-valuemin":0,"aria-valuemax":100})})]}),e.jsxs("div",{className:"row text-center",children:[e.jsx("div",{className:"col-md-3 mb-3",children:e.jsxs("div",{className:"stat-box",children:[e.jsx("h5",{className:"text-muted mb-1",children:e.jsx("span",{id:"totalProgressLabel",children:"Total (MB)"})}),e.jsx("p",{className:"h4 mb-0",children:e.jsx("span",{id:"totalBytesProcessed",children:"0.00"})})]})}),e.jsx("div",{className:"col-md-3 mb-3",children:e.jsxs("div",{className:"stat-box",children:[e.jsx("h5",{className:"text-muted mb-1",children:"Downloaded (MB)"}),e.jsx("p",{className:"h4 mb-0",children:e.jsx("span",{id:"bytesDownloaded",children:"0.00"})})]})}),e.jsx("div",{className:"col-md-3 mb-3",children:e.jsxs("div",{className:"stat-box",children:[e.jsx("h5",{className:"text-muted mb-1",children:"Uploaded (MB)"}),e.jsx("p",{className:"h4 mb-0",children:e.jsx("span",{id:"bytesUploaded",children:"0.00"})})]})}),e.jsx("div",{className:"col-md-3 mb-3",children:e.jsxs("div",{className:"stat-box",children:[e.jsx("h5",{className:"text-muted mb-1",children:e.jsx("span",{id:"totalSpeedLabel",children:"Speed (MB/s)"})}),e.jsx("p",{className:"h4 mb-0",children:e.jsx("span",{id:"totalTransferSpeed",children:"0.00"})})]})})]}),e.jsx("div",{id:"statusMessage",className:"text-center mt-3 text-warning"})]})})]})]})}const se=`
  .legacy-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .container {
    width: 100%;
  }

  .display-4 {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .lead {
    font-size: 1.25rem;
    font-weight: 300;
  }

  .text-muted {
    color: #6c757d !important;
  }

  .text-center {
    text-align: center !important;
  }

  .text-warning {
    color: #ffc107 !important;
  }

  .text-success {
    color: #28a745 !important;
  }

  .text-info {
    color: #17a2b8 !important;
  }

  .mb-1 { margin-bottom: 0.25rem !important; }
  .mb-3 { margin-bottom: 1rem !important; }
  .mb-4 { margin-bottom: 1.5rem !important; }
  .mb-5 { margin-bottom: 3rem !important; }
  .mt-2 { margin-top: 0.5rem !important; }
  .mt-3 { margin-top: 1rem !important; }

  .card {
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
  }

  .shadow-sm {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
  }

  .card-body {
    padding: 2rem;
  }

  .form-label {
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  .form-control {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
  }

  .form-range {
    width: 100%;
    height: 1.5rem;
    padding: 0;
    background-color: transparent;
    appearance: none;
  }

  .form-range::-webkit-slider-track {
    width: 100%;
    height: 0.5rem;
    color: transparent;
    cursor: pointer;
    background-color: #dee2e6;
    border-color: transparent;
    border-radius: 1rem;
  }

  .form-range::-webkit-slider-thumb {
    width: 1rem;
    height: 1rem;
    margin-top: -0.25rem;
    background-color: #0d6efd;
    border: 0;
    border-radius: 1rem;
    appearance: none;
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: all 0.15s ease-in-out;
    cursor: pointer;
  }

  .btn-primary {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .btn-primary:hover {
    background-color: #0b5ed7;
    border-color: #0a58ca;
  }

  .btn-primary:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
    cursor: not-allowed;
  }

  .btn-outline-primary {
    color: #0d6efd;
    border-color: #0d6efd;
    background-color: transparent;
  }

  .btn-outline-primary:hover,
  .btn-outline-primary.active {
    color: #fff;
    background-color: #0d6efd;
    border-color: #0d6efd;
  }

  .btn-link {
    font-weight: 400;
    color: #0d6efd;
    text-decoration: none;
    background-color: transparent;
    border: none;
    padding: 0.375rem 0.75rem;
    cursor: pointer;
  }

  .btn-link:hover {
    color: #0a58ca;
    text-decoration: underline;
  }

  .w-100 {
    width: 100% !important;
  }

  .d-flex {
    display: flex !important;
  }

  .d-block {
    display: block !important;
  }

  .justify-content-center {
    justify-content: center !important;
  }

  .gap-3 {
    gap: 1rem !important;
  }

  .progress {
    display: flex;
    height: 1rem;
    overflow: hidden;
    font-size: 0.75rem;
    background-color: #e9ecef;
    border-radius: 0.25rem;
  }

  .progress-bar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    background-color: #0d6efd;
    transition: width 0.6s ease;
  }

  .bg-info {
    background-color: #0dcaf0 !important;
  }

  .bg-success {
    background-color: #198754 !important;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.75rem;
    margin-left: -0.75rem;
  }

  .col-md-3 {
    flex: 0 0 auto;
    width: 25%;
    padding-right: 0.75rem;
    padding-left: 0.75rem;
  }

  @media (max-width: 768px) {
    .col-md-3 {
      width: 50%;
    }
  }

  .stat-box {
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.25rem;
  }

  .h4 {
    font-size: 1.5rem;
  }

  .h5 {
    font-size: 1.25rem;
  }

  .fw-bold {
    font-weight: 700 !important;
  }
`;function oe(){const[s,a]=o.useState(!0),[r,c]=o.useState(!0),[b,E]=o.useState(1e4),[h,N]=o.useState(16),[v,g]=o.useState(!1),{metrics:n,start:x,stop:T,running:S}=re(),w=()=>{if(S){T();return}x({sizeMB:b,threads:h,download:s,upload:r})};return v?e.jsx(ae,{onSwitchToModern:()=>g(!1)}):e.jsxs("main",{className:"max-w-md mx-auto p-6 space-y-8 font-sans",children:[e.jsxs("header",{className:"text-center",children:[e.jsx("h1",{className:"text-3xl font-bold",children:"Data Waster"}),e.jsx("p",{className:"text-gray-500",children:"Burn bandwidth for tests or throttling detection."}),e.jsx("button",{onClick:()=>g(!0),className:"mt-4 text-sm text-blue-600 hover:underline",children:"Switch to Legacy UI →"})]}),e.jsxs("div",{className:"flex justify-center gap-4",children:[e.jsx(k,{active:s,label:"Download",onClick:()=>a(!s)}),e.jsx(k,{active:r,label:"Upload",onClick:()=>c(!r)})]}),e.jsxs("label",{className:"block mb-4",children:[e.jsx("span",{className:"text-sm mr-2",children:"Target size (MB, 0 = ∞)"}),e.jsx("input",{type:"number",min:0,value:b,onChange:y=>E(Number(y.target.value)),className:"w-28 px-2 py-1 border rounded"})]}),e.jsxs("label",{className:"flex items-center gap-2 mb-8",children:[e.jsx("span",{className:"text-sm",children:"Threads"}),e.jsx("input",{type:"range",min:1,max:32,value:h,onChange:y=>N(Number(y.target.value)),className:"flex-1 accent-blue-600"}),e.jsx("span",{className:"w-6 text-right",children:h})]}),e.jsx("button",{onClick:w,disabled:!s&&!r,className:`w-full py-2 rounded text-white transition
                    ${S?"bg-red-600":"bg-blue-600 disabled:bg-gray-400"}`,children:S?"Stop":"Start"}),e.jsxs("div",{className:"mt-8 space-y-1",children:[e.jsxs("span",{className:"text-xs text-gray-600",children:[n.totalPct.toFixed(1),"%"]}),e.jsx("div",{className:"w-full h-3 bg-gray-200 rounded overflow-hidden",children:e.jsx("div",{className:"h-full bg-blue-600 transition-all",style:{width:`${n.totalPct}%`}})})]}),e.jsxs("section",{className:"grid grid-cols-2 gap-4 text-center text-sm mt-6",children:[e.jsx(M,{label:"Downloaded (MB)",value:n.downloadedMB}),e.jsx(M,{label:"Uploaded (MB)",value:n.uploadedMB}),e.jsx(M,{label:"Total (MB)",value:n.totalMB}),e.jsx(M,{label:"Speed (MB/s)",value:n.speedMBps})]}),e.jsx("p",{className:"text-center text-sm text-yellow-600 mt-4 h-5",children:n.status})]})}function k({active:s,label:a,onClick:r}){return e.jsx("button",{onClick:r,className:`px-4 py-2 rounded border border-blue-600 transition
                  ${s?"bg-blue-600 text-white":"text-blue-600"}`,children:a})}function M({label:s,value:a}){return e.jsxs("div",{children:[e.jsx("span",{className:"block text-gray-500",children:s}),e.jsx("span",{className:"font-mono",children:a.toFixed(2)})]})}const ne=Object.freeze(Object.defineProperty({__proto__:null,default:oe},Symbol.toStringTag,{value:"Module"})),le="Data waster",de=Object.freeze(Object.defineProperty({__proto__:null,title:le},Symbol.toStringTag,{value:"Module"})),pe={serverOnlyHooks:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-react/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:O}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/src/pages/index/+Page.tsx",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ne}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-react/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/src/pages/Layout.tsx",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"pointer-import",value:C}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/src/pages/index/+title.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:de}},Loading:{type:"standard",definedAtData:{filePathToShowToUser:"vike-react/__internal/integration/Loading",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:U}}};export{pe as configValuesSerialized};
