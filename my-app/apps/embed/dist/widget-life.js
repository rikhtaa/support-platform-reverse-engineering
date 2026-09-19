// Put the chat widget onto the customer's website and connect it to your actual widget application.
(function(){"use strict";(function(){const n=document.currentScript;if(!n){console.error("Widget script not found.");return}const i=n.dataset.organizationId;if(!i){console.error("Missing data-organization-id.");return}const d="http://localhost:3000/embed",t=document.createElement("button");t.innerHTML="💬",t.style.cssText=`
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 999999;
  `,document.body.appendChild(t);const e=document.createElement("div");e.style.cssText=`
    position: fixed;
    right: 20px;
    bottom: 90px;
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 110px);
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,.2);
    z-index: 999998;
    display: none;
  `;const o=document.createElement("iframe");o.src=`${d}?organizationId=${encodeURIComponent(i)}`,o.style.cssText=`
    width: 100%;
    height: 100%;
    border: none;
  `,e.appendChild(o),document.body.appendChild(e),t.addEventListener("click",()=>{e.style.display==="none"?e.style.display="block":e.style.display="none"})})()})();
