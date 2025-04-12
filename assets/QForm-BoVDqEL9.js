import{k as M,c as v,h as r,l as A,g as Q,t as yt,S as Ae,x as Se,z as ye,aM as ht,r as N,w as V,aN as wt,aL as $e,aS as Ne,o as he,at as Qe,as as He,q as ze,N as Ie,aT as _t,aU as qt,aV as Ct,aW as Le,av as me,aX as Ve,a3 as Pt,E as we,aY as kt,ap as be,a6 as U,W as te,am as Rt,a9 as xt,aw as Ee,aZ as Ft,I as Tt,a_ as Bt}from"./index-QLAcIGo9.js";import{a as Ot}from"./QList-CpzgJxK_.js";import{d as $t,e as Lt,f as Ue,c as Vt}from"./QPage-DMsL4sn3.js";const vl=M({name:"QTd",props:{props:Object,autoWidth:Boolean,noHover:Boolean},setup(e,{slots:l}){const n=Q(),f=v(()=>"q-td"+(e.autoWidth===!0?" q-table--col-auto-width":"")+(e.noHover===!0?" q-td--no-hover":"")+" ");return()=>{if(e.props===void 0)return r("td",{class:f.value},A(l.default));const o=n.vnode.key,c=(e.props.colsMap!==void 0?e.props.colsMap[o]:null)||e.props.col;if(c===void 0)return;const{row:i}=e.props;return r("td",{class:f.value+c.__tdClass(i),style:c.__tdStyle(i)},A(l.default))}}}),fl=M({name:"QTr",props:{props:Object,noHover:Boolean},setup(e,{slots:l}){const n=v(()=>"q-tr"+(e.props===void 0||e.props.header===!0?"":" "+e.props.__trClass)+(e.noHover===!0?" q-tr--no-hover":""));return()=>r("tr",{style:e.props?.__trStyle,class:n.value},A(l.default))}}),Et=M({name:"QTh",props:{props:Object,autoWidth:Boolean},emits:["click"],setup(e,{slots:l,emit:n}){const f=Q(),{proxy:{$q:o}}=f,c=i=>{n("click",i)};return()=>{if(e.props===void 0)return r("th",{class:e.autoWidth===!0?"q-table--col-auto-width":"",onClick:c},A(l.default));let i,u;const d=f.vnode.key;if(d){if(i=e.props.colsMap[d],i===void 0)return}else i=e.props.col;if(i.sortable===!0){const a=i.align==="right"?"unshift":"push";u=yt(l.default,[]),u[a](r(Ae,{class:i.__iconClass,name:o.iconSet.table.arrowUp}))}else u=A(l.default);const y={class:i.__thClass+(e.autoWidth===!0?" q-table--col-auto-width":""),style:i.headerStyle,onClick:a=>{i.sortable===!0&&e.props.sort(i),c(a)}};return r("th",y,u)}}}),Mt=["horizontal","vertical","cell","none"],Dt=M({name:"QMarkupTable",props:{...Se,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,wrapCells:Boolean,separator:{type:String,default:"horizontal",validator:e=>Mt.includes(e)}},setup(e,{slots:l}){const n=Q(),f=ye(e,n.proxy.$q),o=v(()=>`q-markup-table q-table__container q-table__card q-table--${e.separator}-separator`+(f.value===!0?" q-table--dark q-table__card--dark q-dark":"")+(e.dense===!0?" q-table--dense":"")+(e.flat===!0?" q-table--flat":"")+(e.bordered===!0?" q-table--bordered":"")+(e.square===!0?" q-table--square":"")+(e.wrapCells===!1?" q-table--no-wrap":""));return()=>r("div",{class:o.value},[r("table",{class:"q-table"},A(l.default))])}});function pe(e,l){return r("div",e,[r("table",{class:"q-table"},l)])}const jt={list:Ot,table:Dt},At=["list","table","__qtable"],Nt=M({name:"QVirtualScroll",props:{...$t,type:{type:String,default:"list",validator:e=>At.includes(e)},items:{type:Array,default:()=>[]},itemsFn:Function,itemsSize:Number,scrollTarget:ht},setup(e,{slots:l,attrs:n}){let f;const o=N(null),c=v(()=>e.itemsSize>=0&&e.itemsFn!==void 0?parseInt(e.itemsSize,10):Array.isArray(e.items)?e.items.length:0),{virtualScrollSliceRange:i,localResetVirtualScroll:u,padVirtualScroll:d,onVirtualScrollEvt:y}=Lt({virtualScrollLength:c,getVirtualScrollTarget:q,getVirtualScrollEl:g}),a=v(()=>{if(c.value===0)return[];const O=(k,C)=>({index:i.value.from+C,item:k});return e.itemsFn===void 0?e.items.slice(i.value.from,i.value.to).map(O):e.itemsFn(i.value.from,i.value.to-i.value.from).map(O)}),b=v(()=>"q-virtual-scroll q-virtual-scroll"+(e.virtualScrollHorizontal===!0?"--horizontal":"--vertical")+(e.scrollTarget!==void 0?"":" scroll")),P=v(()=>e.scrollTarget!==void 0?{}:{tabindex:0});V(c,()=>{u()}),V(()=>e.scrollTarget,()=>{w(),_()});function g(){return o.value.$el||o.value}function q(){return f}function _(){f=wt(g(),e.scrollTarget),f.addEventListener("scroll",y,$e.passive)}function w(){f!==void 0&&(f.removeEventListener("scroll",y,$e.passive),f=void 0)}function B(){let O=d(e.type==="list"?"div":"tbody",a.value.map(l.default));return l.before!==void 0&&(O=l.before().concat(O)),Ie(l.after,O)}return Ne(()=>{u()}),he(()=>{_()}),Qe(()=>{_()}),He(()=>{w()}),ze(()=>{w()}),()=>{if(l.default===void 0){console.error("QVirtualScroll: default scoped slot is required for rendering");return}return e.type==="__qtable"?pe({ref:o,class:"q-table__middle "+b.value},B()):r(jt[e.type],{...n,ref:o,class:[n.class,b.value],...P.value},B)}}}),Qt={xs:2,sm:4,md:6,lg:10,xl:14};function Me(e,l,n){return{transform:l===!0?`translateX(${n.lang.rtl===!0?"-":""}100%) scale3d(${-e},1,1)`:`scale3d(${e},1,1)`}}const Ht=M({name:"QLinearProgress",props:{...Se,..._t,value:{type:Number,default:0},buffer:Number,color:String,trackColor:String,reverse:Boolean,stripe:Boolean,indeterminate:Boolean,query:Boolean,rounded:Boolean,animationSpeed:{type:[String,Number],default:2100},instantFeedback:Boolean},setup(e,{slots:l}){const{proxy:n}=Q(),f=ye(e,n.$q),o=qt(e,Qt),c=v(()=>e.indeterminate===!0||e.query===!0),i=v(()=>e.reverse!==e.query),u=v(()=>({...o.value!==null?o.value:{},"--q-linear-progress-speed":`${e.animationSpeed}ms`})),d=v(()=>"q-linear-progress"+(e.color!==void 0?` text-${e.color}`:"")+(e.reverse===!0||e.query===!0?" q-linear-progress--reverse":"")+(e.rounded===!0?" rounded-borders":"")),y=v(()=>Me(e.buffer!==void 0?e.buffer:1,i.value,n.$q)),a=v(()=>`with${e.instantFeedback===!0?"out":""}-transition`),b=v(()=>`q-linear-progress__track absolute-full q-linear-progress__track--${a.value} q-linear-progress__track--${f.value===!0?"dark":"light"}`+(e.trackColor!==void 0?` bg-${e.trackColor}`:"")),P=v(()=>Me(c.value===!0?1:e.value,i.value,n.$q)),g=v(()=>`q-linear-progress__model absolute-full q-linear-progress__model--${a.value} q-linear-progress__model--${c.value===!0?"in":""}determinate`),q=v(()=>({width:`${e.value*100}%`})),_=v(()=>`q-linear-progress__stripe absolute-${e.reverse===!0?"right":"left"} q-linear-progress__stripe--${a.value}`);return()=>{const w=[r("div",{class:b.value,style:y.value}),r("div",{class:g.value,style:P.value})];return e.stripe===!0&&c.value===!1&&w.push(r("div",{class:_.value,style:q.value})),r("div",{class:d.value,style:u.value,role:"progressbar","aria-valuemin":0,"aria-valuemax":1,"aria-valuenow":e.indeterminate===!0?void 0:e.value},Ie(l.default,w))}}});let p=0;const zt={fullscreen:Boolean,noRouteFullscreenExit:Boolean},It=["update:fullscreen","fullscreen"];function Ut(){const e=Q(),{props:l,emit:n,proxy:f}=e;let o,c,i;const u=N(!1);Ct(e)===!0&&V(()=>f.$route.fullPath,()=>{l.noRouteFullscreenExit!==!0&&a()}),V(()=>l.fullscreen,b=>{u.value!==b&&d()}),V(u,b=>{n("update:fullscreen",b),n("fullscreen",b)});function d(){u.value===!0?a():y()}function y(){u.value!==!0&&(u.value=!0,i=f.$el.parentNode,i.replaceChild(c,f.$el),document.body.appendChild(f.$el),p++,p===1&&document.body.classList.add("q-body--fullscreen-mixin"),o={handler:a},Le.add(o))}function a(){u.value===!0&&(o!==void 0&&(Le.remove(o),o=void 0),i.replaceChild(f.$el,c),u.value=!1,p=Math.max(0,p-1),p===0&&(document.body.classList.remove("q-body--fullscreen-mixin"),f.$el.scrollIntoView!==void 0&&setTimeout(()=>{f.$el.scrollIntoView()})))}return Ne(()=>{c=document.createElement("span")}),he(()=>{l.fullscreen===!0&&y()}),ze(a),Object.assign(f,{toggleFullscreen:d,setFullscreen:y,exitFullscreen:a}),{inFullscreen:u,toggleFullscreen:d}}function pt(e,l){return new Date(e)-new Date(l)}const Wt={sortMethod:Function,binaryStateSort:Boolean,columnSortOrder:{type:String,validator:e=>e==="ad"||e==="da",default:"ad"}};function Kt(e,l,n,f){const o=v(()=>{const{sortBy:u}=l.value;return u&&n.value.find(d=>d.name===u)||null}),c=v(()=>e.sortMethod!==void 0?e.sortMethod:(u,d,y)=>{const a=n.value.find(g=>g.name===d);if(a===void 0||a.field===void 0)return u;const b=y===!0?-1:1,P=typeof a.field=="function"?g=>a.field(g):g=>g[a.field];return u.sort((g,q)=>{let _=P(g),w=P(q);return a.rawSort!==void 0?a.rawSort(_,w,g,q)*b:_==null?-1*b:w==null?1*b:a.sort!==void 0?a.sort(_,w,g,q)*b:me(_)===!0&&me(w)===!0?(_-w)*b:Ve(_)===!0&&Ve(w)===!0?pt(_,w)*b:typeof _=="boolean"&&typeof w=="boolean"?(_-w)*b:([_,w]=[_,w].map(B=>(B+"").toLocaleString().toLowerCase()),_<w?-1*b:_===w?0:b)})});function i(u){let d=e.columnSortOrder;if(Pt(u)===!0)u.sortOrder&&(d=u.sortOrder),u=u.name;else{const b=n.value.find(P=>P.name===u);b?.sortOrder&&(d=b.sortOrder)}let{sortBy:y,descending:a}=l.value;y!==u?(y=u,a=d==="da"):e.binaryStateSort===!0?a=!a:a===!0?d==="ad"?y=null:a=!1:d==="ad"?a=!0:y=null,f({sortBy:y,descending:a,page:1})}return{columnToSort:o,computedSortMethod:c,sort:i}}const Gt={filter:[String,Object],filterMethod:Function};function Xt(e,l){const n=v(()=>e.filterMethod!==void 0?e.filterMethod:(f,o,c,i)=>{const u=o?o.toLowerCase():"";return f.filter(d=>c.some(y=>{const a=i(y,d)+"";return(a==="undefined"||a==="null"?"":a.toLowerCase()).indexOf(u)!==-1}))});return V(()=>e.filter,()=>{we(()=>{l({page:1},!0)})},{deep:!0}),{computedFilterMethod:n}}function Yt(e,l){for(const n in l)if(l[n]!==e[n])return!1;return!0}function De(e){return e.page<1&&(e.page=1),e.rowsPerPage!==void 0&&e.rowsPerPage<1&&(e.rowsPerPage=0),e}const Zt={pagination:Object,rowsPerPageOptions:{type:Array,default:()=>[5,7,10,15,20,25,50,0]},"onUpdate:pagination":[Function,Array]};function Jt(e,l){const{props:n,emit:f}=e,o=N(Object.assign({sortBy:null,descending:!1,page:1,rowsPerPage:n.rowsPerPageOptions.length!==0?n.rowsPerPageOptions[0]:5},n.pagination)),c=v(()=>{const a=n["onUpdate:pagination"]!==void 0?{...o.value,...n.pagination}:o.value;return De(a)}),i=v(()=>c.value.rowsNumber!==void 0);function u(a){d({pagination:a,filter:n.filter})}function d(a={}){we(()=>{f("request",{pagination:a.pagination||c.value,filter:a.filter||n.filter,getCellValue:l})})}function y(a,b){const P=De({...c.value,...a});if(Yt(c.value,P)===!0){i.value===!0&&b===!0&&u(P);return}if(i.value===!0){u(P);return}n.pagination!==void 0&&n["onUpdate:pagination"]!==void 0?f("update:pagination",P):o.value=P}return{innerPagination:o,computedPagination:c,isServerSide:i,requestServerInteraction:d,setPagination:y}}function el(e,l,n,f,o,c){const{props:i,emit:u,proxy:{$q:d}}=e,y=v(()=>f.value===!0?n.value.rowsNumber||0:c.value),a=v(()=>{const{page:C,rowsPerPage:R}=n.value;return(C-1)*R}),b=v(()=>{const{page:C,rowsPerPage:R}=n.value;return C*R}),P=v(()=>n.value.page===1),g=v(()=>n.value.rowsPerPage===0?1:Math.max(1,Math.ceil(y.value/n.value.rowsPerPage))),q=v(()=>b.value===0?!0:n.value.page>=g.value),_=v(()=>(i.rowsPerPageOptions.includes(l.value.rowsPerPage)?i.rowsPerPageOptions:[l.value.rowsPerPage].concat(i.rowsPerPageOptions)).map(R=>({label:R===0?d.lang.table.allRows:""+R,value:R})));V(g,(C,R)=>{if(C===R)return;const D=n.value.page;C&&!D?o({page:1}):C<D&&o({page:C})});function w(){o({page:1})}function B(){const{page:C}=n.value;C>1&&o({page:C-1})}function O(){const{page:C,rowsPerPage:R}=n.value;b.value>0&&C*R<y.value&&o({page:C+1})}function k(){o({page:g.value})}return i["onUpdate:pagination"]!==void 0&&u("update:pagination",{...n.value}),{firstRowIndex:a,lastRowIndex:b,isFirstPage:P,isLastPage:q,pagesNumber:g,computedRowsPerPageOptions:_,computedRowsNumber:y,firstPage:w,prevPage:B,nextPage:O,lastPage:k}}const tl={selection:{type:String,default:"none",validator:e=>["single","multiple","none"].includes(e)},selected:{type:Array,default:()=>[]}},ll=["update:selected","selection"];function al(e,l,n,f){const o=v(()=>{const q={};return e.selected.map(f.value).forEach(_=>{q[_]=!0}),q}),c=v(()=>e.selection!=="none"),i=v(()=>e.selection==="single"),u=v(()=>e.selection==="multiple"),d=v(()=>n.value.length!==0&&n.value.every(q=>o.value[f.value(q)]===!0)),y=v(()=>d.value!==!0&&n.value.some(q=>o.value[f.value(q)]===!0)),a=v(()=>e.selected.length);function b(q){return o.value[q]===!0}function P(){l("update:selected",[])}function g(q,_,w,B){l("selection",{rows:_,added:w,keys:q,evt:B});const O=i.value===!0?w===!0?_:[]:w===!0?e.selected.concat(_):e.selected.filter(k=>q.includes(f.value(k))===!1);l("update:selected",O)}return{hasSelectionMode:c,singleSelection:i,multipleSelection:u,allRowsSelected:d,someRowsSelected:y,rowsSelectedNumber:a,isRowSelected:b,clearSelection:P,updateSelection:g}}function je(e){return Array.isArray(e)?e.slice():[]}const nl={expanded:Array},ol=["update:expanded"];function rl(e,l){const n=N(je(e.expanded));V(()=>e.expanded,i=>{n.value=je(i)});function f(i){return n.value.includes(i)}function o(i){e.expanded!==void 0?l("update:expanded",i):n.value=i}function c(i,u){const d=n.value.slice(),y=d.indexOf(i);u===!0?y===-1&&(d.push(i),o(d)):y!==-1&&(d.splice(y,1),o(d))}return{isRowExpanded:f,setExpanded:o,updateExpanded:c}}const il={visibleColumns:Array};function sl(e,l,n){const f=v(()=>{if(e.columns!==void 0)return e.columns;const u=e.rows[0];return u!==void 0?Object.keys(u).map(d=>({name:d,label:d.toUpperCase(),field:d,align:me(u[d])?"right":"left",sortable:!0})):[]}),o=v(()=>{const{sortBy:u,descending:d}=l.value;return(e.visibleColumns!==void 0?f.value.filter(a=>a.required===!0||e.visibleColumns.includes(a.name)===!0):f.value).map(a=>{const b=a.align||"right",P=`text-${b}`;return{...a,align:b,__iconClass:`q-table__sort-icon q-table__sort-icon--${b}`,__thClass:P+(a.headerClasses!==void 0?" "+a.headerClasses:"")+(a.sortable===!0?" sortable":"")+(a.name===u?` sorted ${d===!0?"sort-desc":""}`:""),__tdStyle:a.style!==void 0?typeof a.style!="function"?()=>a.style:a.style:()=>null,__tdClass:a.classes!==void 0?typeof a.classes!="function"?()=>P+" "+a.classes:g=>P+" "+a.classes(g):()=>P}})}),c=v(()=>{const u={};return o.value.forEach(d=>{u[d.name]=d}),u}),i=v(()=>e.tableColspan!==void 0?e.tableColspan:o.value.length+(n.value===!0?1:0));return{colList:f,computedCols:o,computedColsMap:c,computedColspan:i}}const le="q-table__bottom row items-center",We={};Ue.forEach(e=>{We[e]={}});const gl=M({name:"QTable",props:{rows:{type:Array,required:!0},rowKey:{type:[String,Function],default:"id"},columns:Array,loading:Boolean,iconFirstPage:String,iconPrevPage:String,iconNextPage:String,iconLastPage:String,title:String,hideHeader:Boolean,grid:Boolean,gridHeader:Boolean,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,separator:{type:String,default:"horizontal",validator:e=>["horizontal","vertical","cell","none"].includes(e)},wrapCells:Boolean,virtualScroll:Boolean,virtualScrollTarget:{},...We,noDataLabel:String,noResultsLabel:String,loadingLabel:String,selectedRowsLabel:Function,rowsPerPageLabel:String,paginationLabel:Function,color:{type:String,default:"grey-8"},titleClass:[String,Array,Object],tableStyle:[String,Array,Object],tableClass:[String,Array,Object],tableHeaderStyle:[String,Array,Object],tableHeaderClass:[String,Array,Object],tableRowStyleFn:Function,tableRowClassFn:Function,cardContainerClass:[String,Array,Object],cardContainerStyle:[String,Array,Object],cardStyle:[String,Array,Object],cardClass:[String,Array,Object],cardStyleFn:Function,cardClassFn:Function,hideBottom:Boolean,hideSelectedBanner:Boolean,hideNoData:Boolean,hidePagination:Boolean,onRowClick:Function,onRowDblclick:Function,onRowContextmenu:Function,...Se,...zt,...il,...Gt,...Zt,...nl,...tl,...Wt},emits:["request","virtualScroll",...It,...ol,...ll],setup(e,{slots:l,emit:n}){const f=Q(),{proxy:{$q:o}}=f,c=ye(e,o),{inFullscreen:i,toggleFullscreen:u}=Ut(),d=v(()=>typeof e.rowKey=="function"?e.rowKey:t=>t[e.rowKey]),y=N(null),a=N(null),b=v(()=>e.grid!==!0&&e.virtualScroll===!0),P=v(()=>" q-table__card"+(c.value===!0?" q-table__card--dark q-dark":"")+(e.square===!0?" q-table--square":"")+(e.flat===!0?" q-table--flat":"")+(e.bordered===!0?" q-table--bordered":"")),g=v(()=>`q-table__container q-table--${e.separator}-separator column no-wrap`+(e.grid===!0?" q-table--grid":P.value)+(c.value===!0?" q-table--dark":"")+(e.dense===!0?" q-table--dense":"")+(e.wrapCells===!1?" q-table--no-wrap":"")+(i.value===!0?" fullscreen scroll":"")),q=v(()=>g.value+(e.loading===!0?" q-table--loading":""));V(()=>e.tableStyle+e.tableClass+e.tableHeaderStyle+e.tableHeaderClass+g.value,()=>{b.value===!0&&a.value?.reset()});const{innerPagination:_,computedPagination:w,isServerSide:B,requestServerInteraction:O,setPagination:k}=Jt(f,z),{computedFilterMethod:C}=Xt(e,k),{isRowExpanded:R,setExpanded:D,updateExpanded:W}=rl(e,n),ae=v(()=>{let t=e.rows;if(B.value===!0||t.length===0)return t;const{sortBy:s,descending:m}=w.value;return e.filter&&(t=C.value(t,e.filter,L.value,z)),Ze.value!==null&&(t=Je.value(e.rows===t?t.slice():t,s,m)),t}),_e=v(()=>ae.value.length),E=v(()=>{let t=ae.value;if(B.value===!0)return t;const{rowsPerPage:s}=w.value;return s!==0&&(G.value===0&&e.rows!==t?t.length>X.value&&(t=t.slice(0,X.value)):t=t.slice(G.value,X.value)),t}),{hasSelectionMode:H,singleSelection:Ke,multipleSelection:qe,allRowsSelected:Ge,someRowsSelected:Ce,rowsSelectedNumber:ne,isRowSelected:oe,clearSelection:Xe,updateSelection:K}=al(e,n,E,d),{colList:Ye,computedCols:L,computedColsMap:Pe,computedColspan:ke}=sl(e,w,H),{columnToSort:Ze,computedSortMethod:Je,sort:re}=Kt(e,w,Ye,k),{firstRowIndex:G,lastRowIndex:X,isFirstPage:ie,isLastPage:se,pagesNumber:Y,computedRowsPerPageOptions:et,computedRowsNumber:Z,firstPage:ue,prevPage:ce,nextPage:de,lastPage:ve}=el(f,_,w,B,k,_e),tt=v(()=>E.value.length===0),lt=v(()=>{const t={};return Ue.forEach(s=>{t[s]=e[s]}),t.virtualScrollItemSize===void 0&&(t.virtualScrollItemSize=e.dense===!0?28:48),t});function at(){b.value===!0&&a.value.reset()}function nt(){if(e.grid===!0)return mt();const t=e.hideHeader!==!0?Be:null;if(b.value===!0){const m=l["top-row"],S=l["bottom-row"],h={default:T=>xe(T.item,l.body,T.index)};if(m!==void 0){const T=r("tbody",m({cols:L.value}));h.before=t===null?()=>T:()=>[t()].concat(T)}else t!==null&&(h.before=t);return S!==void 0&&(h.after=()=>r("tbody",S({cols:L.value}))),r(Nt,{ref:a,class:e.tableClass,style:e.tableStyle,...lt.value,scrollTarget:e.virtualScrollTarget,items:E.value,type:"__qtable",tableColspan:ke.value,onVirtualScroll:rt},h)}const s=[it()];return t!==null&&s.unshift(t()),pe({class:["q-table__middle scroll",e.tableClass],style:e.tableStyle},s)}function ot(t,s){if(a.value!==null){a.value.scrollTo(t,s);return}t=parseInt(t,10);const m=y.value.querySelector(`tbody tr:nth-of-type(${t+1})`);if(m!==null){const S=y.value.querySelector(".q-table__middle.scroll"),h=m.offsetTop-e.virtualScrollStickySizeStart,T=h<S.scrollTop?"decrease":"increase";S.scrollTop=h,n("virtualScroll",{index:t,from:0,to:_.value.rowsPerPage-1,direction:T})}}function rt(t){n("virtualScroll",t)}function Re(){return[r(Ht,{class:"q-table__linear-progress",color:e.color,dark:c.value,indeterminate:!0,trackColor:"transparent"})]}function xe(t,s,m){const S=d.value(t),h=oe(S);if(s!==void 0){const F={key:S,row:t,pageIndex:m,__trClass:h?"selected":""};if(e.tableRowStyleFn!==void 0&&(F.__trStyle=e.tableRowStyleFn(t)),e.tableRowClassFn!==void 0){const j=e.tableRowClassFn(t);j&&(F.__trClass=`${j} ${F.__trClass}`)}return s(Fe(F))}const T=l["body-cell"],x=L.value.map(F=>{const j=l[`body-cell-${F.name}`],ee=j!==void 0?j:T;return ee!==void 0?ee(st({key:S,row:t,pageIndex:m,col:F})):r("td",{class:F.__tdClass(t),style:F.__tdStyle(t)},z(F,t))});if(H.value===!0){const F=l["body-selection"],j=F!==void 0?F(ut({key:S,row:t,pageIndex:m})):[r(be,{modelValue:h,color:e.color,dark:c.value,dense:e.dense,"onUpdate:modelValue":(ee,St)=>{K([S],[t],ee,St)}})];x.unshift(r("td",{class:"q-table--col-auto-width"},j))}const $={key:S,class:{selected:h}};if(e.onRowClick!==void 0&&($.class["cursor-pointer"]=!0,$.onClick=F=>{n("rowClick",F,t,m)}),e.onRowDblclick!==void 0&&($.class["cursor-pointer"]=!0,$.onDblclick=F=>{n("rowDblclick",F,t,m)}),e.onRowContextmenu!==void 0&&($.class["cursor-pointer"]=!0,$.onContextmenu=F=>{n("rowContextmenu",F,t,m)}),e.tableRowStyleFn!==void 0&&($.style=e.tableRowStyleFn(t)),e.tableRowClassFn!==void 0){const F=e.tableRowClassFn(t);F&&($.class[F]=!0)}return r("tr",$,x)}function it(){const t=l.body,s=l["top-row"],m=l["bottom-row"];let S=E.value.map((h,T)=>xe(h,t,T));return s!==void 0&&(S=s({cols:L.value}).concat(S)),m!==void 0&&(S=S.concat(m({cols:L.value}))),r("tbody",S)}function Fe(t){return fe(t),t.cols=t.cols.map(s=>U({...s},"value",()=>z(s,t.row))),t}function st(t){return fe(t),U(t,"value",()=>z(t.col,t.row)),t}function ut(t){return fe(t),t}function fe(t){Object.assign(t,{cols:L.value,colsMap:Pe.value,sort:re,rowIndex:G.value+t.pageIndex,color:e.color,dark:c.value,dense:e.dense}),H.value===!0&&U(t,"selected",()=>oe(t.key),(s,m)=>{K([t.key],[t.row],s,m)}),U(t,"expand",()=>R(t.key),s=>{W(t.key,s)})}function z(t,s){const m=typeof t.field=="function"?t.field(s):s[t.field];return t.format!==void 0?t.format(m,s):m}const I=v(()=>({pagination:w.value,pagesNumber:Y.value,isFirstPage:ie.value,isLastPage:se.value,firstPage:ue,prevPage:ce,nextPage:de,lastPage:ve,inFullscreen:i.value,toggleFullscreen:u}));function ct(){const t=l.top,s=l["top-left"],m=l["top-right"],S=l["top-selection"],h=H.value===!0&&S!==void 0&&ne.value>0,T="q-table__top relative-position row items-center";if(t!==void 0)return r("div",{class:T},[t(I.value)]);let x;if(h===!0?x=S(I.value).slice():(x=[],s!==void 0?x.push(r("div",{class:"q-table__control"},[s(I.value)])):e.title&&x.push(r("div",{class:"q-table__control"},[r("div",{class:["q-table__title",e.titleClass]},e.title)]))),m!==void 0&&(x.push(r("div",{class:"q-table__separator col"})),x.push(r("div",{class:"q-table__control"},[m(I.value)]))),x.length!==0)return r("div",{class:T},x)}const Te=v(()=>Ce.value===!0?null:Ge.value);function Be(){const t=dt();return e.loading===!0&&l.loading===void 0&&t.push(r("tr",{class:"q-table__progress"},[r("th",{class:"relative-position",colspan:ke.value},Re())])),r("thead",t)}function dt(){const t=l.header,s=l["header-cell"];if(t!==void 0)return t(ge({header:!0})).slice();const m=L.value.map(S=>{const h=l[`header-cell-${S.name}`],T=h!==void 0?h:s,x=ge({col:S});return T!==void 0?T(x):r(Et,{key:S.name,props:x},()=>S.label)});if(Ke.value===!0&&e.grid!==!0)m.unshift(r("th",{class:"q-table--col-auto-width"}," "));else if(qe.value===!0){const S=l["header-selection"],h=S!==void 0?S(ge({})):[r(be,{color:e.color,modelValue:Te.value,dark:c.value,dense:e.dense,"onUpdate:modelValue":Oe})];m.unshift(r("th",{class:"q-table--col-auto-width"},h))}return[r("tr",{class:e.tableHeaderClass,style:e.tableHeaderStyle},m)]}function ge(t){return Object.assign(t,{cols:L.value,sort:re,colsMap:Pe.value,color:e.color,dark:c.value,dense:e.dense}),qe.value===!0&&U(t,"selected",()=>Te.value,Oe),t}function Oe(t){Ce.value===!0&&(t=!1),K(E.value.map(d.value),E.value,t)}const J=v(()=>{const t=[e.iconFirstPage||o.iconSet.table.firstPage,e.iconPrevPage||o.iconSet.table.prevPage,e.iconNextPage||o.iconSet.table.nextPage,e.iconLastPage||o.iconSet.table.lastPage];return o.lang.rtl===!0?t.reverse():t});function vt(){if(e.hideBottom===!0)return;if(tt.value===!0){if(e.hideNoData===!0)return;const m=e.loading===!0?e.loadingLabel||o.lang.table.loading:e.filter?e.noResultsLabel||o.lang.table.noResults:e.noDataLabel||o.lang.table.noData,S=l["no-data"],h=S!==void 0?[S({message:m,icon:o.iconSet.table.warning,filter:e.filter})]:[r(Ae,{class:"q-table__bottom-nodata-icon",name:o.iconSet.table.warning}),m];return r("div",{class:le+" q-table__bottom--nodata"},h)}const t=l.bottom;if(t!==void 0)return r("div",{class:le},[t(I.value)]);const s=e.hideSelectedBanner!==!0&&H.value===!0&&ne.value>0?[r("div",{class:"q-table__control"},[r("div",[(e.selectedRowsLabel||o.lang.table.selectedRecords)(ne.value)])])]:[];if(e.hidePagination!==!0)return r("div",{class:le+" justify-end"},gt(s));if(s.length!==0)return r("div",{class:le},s)}function ft(t){k({page:1,rowsPerPage:t.value})}function gt(t){let s;const{rowsPerPage:m}=w.value,S=e.paginationLabel||o.lang.table.pagination,h=l.pagination,T=e.rowsPerPageOptions.length>1;if(t.push(r("div",{class:"q-table__separator col"})),T===!0&&t.push(r("div",{class:"q-table__control"},[r("span",{class:"q-table__bottom-item"},[e.rowsPerPageLabel||o.lang.table.recordsPerPage]),r(Vt,{class:"q-table__select inline q-table__bottom-item",color:e.color,modelValue:m,options:et.value,displayValue:m===0?o.lang.table.allRows:m,dark:c.value,borderless:!0,dense:!0,optionsDense:!0,optionsCover:!0,"onUpdate:modelValue":ft})])),h!==void 0)s=h(I.value);else if(s=[r("span",m!==0?{class:"q-table__bottom-item"}:{},[m?S(G.value+1,Math.min(X.value,Z.value),Z.value):S(1,_e.value,Z.value)])],m!==0&&Y.value>1){const x={color:e.color,round:!0,dense:!0,flat:!0};e.dense===!0&&(x.size="sm"),Y.value>2&&s.push(r(te,{key:"pgFirst",...x,icon:J.value[0],disable:ie.value,ariaLabel:o.lang.pagination.first,onClick:ue})),s.push(r(te,{key:"pgPrev",...x,icon:J.value[1],disable:ie.value,ariaLabel:o.lang.pagination.prev,onClick:ce}),r(te,{key:"pgNext",...x,icon:J.value[2],disable:se.value,ariaLabel:o.lang.pagination.next,onClick:de})),Y.value>2&&s.push(r(te,{key:"pgLast",...x,icon:J.value[3],disable:se.value,ariaLabel:o.lang.pagination.last,onClick:ve}))}return t.push(r("div",{class:"q-table__control"},s)),t}function bt(){const t=e.gridHeader===!0?[r("table",{class:"q-table"},[Be()])]:e.loading===!0&&l.loading===void 0?Re():void 0;return r("div",{class:"q-table__middle"},t)}function mt(){const t=l.item!==void 0?l.item:s=>{const m=s.cols.map(h=>r("div",{class:"q-table__grid-item-row"},[r("div",{class:"q-table__grid-item-title"},[h.label]),r("div",{class:"q-table__grid-item-value"},[h.value])]));if(H.value===!0){const h=l["body-selection"],T=h!==void 0?h(s):[r(be,{modelValue:s.selected,color:e.color,dark:c.value,dense:e.dense,"onUpdate:modelValue":(x,$)=>{K([s.key],[s.row],x,$)}})];m.unshift(r("div",{class:"q-table__grid-item-row"},T),r(Rt,{dark:c.value}))}const S={class:["q-table__grid-item-card"+P.value,e.cardClass],style:e.cardStyle};if(e.cardStyleFn!==void 0&&(S.style=[S.style,e.cardStyleFn(s.row)]),e.cardClassFn!==void 0){const h=e.cardClassFn(s.row);h&&(S.class[0]+=` ${h}`)}return(e.onRowClick!==void 0||e.onRowDblclick!==void 0||e.onRowContextmenu!==void 0)&&(S.class[0]+=" cursor-pointer",e.onRowClick!==void 0&&(S.onClick=h=>{n("RowClick",h,s.row,s.pageIndex)}),e.onRowDblclick!==void 0&&(S.onDblclick=h=>{n("RowDblclick",h,s.row,s.pageIndex)}),e.onRowContextmenu!==void 0&&(S.onContextmenu=h=>{n("rowContextmenu",h,s.row,s.pageIndex)})),r("div",{class:"q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3"+(s.selected===!0?" q-table__grid-item--selected":"")},[r("div",S,m)])};return r("div",{class:["q-table__grid-content row",e.cardContainerClass],style:e.cardContainerStyle},E.value.map((s,m)=>t(Fe({key:d.value(s),row:s,pageIndex:m}))))}return Object.assign(f.proxy,{requestServerInteraction:O,setPagination:k,firstPage:ue,prevPage:ce,nextPage:de,lastPage:ve,isRowSelected:oe,clearSelection:Xe,isRowExpanded:R,setExpanded:D,sort:re,resetVirtualScroll:at,scrollTo:ot,getCellValue:z}),kt(f.proxy,{filteredSortedRows:()=>ae.value,computedRows:()=>E.value,computedRowsNumber:()=>Z.value}),()=>{const t=[ct()],s={ref:y,class:q.value};return e.grid===!0?t.push(bt()):Object.assign(s,{class:[s.class,e.cardClass],style:e.cardStyle}),t.push(nt(),vt()),e.loading===!0&&l.loading!==void 0&&t.push(l.loading()),r("div",s,t)}}});function bl(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}const ml=M({name:"QForm",props:{autofocus:Boolean,noErrorFocus:Boolean,noResetFocus:Boolean,greedy:Boolean,onSubmit:Function},emits:["reset","validationSuccess","validationError"],setup(e,{slots:l,emit:n}){const f=Q(),o=N(null);let c=0;const i=[];function u(g){const q=typeof g=="boolean"?g:e.noErrorFocus!==!0,_=++c,w=(k,C)=>{n(`validation${k===!0?"Success":"Error"}`,C)},B=k=>{const C=k.validate();return typeof C.then=="function"?C.then(R=>({valid:R,comp:k}),R=>({valid:!1,comp:k,err:R})):Promise.resolve({valid:C,comp:k})};return(e.greedy===!0?Promise.all(i.map(B)).then(k=>k.filter(C=>C.valid!==!0)):i.reduce((k,C)=>k.then(()=>B(C).then(R=>{if(R.valid===!1)return Promise.reject(R)})),Promise.resolve()).catch(k=>[k])).then(k=>{if(k===void 0||k.length===0)return _===c&&w(!0),!0;if(_===c){const{comp:C,err:R}=k[0];if(R!==void 0&&console.error(R),w(!1,C),q===!0){const D=k.find(({comp:W})=>typeof W.focus=="function"&&xt(W.$)===!1);D!==void 0&&D.comp.focus()}}return!1})}function d(){c++,i.forEach(g=>{typeof g.resetValidation=="function"&&g.resetValidation()})}function y(g){g!==void 0&&Ee(g);const q=c+1;u().then(_=>{q===c&&_===!0&&(e.onSubmit!==void 0?n("submit",g):g?.target!==void 0&&typeof g.target.submit=="function"&&g.target.submit())})}function a(g){g!==void 0&&Ee(g),n("reset"),we(()=>{d(),e.autofocus===!0&&e.noResetFocus!==!0&&b()})}function b(){Ft(()=>{if(o.value===null)return;(o.value.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]")||o.value.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]")||o.value.querySelector("[autofocus], [data-autofocus]")||Array.prototype.find.call(o.value.querySelectorAll("[tabindex]"),q=>q.tabIndex!==-1))?.focus({preventScroll:!0})})}Tt(Bt,{bindComponent(g){i.push(g)},unbindComponent(g){const q=i.indexOf(g);q!==-1&&i.splice(q,1)}});let P=!1;return He(()=>{P=!0}),Qe(()=>{P===!0&&e.autofocus===!0&&b()}),he(()=>{e.autofocus===!0&&b()}),Object.assign(f.proxy,{validate:u,resetValidation:d,submit:y,reset:a,focus:b,getValidationComponents:()=>i}),()=>r("form",{class:"q-form",ref:o,onSubmit:y,onReset:a},A(l.default))}});export{ml as Q,gl as a,fl as b,vl as c,Et as d,bl as g};
