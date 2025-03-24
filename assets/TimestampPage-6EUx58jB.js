import{d as c,r as p,c as l,V as T,X as v,W as g,f as u,a5 as s,a6 as U}from"./index-C04cCdW0.js";import{Q as V}from"./QPage-IcE97Bu1.js";import{d as w,a as D,f as C}from"./timeUtils-ODJ87_1F.js";const z=c({__name:"TimestampPage",setup(h){const a=p(new Date),o=l({get:()=>a.value.getTime(),set:t=>{const e=parseInt(t);e!==void 0&&(a.value=new Date(f(e)))}}),r=l({get:()=>w(a.value),set:t=>{const e=new Date(t);if(e!==void 0){const n=new Date(e.getTime()-e.getTimezoneOffset()*6e4);a.value=n}}}),i=l({get:()=>D(a.value,!1),set:t=>{const e=new Date(t);e!==void 0&&(a.value=e)}}),m=l(()=>d(o.value));function d(t){const e=Math.floor(Math.log10(t));return e>=18?"ns":e>=15?"µs":e>=12?"ms":"s"}function f(t){switch(d(t)){case"ns":return Math.round(t/1e6);case"µs":return Math.round(t/1e3);case"s":return t*1e3;case"ms":default:return t}}return(t,e)=>(g(),T(V,{padding:""},{default:v(()=>[u(s,{modelValue:o.value,"onUpdate:modelValue":e[0]||(e[0]=n=>o.value=n),label:"Unix Timestamp",hint:m.value},null,8,["modelValue","hint"]),u(s,{modelValue:r.value,"onUpdate:modelValue":e[1]||(e[1]=n=>r.value=n),label:"Date (UTC)",hint:"UTC date"},null,8,["modelValue"]),u(s,{modelValue:i.value,"onUpdate:modelValue":e[2]||(e[2]=n=>i.value=n),label:"Local date",hint:`Date in local timezone: UTC ${U(C)(a.value)}`},null,8,["modelValue","hint"])]),_:1}))}});export{z as default};
