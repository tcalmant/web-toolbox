import{k as d,c as u,h as c,l as h,bj as L,u as S,x as p,g as E,z as I,m as R,r as b,ab as A,aw as j,t as Q}from"./index-QLAcIGo9.js";let K=!1;{const e=document.createElement("div");e.setAttribute("dir","rtl"),Object.assign(e.style,{width:"1px",height:"1px",overflow:"auto"});const t=document.createElement("div");Object.assign(t.style,{width:"1000px",height:"1px"}),document.body.appendChild(e),e.appendChild(t),e.scrollLeft=-1e3,K=e.scrollLeft>=0,e.remove()}const P=d({name:"QItemLabel",props:{overline:Boolean,caption:Boolean,header:Boolean,lines:[Number,String]},setup(e,{slots:t}){const l=u(()=>parseInt(e.lines,10)),n=u(()=>"q-item__label"+(e.overline===!0?" q-item__label--overline text-overline":"")+(e.caption===!0?" q-item__label--caption text-caption":"")+(e.header===!0?" q-item__label--header":"")+(l.value===1?" ellipsis":"")),i=u(()=>e.lines!==void 0&&l.value>1?{overflow:"hidden",display:"-webkit-box","-webkit-box-orient":"vertical","-webkit-line-clamp":l.value}:null);return()=>c("div",{style:i.value,class:n.value},h(t.default))}});function $(){if(window.getSelection!==void 0){const e=window.getSelection();e.empty!==void 0?e.empty():e.removeAllRanges!==void 0&&(e.removeAllRanges(),L.is.mobile!==!0&&e.addRange(document.createRange()))}else document.selection!==void 0&&document.selection.empty()}function z(e,t,l){return l<=t?t:Math.min(l,Math.max(t,e))}function D(e,t,l){if(l<=t)return t;const n=l-t+1;let i=t+(e-t)%n;return i<t&&(i=n+i),i===0?0:i}function F(e,t=2,l="0"){if(e==null)return e;const n=""+e;return n.length>=t?n:new Array(t-n.length+1).join(l)+n}const M=d({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:t}){const l=u(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>c("div",{class:l.value},h(t.default))}}),N=d({name:"QItem",props:{...p,...S,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:t,emit:l}){const{proxy:{$q:n}}=E(),i=I(e,n),{hasLink:v,linkAttrs:q,linkClass:g,linkTag:k,navigateOnClick:y}=R(),s=b(null),r=b(null),m=u(()=>e.clickable===!0||v.value===!0||e.tag==="label"),o=u(()=>e.disable!==!0&&m.value===!0),_=u(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(i.value===!0?" q-item--dark":"")+(v.value===!0&&e.active===null?g.value:e.active===!0?` q-item--active${e.activeClass!==void 0?` ${e.activeClass}`:""}`:"")+(e.disable===!0?" disabled":"")+(o.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),w=u(()=>e.insetLevel===void 0?null:{["padding"+(n.lang.rtl===!0?"Right":"Left")]:16+e.insetLevel*56+"px"});function x(a){o.value===!0&&(r.value!==null&&a.qAvoidFocus!==!0&&(a.qKeyEvent!==!0&&document.activeElement===s.value?r.value.focus():document.activeElement===r.value&&s.value.focus()),y(a))}function B(a){if(o.value===!0&&A(a,[13,32])===!0){j(a),a.qKeyEvent=!0;const f=new MouseEvent("click",a);f.qKeyEvent=!0,s.value.dispatchEvent(f)}l("keyup",a)}function C(){const a=Q(t.default,[]);return o.value===!0&&a.unshift(c("div",{class:"q-focus-helper",tabindex:-1,ref:r})),a}return()=>{const a={ref:s,class:_.value,style:w.value,role:"listitem",onClick:x,onKeyup:B};return o.value===!0?(a.tabindex=e.tabindex||"0",Object.assign(a,q.value)):m.value===!0&&(a["aria-disabled"]="true"),c(k.value,a,C())}}});export{N as Q,M as a,z as b,P as c,$ as d,D as n,F as p,K as r};
