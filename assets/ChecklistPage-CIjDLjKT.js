import{$ as e,F as t,H as n,I as r,L as i,M as a,O as o,P as s,Q as c,S as l,T as u,U as d,_ as f,b as p,bt as m,c as h,d as g,et as _,f as v,g as y,h as b,it as x,j as S,l as C,m as ee,r as w,tt as T,u as E,vt as D,yt as te}from"./runtime-core.esm-bundler-LTmVpDsT.js";import{G as O,T as ne,W as k,et as re,h as A,i as j,l as M,t as N}from"./QBtn-Ba-7MrJ5.js";import{b as P,h as F,m as I,t as ie,x as L}from"./QSelect-CesoD7-4.js";import{$ as ae,S as R,_ as oe,b as z,et as B,g as V,lt as se,t as ce,tt as H,v as U,x as le,y as ue}from"./index-C940KtbS.js";import{t as W}from"./QList-D5UXUx8G.js";import{t as de}from"./QPage-ixVaR-ZS.js";import{i as fe,r as pe,t as G}from"./airplanesRepository-BzT736Lu.js";import{r as K,s as me}from"./time-DenAXbZp.js";import{t as he}from"./_plugin-vue_export-helper-BDNMzG2s.js";var ge=O({name:`QSpace`,setup(){let e=p(`div`,{class:`q-space`});return()=>e}}),_e=()=>{},ve=`cubic-bezier(.25, .8, .50, 1)`,q=`calc-size(auto, size)`,ye=[{height:`0px`},{height:q}],be=[{height:q},{height:`0px`}],xe=typeof CSS<`u`&&CSS.supports(`height`,q)?Se:Ce;function Se(e,t=_e){let n=null,r,i,a=null;function s(){a!==null&&(clearTimeout(a),a=null),n?.cancel(),n=null}function c(){s(),r?.(),r=null}function l(e,n){e.style.overflowY=null,c(),n!==i&&t(n)}function u(t,o,s,c){let u=e(),d=n!==null&&n.effect.target===t;if(n===null?i=s===`show`?`hide`:`show`:(d||r?.(),clearTimeout(a)),r=o,u<=0){l(t,s);return}d?n.reverse():(n?.cancel(),t.style.overflowY=`hidden`,n=t.animate(c,{duration:u,easing:ve,fill:`forwards`})),n.onfinish=()=>{l(t,s)},a=setTimeout(n.onfinish,u*1.1)}function d(e,t){u(e,t,`show`,ye)}function f(e,t){u(e,t,`hide`,be)}return o(()=>{n!==null&&c()}),{onEnter:d,onLeave:f}}function Ce(e,t=_e){let n=!1,r,i,a=null,s,c;function l(){n=!1,a!==null&&(clearTimeout(a),a=null),i?.removeEventListener(`transitionend`,s),s=null}function u(){l(),r?.(),r=null}function d(e){i!==e&&r?.(),r=null,l()}function f(t,i,a){return i!==void 0&&(t.style.height=`${i}px`),t.style.transition=`height ${e()}ms ${ve}`,n=!0,r=a,t.scrollHeight}function p(e,n){e.style.overflowY=null,e.style.height=null,e.style.transition=null,u(),n!==c&&t(n)}function m(t,o){let l=0,u=n,m=e();if(u?d(t):c=`hide`,i=t,m<=0){r=o,p(t,`show`);return}u?l=t.offsetHeight===t.scrollHeight?0:void 0:t.style.overflowY=`hidden`;let h=f(t,l,o);t.style.height=`${h}px`,s=e=>{(Object(e)!==e||e.target===t)&&p(t,`show`)},t.addEventListener(`transitionend`,s),a=setTimeout(s,m*1.1)}function h(t,o){let l,u=n,m=e();if(u?d(t):c=`show`,i=t,m<=0){r=o,p(t,`hide`);return}u===!1&&(t.style.overflowY=`hidden`,l=t.scrollHeight),f(t,l,o),t.style.height=0,s=e=>{(Object(e)!==e||e.target===t)&&p(t,`hide`)},t.addEventListener(`transitionend`,s),a=setTimeout(s,m*1.1)}return o(()=>{n&&u()}),{onEnter:m,onLeave:h}}var J=_({});function we(e){e.keyCode===32&&k(e)}var Te=Object.keys(j),Ee=O({name:`QExpansionItem`,props:{...j,...H,...R,icon:String,label:String,labelLines:[Number,String],caption:String,captionLines:[Number,String],dense:Boolean,toggleAriaLabel:String,expandIcon:String,expandedIcon:String,expandIconClass:[Array,String,Object],duration:{type:Number,default:300},headerInsetLevel:Number,contentInsetLevel:Number,expandSeparator:Boolean,defaultOpened:Boolean,hideExpandIcon:Boolean,expandIconToggle:Boolean,switchToggleSide:Boolean,denseToggle:Boolean,group:String,popup:Boolean,headerStyle:[Array,String,Object],headerClass:[Array,String,Object]},emits:[...B,`click`,`afterShow`,`afterHide`],setup(t,{slots:r,emit:i}){let a=ne(),s=le(t,a),c=e(t.modelValue===null?t.defaultOpened:t.modelValue),l=T(null),d=T(null),f=V(),{show:m,hide:g,toggle:_}=ae({showing:c}),v=e(!c.value),{onEnter:y,onLeave:b}=xe(()=>t.duration,R),x,S,C=h(()=>`q-expansion-item q-item-type q-expansion-item--${c.value?`expanded`:`collapsed`} q-expansion-item--${t.popup?`popup`:`standard`}`),ee=h(()=>{let e=v.value?{display:`none`}:{};if(t.contentInsetLevel!==void 0){let n=a.lang.rtl?`Right`:`Left`;e[`padding`+n]=t.contentInsetLevel*56+`px`}return e}),w=h(()=>!t.disable&&(t.href!==void 0||t.to!==void 0&&t.to!==null&&t.to!==``)),E=h(()=>{let e={};return Te.forEach(n=>{e[n]=t[n]}),e}),D=h(()=>w.value||!t.expandIconToggle),te=h(()=>t.expandedIcon!==void 0&&c.value?t.expandedIcon:t.expandIcon||a.iconSet.expansionItem[t.denseToggle?`denseIcon`:`icon`]),O=h(()=>!t.disable&&(w.value||t.expandIconToggle)),re=h(()=>({expanded:c.value,detailsId:f.value,toggle:_,show:m,hide:g})),j=h(()=>{let e=t.toggleAriaLabel===void 0?a.lang.label[c.value?`collapse`:`expand`](t.label):t.toggleAriaLabel;return{role:`button`,"aria-expanded":c.value?`true`:`false`,"aria-controls":f.value,"aria-label":e}});n(()=>t.group,e=>{S?.(),e!==void 0&&se()});function N(e){w.value||_(e),i(`click`,e)}function ie(e){[13,32].includes(e.keyCode)&&L(e,!0)}function L(e,t){!t&&!e.qAvoidFocus&&l.value?.focus({preventScroll:!0}),_(e),k(e)}function R(e){i(e===`show`?`afterShow`:`afterHide`)}function z(){v.value=!0}function B(){d.value!==null&&y(d.value)}n(c,e=>{e?v.value?(v.value=!1,u(B)):B():d.value===null?(z(),R(`hide`)):b(d.value,z)});function se(){x===void 0&&(x=oe()),c.value&&(J[t.group]=x);let e=n(c,e=>{e?J[t.group]=x:J[t.group]===x&&delete J[t.group]}),r=n(()=>J[t.group],(e,t)=>{t===x&&e!==void 0&&e!==x&&g()});S=()=>{e(),r(),J[t.group]===x&&delete J[t.group],S=void 0}}function ce(){let e={class:[`q-expansion-item__toggle-section${t.switchToggleSide?` q-expansion-item__toggle-section--switched`:``} q-focusable relative-position cursor-pointer${t.denseToggle&&t.switchToggleSide?` items-end`:``}`,t.expandIconClass],side:!0},n=[p(M,{class:`q-expansion-item__toggle-icon`+(t.expandedIcon===void 0&&c.value?` q-expansion-item__toggle-icon--rotated`:``),name:te.value})];return O.value&&(Object.assign(e,{tabindex:0,...j.value,onClick:L,onKeydown:we,onKeyup:ie}),n.unshift(p(`div`,{ref:l,class:`q-expansion-item__toggle-focus q-icon q-focus-helper q-focus-helper--rounded`,tabindex:-1}))),p(F,e,()=>n)}function H(){let e;return r.header===void 0?(e=[p(F,()=>[p(P,{lines:t.labelLines},()=>t.label||``),t.caption?p(P,{lines:t.captionLines,caption:!0},()=>t.caption):null])],t.icon&&e[t.switchToggleSide?`push`:`unshift`](p(F,{class:`q-expansion-item__icon-section`,avatar:!0},()=>p(M,{name:t.icon})))):e=[r.header(re.value)].flat(),!t.disable&&!t.hideExpandIcon&&e[t.switchToggleSide?`unshift`:`push`](ce()),e}function ue(){let e={ref:`item`,style:t.headerStyle,class:t.headerClass,dark:s(),disable:t.disable,dense:t.dense,insetLevel:t.headerInsetLevel};return D.value&&(e.clickable=!0,e.onClick=N,Object.assign(e,w.value?E.value:j.value)),p(I,e,H)}function W(){let e=[ue(),p(`div`,{ref:d,class:`q-expansion-item__content relative-position`,style:ee.value,id:f.value},A(r.default))];return t.expandSeparator&&e.push(p(U,{class:`q-expansion-item__border q-expansion-item__border--top absolute-top`,dark:s()}),p(U,{class:`q-expansion-item__border q-expansion-item__border--bottom absolute-bottom`,dark:s()})),e}return t.group!==void 0&&se(),o(()=>{S?.()}),()=>p(`div`,{class:C.value},[p(`div`,{class:`q-expansion-item__container relative-position`},W())])}}),De=Object.assign({"/src/fixed-data/checklists/general/general.xml":`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Copyright (c) 2026 Thomas Calmant
  All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  Generic fallback checklist, used only when a plane has no matching
  model-tier or plane-tier checklist file. There is no real content to fall
  back to yet, so this just warns the user instead of showing sample data.
-->
<checklist id="general">
  <section id="no-checklist" title="Avertissement">
    <info id="no-checklist.warning">Aucune check-list n'est définie pour cet avion ou son modèle.</info>
  </section>
</checklist>
`,"/src/fixed-data/checklists/model/DR400 135 CDI.xml":`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Copyright (c) 2026 Thomas Calmant
  All rights reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  Transcribed from the Aéroclub du Dauphiné's real checklists for the Robin
  DR400-140B "135 CDI" (Ecoflyer), tails F-HAGR / F-HBFO / F-HCEN:
    - data/Checklists/CL_ROBIN+DR+135+Ecoflyer_procédures+NORMALES_V20201205_CRR_V2.1.pdf
    - data/Checklists/CL_ROBIN+DR+135+Ecoflyer_procédures+URGENCE_V20201205_CRR_V2.0.pdf
  Locale-neutral on purpose: these are French club documents with no English
  source, so there is nothing genuine to transcribe as "en-US" content; the
  ChecklistXmlSource locale-neutral fallback serves this file to any locale.
-->
<checklist id="model">
  <section id="disclaimer" title="Avertissement">
    <info id="disclaimer.text">Ces données ne sont fournies qu'à titre indicatif. Elles ne sauraient en aucun cas engager une quelconque responsabilité de l'Aéroclub du Dauphiné ou du concepteur de ce document et ne dispensent pas le commandant de bord de vérifier le manuel de vol avant toute utilisation de l'appareil.</info>
  </section>

  <!-- ===================== PROCEDURES NORMALES ===================== -->

  <section id="preflight" title="Visite prévol" dolist="true">
    <info id="preflight.first_flight">Premier vol de la journée : purges réservoir effectuées ; vérifier l'absence d'eau ou de déchet ; vérifier le type de carburant, diesel ou Jet, et dans quelle proportion.</info>

    <row id="preflight.parkbrake">Frein de Parc — Serré</row>
    <row id="preflight.docs">Documents Avion &amp; Pilote — À bord</row>
    <row id="preflight.lights">Phares — ON</row>
    <row id="preflight.flash">Flash — ON</row>
    <row id="preflight.navlights">Feu de Nav — ON</row>
    <row id="preflight.elecpump">Pompe Carburant Elec. — ON</row>
    <row id="preflight.battery">Batterie — ON</row>
    <info id="preflight.battery_warning" note="ATTENTION">Avec la batterie sur ON, considérez le contact moteur en marche donc NE BRASSEZ PAS L'HELICE.</info>

    <row id="preflight.allights_check">Tous Feux + Pompe Carburant Elec — Vérifiés</row>
    <row id="preflight.stallwarning">Avertisseur de décrochage — Vérifié</row>
    <row id="preflight.flaps_out">Volets sortis — 2ème cran</row>
    <row id="preflight.fuelgauge">Jauge carburant — Niveau cohérent avec Carnet de Bord</row>
    <row id="preflight.battery_off">Batterie — OFF</row>
    <row id="preflight.lights_off">Tous feux (sauf Anticollision &amp; Pompe Carbu) — OFF</row>

    <info id="preflight.leftwing_header">Aile gauche — vérifier l'état général des revêtements extrados/intrados</info>
    <row id="preflight.leftwing.flap">Aile gauche — Volet : jeu, axes freinés</row>
    <row id="preflight.leftwing.aileron">Aile gauche — Aileron : débattement, jeu</row>
    <row id="preflight.leftwing.fixations">Aile gauche — Fixations axes, guignols de commande : freinées</row>
    <row id="preflight.leftwing.navlight">Aile gauche — Saumon et feu de nav : absence de chocs</row>
    <row id="preflight.leftwing.leadingedge">Aile gauche — Bord d'attaque : état, absence traces de chocs</row>
    <row id="preflight.leftwing.pitot">Aile gauche — Tube Pitot : cache enlevé, absence corps étranger</row>
    <row id="preflight.leftwing.tire">Aile gauche — Pneu : état d'usure et de gonflage</row>
    <row id="preflight.leftwing.shock">Aile gauche — Amortisseur : mobilité</row>
    <row id="preflight.leftwing.fairing">Aile gauche — Carénage : fixation, propreté</row>
    <row id="preflight.leftwing.brake">Aile gauche — Frein : absence de fuite hydraulique</row>
    <row id="preflight.leftwing.karman">Aile gauche — Karman : toutes les vis présentes</row>

    <info id="preflight.rightwing_header">Aile droite — idem aile gauche, sauf Tube Pitot + palette avertisseur de décrochage</info>

    <row id="preflight.fuselagetop.anticollision">Dessus fuselage / flanc droit — Feu Anticollision et Antennes VHF : état, fixation</row>
    <row id="preflight.fuselagetop.staticport">Dessus fuselage / flanc droit — Prise statique : cache enlevé, dégagée</row>
    <row id="preflight.fuselagetop.skin">Dessus fuselage / flanc droit — Revêtement : état, absence traces de chocs</row>

    <row id="preflight.empennage.rudder">Empennage — Gouverne de direction : débattement, jeu</row>
    <row id="preflight.empennage.cables">Empennage — Axes, câbles-bielles-guignols : freinés</row>
    <row id="preflight.empennage.skin">Empennage — Revêtement : état, absence traces de chocs</row>
    <row id="preflight.empennage.sabot">Empennage — Sabot : usure</row>
    <row id="preflight.empennage.stabilizer">Empennage — Stabilisateur monobloc : débattement, jeu, fixation</row>
    <row id="preflight.empennage.skin2">Empennage — Revêtement : état, absence traces de chocs</row>
    <row id="preflight.empennage.fixations">Empennage — Fixations axes-bielle de commande : freinées</row>

    <info id="preflight.leftfuselage_header">Fuselage / flanc gauche — idem flanc droit</info>
    <row id="preflight.leftfuselage.staticport">Fuselage / flanc gauche — Prise statique : cache enlevé, dégagée</row>
    <row id="preflight.leftfuselage.skin">Fuselage dessous — Revêtement : état, absence traces de chocs</row>

    <row id="preflight.nosegear.towbar">Train avant — Barre de tractage : enlevée</row>
    <row id="preflight.nosegear.tire">Train avant — Pneu : état d'usure et de gonflage</row>
    <row id="preflight.nosegear.shock">Train avant — Amortisseur : mobilité</row>
    <row id="preflight.nosegear.fairing">Train avant — Carénage : fixation &amp; propreté</row>

    <row id="preflight.engine.cowling">Moteur et pare-brise — Capotage : fixations en place</row>
    <row id="preflight.engine.propeller">Moteur et pare-brise — Hélice : jeu et fixation</row>
    <row id="preflight.engine.spinner">Moteur et pare-brise — Cône &amp; bord d'attaque hélice : ni impacts ni criques</row>
    <row id="preflight.engine.belt">Moteur et pare-brise — Courroie alternateur : tension</row>
    <row id="preflight.engine.airintakes">Moteur et pare-brise — Entrées d'air : propreté, absence corps étranger</row>
    <row id="preflight.engine.cowlinterior">Moteur et pare-brise — Intérieur capot : absence fuites huile et essence</row>
    <row id="preflight.engine.oillevel" note="Vérifié (4-6 quarts de gallons)">Moteur et pare-brise — Niveau d'huile</row>
    <row id="preflight.engine.oilcap">Moteur et pare-brise — Bouchon d'huile et trappe : fermés</row>
    <row id="preflight.engine.windshield">Moteur et pare-brise — Pare-brise : propreté, absence de criques</row>
    <row id="preflight.engine.exhaust">Moteur et pare-brise — Tuyaux échappement : rigidité de fixation</row>
  </section>

  <section id="actions-before-start" title="Actions avant mise en route" collapsed="true" dolist="true">
    <row id="beforestart.docs">Documents Pilote &amp; Avion — À bord</row>
    <row id="beforestart.seats">Sièges — Réglés, verrouillés</row>
    <row id="beforestart.canopy">Verrière — À convenance</row>
    <row id="beforestart.distress">Interrupteur balise de détresse — ARMED</row>
    <row id="beforestart.switches">Tous interrupteurs — OFF</row>
    <row id="beforestart.breakers">Tous disjoncteurs — Enclenchés</row>
    <row id="beforestart.vents">Ventilations — Toutes fermées / coupées</row>
    <row id="beforestart.altimeter">Altimètre — Calé QNH</row>
    <row id="beforestart.fuelvalve" note="Fonctionnement vérifié puis Ouvert">Robinet Carburant</row>
    <row id="beforestart.parkbrake">Frein de parc — Serré</row>
    <row id="beforestart.towbar">Barre de tractage — Rentrée</row>
    <row id="beforestart.battery">Batterie — ON</row>
    <row id="beforestart.cedselftest" note="Vérifié">Autotest des voyants du CED</row>
    <row id="beforestart.anticollision">Anticollision / Strobe light — ON</row>
    <row id="beforestart.alarms" note="Testé / mode jour">Bandeau d'alarmes</row>
    <row id="beforestart.fuelgauge" note="Notée / Cohérente avec autonomie">Jauge carburant (Fuel)</row>
    <row id="beforestart.fueltemp" note="Vérifiée">Température carburant (Fuel)</row>
    <row id="beforestart.fadeclights">Voyants FADEC — Éteints</row>
  </section>

  <section id="checklist-before-start" title="Check-list avant mise en route">
    <info id="cbstart.note">Que des vérifications, sauf oubli.</info>
    <row id="cbstart.preflight">Visite Prévol — Effectuée</row>
    <row id="cbstart.parkbrake">Frein de parc — Serré</row>
    <row id="cbstart.towbar">Barre de tractage — Retirée</row>
    <row id="cbstart.fuelvalve">Robinet carburant — Ouvert</row>
    <row id="cbstart.battery">Batterie — ON</row>
    <row id="cbstart.avionics">Général Avionique — OFF</row>
    <row id="cbstart.anticollision">Anticollision / Strobe light — ON</row>
    <row id="cbstart.fueltemp" note="Supérieure à 5°C pour du diesel sans additif et 35°C pour du Jet">Température carburant (Fuel) — Vérifiée</row>
    <info id="cbstart.phones">Téléphones en mode avion (par précaution).</info>
  </section>

  <section id="actions-start" title="Actions mise en route" collapsed="true" dolist="true">
    <row id="start.secondaryair">Admission Air de secours — Fermée (Poussée)</row>
    <row id="start.throttle" note="ne plus déplacer">Manette de puissance — Plein Réduit</row>
    <row id="start.elecpump">Pompe électrique — ON</row>
    <row id="start.surroundings">Abords — Dégagés</row>
    <row id="start.ignition">Contact moteur — ON</row>
    <row id="start.fadeclights">Voyants FADEC — Vérifiés ÉTEINTS</row>
    <row id="start.preheat">Voyant Préchauffage — Attendre extinction</row>
    <row id="start.starter" note="10 sec max">Démarreur — Actionné</row>
    <info id="start.throttle_note">Laisser la manette de puissance sur Plein Réduit.</info>
    <row id="start.rpm">Régime moteur — Vérifié</row>
    <row id="start.oilpressure" note="1 bar Mini">Pression d'huile</row>
    <info id="start.oilpressure_warning">Si la pression d'huile "OP" n'est pas établie dans les 3 sec, couper le moteur.</info>
  </section>

  <section id="checklist-after-start" title="Check-list après mise en route">
    <row id="castart.oilpressure" note="1 bar Mini">Pression d'huile</row>
    <row id="castart.alarms" note="Vérifié éteint">Bandeau d'alarmes</row>
    <row id="castart.elecpump">Pompe électrique — OFF</row>
    <row id="castart.fadecbackup" note="Effectué">Test batterie secours FADEC</row>
    <row id="castart.flaps">Volets — Rentrés</row>
    <row id="castart.briefing" note="Effectués">Briefing Passagers/roulage/message</row>
    <row id="castart.blocktime" note="Notée">Heure de Block</row>
    <row id="castart.cedlights" note="Vérifiés, Roulage en fonction">Voyants CED</row>
  </section>

  <section id="actions-after-start" title="Actions après mise en route" collapsed="true" dolist="true">
    <info id="astart.title">Test de la batterie secours FADEC.</info>
    <row id="astart.alternator_off">Alternateur — OFF / fonctionnement moteur normal</row>
    <row id="astart.battery_off">Batterie — OFF 10 sec / fonctionnement moteur normal</row>
    <row id="astart.fadeclights">Voyants FADEC — Éteints</row>
    <row id="astart.battery_on">Batterie — ON</row>
    <row id="astart.alternator_on">Alternateur — ON</row>
    <row id="astart.enginealarm" note="Appuyer sur bouton test/acq">Voyant alerte moteur — Acquitté</row>
    <row id="astart.batteryvoltage" note="Arc vert / Voyant éteint">Tension batterie / alternateur</row>
    <row id="astart.avionics_on">Général Avionique — ON</row>
    <row id="astart.radio">Radio COM/NAV — Réglées</row>
    <row id="astart.transponder">Transpondeur — 7000</row>
    <row id="astart.instruments">Alti / Horizon / Conservateur de cap — Réglés</row>
    <row id="astart.trim" note="Fonctionnement vérifié">Compensateur</row>
    <row id="astart.flaps" note="Rentrés, fonctionnement vérifié">Volets</row>
    <row id="astart.warmup" note="2 min puissance réduite 890 RPM puis 1400 tours">Temps de chauffe</row>
    <row id="astart.briefing" note="Effectués">Briefing passagers/Roulage</row>
  </section>

  <section id="actions-taxi" title="Actions roulage" collapsed="true" dolist="true">
    <info id="taxi.rpm_warning">NE PAS DEPASSER 1400 RPM. Si un ou plusieurs des voyants du CED sont oranges, s'attendre à une panne moteur.</info>
    <row id="taxi.parkbrake">Frein de parc — Relâché</row>
    <row id="taxi.brakes" note="Efficaces et symétriques">Freins</row>
    <row id="taxi.speed">Roulage — AU PAS</row>
    <row id="taxi.turnindicator" note="Vérifiés">Indicateur de virage et bille</row>
    <row id="taxi.compass" note="Vérifiés">Compas et conservateur de cap</row>
    <row id="taxi.horizon">Horizon — Stable</row>
  </section>

  <section id="actions-fadec-test" title="Actions essais moteur et FADEC" collapsed="true" dolist="true">
    <info id="fadectest.warning">ATTENTION : lire attentivement et se conformer au manuel de vol pour la procédure essais FADEC. La moindre différence avec la procédure détaillée fait que LE DECOLLAGE EST INTERDIT.</info>
    <row id="fadectest.parkbrake">Frein de parc — Serré</row>
    <row id="fadectest.throttle">Manette de puissance — Plein réduit</row>
    <row id="fadectest.cedlights" note="Tous verts">Voyants CED</row>
    <row id="fadectest.button" note="Appuyé et maintenu">Bouton Test FADEC</row>
    <info id="fadectest.sequence">Voyants FADEC A &amp; B allumés et augmentation RPM ; puis voyant B seul puis A seul et variation RPM ; puis voyants FADEC A &amp; B éteints.</info>
    <row id="fadectest.release" note="Relâché dès que le ralenti stable à ~1000 RPM">Bouton Test FADEC</row>
  </section>

  <section id="checklist-before-takeoff" title="Check-list avant décollage">
    <row id="cbto.fadectest" note="Effectués">Essais FADEC et moteur</row>
    <row id="cbto.controls" note="Libres et dans le bon sens">Commandes de vol</row>
    <row id="cbto.canopy" note="Fermée, verrouillée, éjecteurs en place">Verrière</row>
    <row id="cbto.seatbelts" note="Attachées">Ceinture pilote &amp; passagers</row>
    <row id="cbto.instruments" note="Vérifiés">Instrument "4 infos" et CED</row>
    <row id="cbto.fueltemp" note="Vérifiée, supérieure à 0°C pour du Diesel sans additif et à -30°C pour du Jet">Température carburant (Fuel)</row>
    <row id="cbto.elecpump">Pompe électrique — ON</row>
    <row id="cbto.flaps">Volets — Position décollage</row>
    <row id="cbto.fuelvalve">Robinet Carburant — Ouvert</row>
    <row id="cbto.trim">Compensateur — Position Décollage</row>
  </section>

  <section id="actions-before-takeoff" title="Actions avant décollage" collapsed="true" dolist="true">
    <row id="bto.briefing" note="Effectué">Briefing décollage et menace du jour</row>
    <row id="bto.elecpump">Pompe électrique — ON</row>
    <row id="bto.flaps">Volets — Position Décollage</row>
    <row id="bto.transponder">Transpondeur — ALT</row>
    <row id="bto.alarms" note="Vérifié éteint">Bandeau d'alarmes</row>
    <row id="bto.trim">Compensateur — Position décollage</row>
  </section>

  <section id="actions-takeoff" title="Actions décollage" collapsed="true" dolist="true">
    <info id="to.memento" note="Mémento décollage">Vitesse de rotation décollage court = 100 km/h. Vitesse de montée pente max (volets décollage) = 130 km/h. Vitesse de montée taux max (volets rentrés) = 145 km/h. Vent travers maximal démontré au décollage = 22 kt.</info>
    <row id="to.throttle" note="Puissance mini 94% et RPM entre 2240 et 2300 ; RPM mini 2300 tr/mn avant rotation">Manette de puissance — À fond en avant</row>
    <row id="to.alarms" note="Pas d'alarme">Bandeau d'alarmes</row>
    <row id="to.airspeed" note="En augmentation">Anémomètre / badin</row>
    <row id="to.rotationspeed">Vitesse de rotation — Supérieure à 100 km/h</row>
    <row id="to.climbspeed">Vitesse de montée — 130 km/h</row>
    <row id="to.flaps" note="À hauteur de sécurité, 300ft sol et Vi">Volets — Rentrés</row>
    <row id="to.elecpump" note="Hauteur minimum 500 ft sol">Pompe électrique — OFF</row>
    <row id="to.climbspeed2">Vitesse de montée (volets rentrés) — 150 km/h</row>
  </section>

  <section id="checklist-after-takeoff" title="Check-list après décollage">
    <row id="cato.throttle">Manette de puissance — À fond en avant</row>
    <row id="cato.flaps">Volets — Rentrés</row>
    <row id="cato.elecpump">Pompe électrique — OFF</row>
    <row id="cato.climbspeed" note="150 km/h">Vitesse de montée recommandée</row>
    <row id="cato.systems" note="Vérifiés">Paramètres et systèmes</row>
  </section>

  <section id="actions-climb-cruise" title="Actions croisière" collapsed="true" dolist="true">
    <info id="cruise.power" note="Puissance 'maximale recommandée' 85% / 'recommandée' 75%">Puissance affichée</info>
    <row id="cruise.trim">Compensateur — Réglé</row>
    <row id="cruise.instruments" note="Surveillance constante">Instrument "4 infos" et CED</row>
    <row id="cruise.alarms" note="Surveillance constante">Bandeau d'alarmes</row>
  </section>

  <section id="actions-descent" title="Actions descente" collapsed="true" dolist="true">
    <row id="descent.power">Puissance — Adaptée</row>
    <row id="descent.cabinheat" note="À convenance pour réchauffer le liquide de refroidissement">Réchauff cabine</row>
    <row id="descent.altimeter">Calage altimétrique — Réglé</row>
    <row id="descent.instruments" note="Vérifiés">Instrument "4 infos" et CED</row>
    <row id="descent.alarms" note="Pas d'alarme">Bandeau d'alarmes</row>
    <row id="descent.lights">Feux — À convenance</row>
  </section>

  <section id="actions-approach" title="Actions approche / vent arrière" collapsed="true" dolist="true">
    <row id="approach.elecpump">Pompe électrique — ON</row>
    <row id="approach.flaps" note="En dessous de 170 km/h">Volets — Position décollage</row>
    <row id="approach.speed" note="~40%">Vitesse — 150 km/h</row>
    <row id="approach.cabin" note="Prête pour l'atterrissage">Cabine</row>
    <row id="approach.briefing" note="Effectué">Briefing atterrissage</row>
  </section>

  <section id="actions-final" title="Actions finale" collapsed="true" dolist="true">
    <row id="final.flaps" note="En dessous de 170 km/h">Volets — Position atterrissage</row>
    <row id="final.speed" note="120 km/h + kVe">Vitesse d'approche normale</row>
    <row id="final.speedshort" note="117 km/h + kVe">Vitesse d'approche atterrissage court</row>
    <row id="final.speedpossible" note="130 km/h cf manuel">Vitesse d'approche possible</row>
  </section>

  <section id="checklist-before-landing" title="Check-list avant atterrissage">
    <row id="cbl.flaps" note="Position atterrissage si Vi &lt; 150 km/h">Volets 2ème cran</row>
    <row id="cbl.elecpump">Pompe électrique — ON</row>
    <row id="cbl.lights">FEUX — Allumés</row>
    <row id="cbl.radio" note="Effectué">Message radio</row>
  </section>

  <section id="actions-go-around" title="Actions remise de gaz" collapsed="true" dolist="true">
    <row id="goaround.attitude">Assiette puis puissance — À fond</row>
    <row id="goaround.speed">Vitesse — 120 Km/h</row>
    <row id="goaround.flaps">Volets — Position décollage</row>
    <info id="goaround.next">Reprendre les actions après décollage.</info>
  </section>

  <section id="actions-after-landing" title="Actions après atterrissage" collapsed="true" dolist="true">
    <row id="afterland.elecpump">Pompe électrique — OFF</row>
    <row id="afterland.flaps">Volets — Rentrés</row>
    <row id="afterland.transponder">Transpondeur — STBY</row>
    <row id="afterland.lights">Feux — À convenance</row>
  </section>

  <section id="actions-engine-shutdown" title="Actions arrêt moteur" collapsed="true" dolist="true">
    <info id="shutdown.warning" note="IMPORTANT">Laisser refroidir 1 mn au ralenti avant de couper le moteur. Toute action sur la commande de puissance réinitialise ce temps de refroidissement.</info>
    <row id="shutdown.parkbrake">Frein de parc — Serré</row>
    <row id="shutdown.throttle">Manette de puissance — Plein réduit</row>
    <row id="shutdown.flaps">Volets — Sortis</row>
    <row id="shutdown.avionics">Général Avionique — OFF</row>
    <row id="shutdown.ignition">Contact moteur — OFF</row>
    <row id="shutdown.lights">Feux — Tous OFF</row>
    <row id="shutdown.battery">Batterie — OFF</row>
    <row id="shutdown.key">Clef — Retirée</row>
    <row id="shutdown.seatbelts">Ceintures Pilotes &amp; Passagers — Rattachées</row>
    <row id="shutdown.seats" note="Avant de descendre">Sièges — Reculés à fond</row>
    <row id="shutdown.pitotcovers">Flammes Pitot et statiques — En place</row>
    <row id="shutdown.cleaning" note="Nettoyé">Avion</row>
    <row id="shutdown.logbooks" note="Remplis">Carnet de Route et carnet de vol</row>
  </section>

  <section id="checklist-parking" title="Check-list parking">
    <row id="parking.parkbrake">Frein de parc — Serré</row>
    <row id="parking.switches">Tous interrupteurs — OFF</row>
    <row id="parking.heating" note="Fermés (Poussés)">Chauffage Cabine et ventilations</row>
    <row id="parking.key">Clef — Retirée</row>
    <info id="parking.inspection">Avion inspecté pour vérifier d'éventuels problèmes de dommages apparus au cours du vol.</info>
  </section>

  <!-- ===================== PROCEDURES D'URGENCE ===================== -->

  <section id="emergency-engine-failure" title="Panne moteur" emergency="true">
    <choice id="eng.fail.phase" prompt="À quel moment la panne moteur survient-elle ?">
      <branch id="takeoff" label="Au décollage">
        <row id="eng.fail.takeoff.throttle">Manette de puissance — Plein réduit</row>
        <info id="eng.fail.takeoff.brake">Freiner en fonction de la piste restante en maintenant la trajectoire.</info>
        <row id="eng.fail.takeoff.ignition">Contact moteur — OFF</row>
        <row id="eng.fail.takeoff.electrics">Interrupteurs Batterie &amp; Alternateur — OFF</row>
        <row id="eng.fail.takeoff.fuelvalve">Robinet carburant — Fermé</row>
        <row id="eng.fail.takeoff.evacuation" note="Si nécessaire">Évacuation d'urgence</row>
      </branch>
      <branch id="afterTakeoff" label="Immédiatement après décollage">
        <info id="eng.fail.after.pitch">Diminuer l'assiette et prendre la vitesse de finesse max — 145 km/h (volets rentrés), 139 km/h (volets 1er cran).</info>
        <row id="eng.fail.after.straight">Atterrir droit devant — NE PAS FAIRE DEMI TOUR</row>
        <row id="eng.fail.after.fadecforceb" note="Si panne totale">Commutateur FADEC A/B — Force B</row>
        <row id="eng.fail.after.electrics" note="Vérifier position ON et fonctionnement">Batterie &amp; Alternateur</row>
        <row id="eng.fail.after.ignition">Contact Moteur Alternateur — OFF</row>
        <row id="eng.fail.after.fuelvalve">Robinet Carburant — Fermé</row>
        <row id="eng.fail.after.flaps" note="Comme nécessaire — position atterrissage recommandée">Volets</row>
        <row id="eng.fail.after.electrics2">Batterie &amp; Alternateur — OFF</row>
        <row id="eng.fail.after.canopy">Verrière — Déverrouillée</row>
        <info id="eng.fail.after.speed">Atterrissage à la vitesse la plus faible possible.</info>
      </branch>
      <branch id="cruise" label="En croisière">
        <info id="eng.fail.cruise.glide">Vitesse de finesse max = 145 km/h — volets rentrés — Finesse 9.</info>
        <row id="eng.fail.cruise.landingzone">Choisir une zone d'atterrissage appropriée</row>
        <info id="eng.fail.cruise.restart">Si l'altitude le permet, pour tenter un redémarrage :</info>
        <row id="eng.fail.cruise.elecpump">Pompe électrique — ON</row>
        <row id="eng.fail.cruise.fadec" note="si pas d'amélioration retour sur AUTO">FADEC A/B — Force B</row>
        <row id="eng.fail.cruise.ignition">Contact moteur — OFF puis ON</row>
        <row id="eng.fail.cruise.electrics" note="Vérifier position ON et fonctionnement">Batterie &amp; Alternateur</row>
        <row id="eng.fail.cruise.troubleshoot" note="Recherche de panne">Bandeau d'alarmes/CED/Instrument "4 infos"</row>
        <row id="eng.fail.cruise.breakers" note="Principalement FADEC A et B">Disjoncteurs — Enclenchés</row>
        <row id="eng.fail.cruise.starter" note="Si hélice calée sauf si problème mécanique détecté">Démarreur — Actionné</row>
        <info id="eng.fail.cruise.stop">Si le problème se résout, s'arrêter dans la procédure de redémarrage.</info>
        <info id="eng.fail.cruise.apply">Sinon, appliquer la procédure d'atterrissage forcé en campagne, moteur en panne.</info>
      </branch>
    </choice>
    <info id="eng.fail.reminder">Certaines actions de ces procédures sont à entreprendre immédiatement et doivent être connues par cœur.</info>
  </section>

  <section id="emergency-forced-landing" title="Atterrissage forcé en campagne" emergency="true">
    <info id="forced.restart_header">2.1 — Redémarrage après panne moteur (uniquement si l'altitude le permet et si rien ne le contre-indique).</info>
    <row id="forced.restart.speed" note="145 km/h volets rentrés — min. 130 km/h — max. 185 km/h">Vitesse</row>
    <row id="forced.restart.altitude">Altitude — Inférieure à 13 000 ft</row>
    <row id="forced.restart.electrics" note="Vérifié position ON et fonctionnement">Batterie &amp; Alternateur</row>
    <row id="forced.restart.fuelvalve">Robinet carburant — Ouvert</row>
    <row id="forced.restart.elecpump">Pompe électrique — ON</row>
    <row id="forced.restart.throttle">Manette de puissance — Plein réduit</row>
    <row id="forced.restart.ignition" note="Démarreur actionné si hélice calée sauf si problème mécanique détecté">Contact Moteur — OFF puis ON</row>
    <row id="forced.restart.params" note="Vérifiés">Paramètres moteur</row>
    <row id="forced.restart.throttle2" note="Réglée">Manette de puissance</row>
    <row id="forced.restart.operation" note="Puissance dispo et paramètres vérifiés">Fonctionnement moteur</row>

    <info id="forced.landing_header">2.2 — Atterrissage forcé en campagne, moteur en panne (vitesse de finesse max = 145 km/h volets rentrés / 139 km/h volets 1er cran).</info>
    <row id="forced.landing.seatbelts" note="Serrés">Ceintures, harnais</row>
    <row id="forced.landing.radio" note="Réglés, message effectué">Radio, balise, transpondeur</row>
    <row id="forced.landing.avionics">Général avionique — OFF</row>
    <row id="forced.landing.elecpump">Pompe électrique — OFF</row>
    <row id="forced.landing.fuelvalve">Robinet carburant — Fermé</row>
    <row id="forced.landing.ignition">Contact Moteur — OFF</row>
    <row id="forced.landing.electrics">Batterie &amp; alternateur — OFF</row>
    <row id="forced.landing.canopy" note="Juste avant l'atterrissage">Verrière — Déverrouillée</row>
    <row id="forced.landing.braking" note="Comme nécessaire">Freinage</row>
    <row id="forced.landing.evacuation" note="Lorsque l'avion est arrêté">Évacuation d'urgence</row>
  </section>

  <section id="emergency-fire" title="Incendies" emergency="true">
    <choice id="fire.scenario" prompt="Quel type d'incendie ?">
      <branch id="engineGround" label="Feu moteur au sol, à la mise en route">
        <row id="fire.ground.ignition">Contact moteur — OFF</row>
        <row id="fire.ground.fuelvalve">Robinet carburant — Fermé</row>
        <row id="fire.ground.elecpump">Pompe électrique — OFF</row>
        <row id="fire.ground.electrics">Batterie &amp; Alternateur — OFF</row>
        <row id="fire.ground.evacuation" note="Si nécessaire">Évacuation d'urgence</row>
        <info id="fire.ground.extinguish">Éteindre l'incendie avec un extincteur, du sable ou une couverture.</info>
      </branch>
      <branch id="engineFlight" label="Feu moteur en vol">
        <row id="fire.flight.throttle">Manette de puissance — Plein réduit</row>
        <row id="fire.flight.speed">Vitesse — Inférieure à 185 km/h</row>
        <row id="fire.flight.ignition">Contact moteur — OFF</row>
        <row id="fire.flight.fuelvalve">Robinet carburant — Fermé</row>
        <row id="fire.flight.elecpump">Pompe électrique — OFF</row>
        <row id="fire.flight.radio" note="Passé en fonction du temps et de l'incendie">Message radio</row>
        <row id="fire.flight.cabinheat" note="Fermés (poussés)">Réchauffage cabine et ventilations</row>
        <info id="fire.flight.glide">Vitesse de finesse max = 145 km/h (volets rentrés) / 139 km/h (volets 1er cran).</info>
        <info id="fire.flight.persist">S'il est évident que le feu persiste : appliquer la procédure d'atterrissage moteur en panne.</info>
        <info id="fire.flight.extinguished" note="Si le feu est éteint, avant d'atterrir">Ventilations réglées pour le minimum de fumée ; général avionique ON ; n'allumer que les équipements nécessaires, atterrir sur le terrain le plus proche.</info>
      </branch>
      <branch id="electrical" label="Feu électrique">
        <row id="fire.elec.radio" note="Passé en fonction du temps et de l'incendie">Message radio</row>
        <row id="fire.elec.lights">Phares — Tous OFF</row>
        <row id="fire.elec.vents">Ventilations — Toutes fermées</row>
        <row id="fire.elec.cabinheat">Réchauffage cabine — Fermé (Poussé)</row>
        <row id="fire.elec.electrics">Batterie &amp; Alternateur — OFF</row>
        <info id="fire.elec.warning" note="ATTENTION">Fonctionnement du moteur sur la batterie de secours du FADEC. Ne pas forcer FADEC B. Prévoir un atterrissage d'urgence.</info>
        <row id="fire.elec.extinguished" note="Si le feu est éteint">Ventilations réglées pour le minimum de fumée</row>
        <row id="fire.elec.avionics">Général avionique — ON</row>
      </branch>
    </choice>
  </section>

  <section id="emergency-engine-malfunction" title="Mauvais fonctionnement du moteur" emergency="true">
    <choice id="malfunc.symptom" prompt="Quel symptôme observez-vous ?">
      <branch id="fadec" label="4.1 — Panne de FADEC en vol">
        <choice id="malfunc.fadec.detail" prompt="Quel voyant FADEC est concerné ?">
          <branch id="a" label="a) Un voyant FADEC clignote">
            <row id="malfunc.fadec.a.button" note="Appuyé au moins 2s">Bouton TEST FADEC</row>
            <info id="malfunc.fadec.a.low">Le voyant s'éteint (niveau d'alarme bas) : poursuivre le vol normalement et informer la maintenance.</info>
            <info id="malfunc.fadec.a.high">Le voyant est allumé constant (niveau d'alarme haut) : surveiller le voyant du second FADEC, atterrir sur le prochain aérodrome, prendre une vitesse inférieure à 185 km/h, informer la maintenance après l'atterrissage.</info>
          </branch>
          <branch id="b" label="b) Les deux voyants FADEC clignotent">
            <info id="malfunc.fadec.b.warning">Pourcentage de puissance non fiable. Les deux voyants FADEC peuvent clignoter suite à une panne de carburant.</info>
            <row id="malfunc.fadec.b.button" note="Appuyé au moins 2s">Bouton TEST FADEC</row>
            <info id="malfunc.fadec.b.low">Les voyants s'éteignent (niveau d'alarme bas) : poursuivre le vol normalement et informer la maintenance.</info>
            <info id="malfunc.fadec.b.high">Les voyants sont allumés constants (niveau d'alarme haut) : vérifier la puissance disponible, s'attendre à une panne moteur à tout moment, prendre une vitesse inférieure à 185 km/h, atterrir sur le prochain aérodrome, se préparer pour un atterrissage forcé, informer la maintenance après l'atterrissage.</info>
          </branch>
          <branch id="c" label="c) Fonctionnement anormal du moteur">
            <row id="malfunc.fadec.c.speed">Vitesse — Inférieure à 185 km/h</row>
            <row id="malfunc.fadec.c.forceb">FADEC A/B — FORCE B</row>
            <row id="malfunc.fadec.c.auto" note="Si pas d'amélioration">FADEC A/B — Retour sur AUTO</row>
          </branch>
        </choice>
      </branch>

      <branch id="oilpressure" label="4.2 — Pression d'huile trop basse">
        <row id="malfunc.oilpressure.value" note="&lt; 2,3 bar en croisière ou &lt; 1,2 bar au ralenti">Pression d'huile</row>
        <row id="malfunc.oilpressure.power">Puissance — Réduite aussi vite que possible</row>
        <info id="malfunc.oilpressure.high">Si la température d'huile est haute : atterrir dès que possible, s'attendre à une panne du moteur à tout moment, se préparer pour un atterrissage forcé.</info>
        <info id="malfunc.oilpressure.normal">Si la pression d'huile est normale : atterrir sur le prochain aérodrome disponible.</info>
      </branch>

      <branch id="oiltemp" label="4.3 — Température d'huile trop élevée">
        <row id="malfunc.oiltemp.power">Puissance — Réduite aussi vite que possible</row>
        <row id="malfunc.oiltemp.speed">Vitesse — Augmentée aussi vite que possible</row>
        <info id="malfunc.oiltemp.check">Si pression d'huile &lt; 2,3 bar en croisière ou &lt; 1,2 bar au ralenti : atterrir dès que possible, s'attendre à une panne du moteur à tout moment, se préparer pour un atterrissage forcé.</info>
        <row id="malfunc.oiltemp.land">Sinon : atterrir sur le prochain aérodrome disponible</row>
      </branch>

      <branch id="coolanttemp" label="4.4 — Température du liquide de refroidissement trop élevée">
        <row id="malfunc.coolanttemp.power">Puissance — Réduite aussi vite que possible</row>
        <row id="malfunc.coolanttemp.speed">Vitesse — Augmentée aussi vite que possible</row>
        <row id="malfunc.coolanttemp.cabinheat">Réchauffage cabine — Coupé (poussé)</row>
        <info id="malfunc.coolanttemp.note">Par temps chaud et en montée à basse vitesse, la température peut être élevée et déclencher une alerte moteur.</info>
        <info id="malfunc.coolanttemp.persist">Si le voyant "Niveau liquide de refroidissement" est allumé ou si la température ne diminue pas, en s'assurant que les actions ci-dessus ont été effectuées : atterrir sur le prochain aérodrome disponible, s'attendre à une panne du moteur à tout moment, se préparer pour un atterrissage forcé.</info>
      </branch>

      <branch id="coolantlevel" label="4.5 — Voyant 'Niveau liquide de refroidissement' allumé">
        <row id="malfunc.coolantlevel.speed">Vitesse — Augmentée (assiette diminuée)</row>
        <row id="malfunc.coolantlevel.power">Puissance — Réduite si la température passe au rouge</row>
        <info id="malfunc.coolantlevel.amber">Si la température du liquide de refroidissement augmente et rentre dans la zone ambre ou s'approche du rouge : atterrir sur le prochain aérodrome disponible, s'attendre à une panne moteur à tout moment, se préparer pour un atterrissage forcé.</info>
        <info id="malfunc.coolantlevel.prevent">Prévenir l'atelier de maintenance après le vol.</info>
      </branch>

      <branch id="reducertemp" label="4.6 — Température du réducteur trop élevée">
        <row id="malfunc.reducertemp.power" note="Entre 55% et 75%">Puissance — Réduite</row>
        <row id="malfunc.reducertemp.land">Atterrir dès que possible</row>
      </branch>

      <branch id="propspeed" label="4.7 — Vitesse de rotation de l'hélice trop élevée (&gt; 2300)">
        <row id="malfunc.propspeed.power">Puissance — Réduite</row>
        <row id="malfunc.propspeed.speed" note="Ou pour éviter survitesse">Vitesse — Inférieure à 185 km/h</row>
        <row id="malfunc.propspeed.land">Atterrir sur le prochain aérodrome disponible</row>
      </branch>

      <branch id="propvariation" label="4.8 — Variation de la vitesse de rotation de l'hélice (+/- 100 RPM)">
        <row id="malfunc.propvariation.throttle">Manette de puissance — Réglée pour un régime plus stable</row>
        <info id="malfunc.propvariation.noresult">Si pas de résultat : puissance maximale pour une vitesse inférieure à 185 km/h.</info>
        <info id="malfunc.propvariation.resolved">Si problème résolu, poursuivre le vol.</info>
        <info id="malfunc.propvariation.continues">Si le problème continue : vitesse inférieure à 185 km/h, manette de puissance réglée pour le régime le plus stable, atterrir dès que possible.</info>
      </branch>

      <branch id="fueltemp" label="4.9 — Température carburant basse">
        <row id="malfunc.fueltemp.altitude">Altitude — Adaptée pour augmenter la T°ext</row>
        <info id="malfunc.fueltemp.insufficient">Si pas d'augmentation de température suffisante : atterrir sur le prochain aérodrome disponible.</info>
      </branch>
    </choice>
  </section>

  <section id="emergency-aircraft-systems" title="Mauvais fonctionnement systèmes avion" emergency="true">
    <choice id="sys.symptom" prompt="Quel symptôme observez-vous ?">
      <branch id="electricalgen" label="5.1 — Panne de génération électrique">
        <row id="sys.elecgen.breakers" note="Vérifiés">Disjoncteurs / Interrupteur</row>
        <row id="sys.elecgen.voltmeter" note="Vérifiés">Voyant et Voltmètre</row>
        <info id="sys.elecgen.alternator_confirmed">Si la panne d'Alternateur est confirmée :</info>
        <row id="sys.elecgen.alternator">Alternateur — OFF</row>
        <row id="sys.elecgen.battery">Batterie — Soulagée</row>
        <row id="sys.elecgen.land">Atterrir sur le prochain aérodrome disponible</row>
        <info id="sys.elecgen.total">Si la panne électrique est totale (batterie aussi à plat) : le moteur fonctionne grâce au FADEC A alimenté par sa batterie de secours. Ne pas basculer sur Force B sous peine d'arrêter le moteur. Atterrissage au plus vite.</info>
      </branch>
      <branch id="carbonmonoxide" label="5.2 — Détection de monoxyde de carbone">
        <row id="sys.co.cabinheat">Réchauffage cabine — Coupé (poussé)</row>
        <row id="sys.co.vents">Aérations de chauffage — Toutes fermées (poussées)</row>
        <row id="sys.co.freshair">Bouches d'aération d'air frais extérieur — Toutes ouvertes</row>
        <row id="sys.co.land">Atterrir sur le prochain aérodrome disponible</row>
        <info id="sys.co.prevent">Prévenir l'atelier de maintenance après le vol.</info>
      </branch>
    </choice>
  </section>

  <section id="emergency-icing" title="Givrage" emergency="true">
    <row id="icing.cabinheat">Réchauffage cabine — À convenance</row>
    <row id="icing.secondaryair">Admission Air secours — Ouvert</row>
    <info id="icing.stallspeed">La vitesse de décrochage peut être fortement augmentée.</info>
    <row id="icing.power" note="Toutes les vitesses sont à majorer">Puissance — Augmentée</row>
    <info id="icing.propeller">Si du givrage est suspecté sur les pales d'hélice, faire de rapides changements de puissance pour décoller la glace.</info>
    <row id="icing.land" note="Approche volets rentrés et Vi &gt; 145 km/h">Atterrir sur le prochain aérodrome disponible</row>
    <info id="icing.severe">Si la glace se forme vite et en quantité, effectuer un atterrissage forcé.</info>
  </section>

  <section id="emergency-spin" title="Vrille involontaire" emergency="true">
    <row id="spin.throttle">Manette de puissance — Plein réduit</row>
    <row id="spin.rudder">Direction — À fond contre le sens de rotation</row>
    <row id="spin.elevator">Profondeur — Au neutre</row>
    <row id="spin.ailerons">Ailerons — Au neutre</row>
    <info id="spin.recovery">Dès la sortie de vrille, direction au neutre et ressource.</info>
    <info id="spin.flaps">Si les volets étaient sortis au début de la vrille, les rentrer immédiatement.</info>
  </section>
</checklist>
`}),Oe=class{getRawXml(e,t,n){let r=`/src/fixed-data/checklists/${e===`general`?`general/general`:`${e}/${t}`}`;return De[`${r}.${n}.xml`]??De[`${r}.xml`]}},ke=class{constructor(e){L(this,`storage`,void 0),this.storage=e}load(e){let t;try{t=this.storage.getItem(e)}catch{return{}}if(typeof t!=`string`||!t)return{};let n;try{n=JSON.parse(t)}catch{return{}}let r={};if(n&&typeof n==`object`&&!Array.isArray(n))for(let[e,t]of Object.entries(n))typeof t==`string`&&e!==`__proto__`&&(r[e]=t);return r}save(e,t){try{this.storage.setItem(e,JSON.stringify(t))}catch{}}},Ae=Symbol(`checklistState`),je=Symbol(`checklistChange`),Y=class{constructor(e,t,n){L(this,`id`,void 0),L(this,`text`,void 0),L(this,`note`,void 0),this.id=e,this.text=t,this.note=n}},X=class{constructor(e,t,n){L(this,`id`,void 0),L(this,`text`,void 0),L(this,`note`,void 0),this.id=e,this.text=t,this.note=n}},Me=class{constructor(e,t,n){L(this,`id`,void 0),L(this,`label`,void 0),L(this,`items`,void 0),this.id=e,this.label=t,this.items=n}},Z=class{constructor(e,t,n){L(this,`id`,void 0),L(this,`prompt`,void 0),L(this,`branches`,void 0),this.id=e,this.prompt=t,this.branches=n}},Ne=[`emergency`,`collapsed`,`dolist`];function Pe(e){let t={};for(let n of Ne)t[n]=e.getAttribute(n)===`true`;return t}function Fe(e,t){let n={};for(let r of Ne)n[r]=e[r]||t[r];return n}var Ie=class{constructor(e,t,n,r){L(this,`id`,void 0),L(this,`title`,void 0),L(this,`flags`,void 0),L(this,`items`,void 0),this.id=e,this.title=t,this.flags=n,this.items=r}};function Q(e,t){let n=e.getAttribute(t);if(!n)throw Error(`<${e.tagName}> element is missing a "${t}" attribute`);return n}function Le(e,t){return Array.from(e.children).filter(e=>e.tagName===t)}function Re(e){let t=[];for(let n of Array.from(e.children))switch(n.tagName){case`row`:t.push(ze(n));break;case`choice`:t.push(He(n));break;case`info`:t.push(Be(n))}return t}function ze(e){return new Y(Q(e,`id`),e.textContent?.trim()??``,e.getAttribute(`note`))}function Be(e){return new X(Q(e,`id`),e.textContent?.trim()??``,e.getAttribute(`note`))}function Ve(e){return new Me(Q(e,`id`),e.getAttribute(`label`)??``,Re(e))}function He(e){return new Z(Q(e,`id`),e.getAttribute(`prompt`)??``,Le(e,`branch`).map(Ve))}function Ue(e){return new Ie(Q(e,`id`),e.getAttribute(`title`)??``,Pe(e),Re(e))}var We=class{constructor(e){L(this,`id`,void 0),L(this,`replace`,void 0),L(this,`sections`,void 0);let t=new DOMParser().parseFromString(e,`application/xml`),n=t.getElementsByTagName(`parsererror`)[0];if(n)throw Error(`Invalid checklist XML: ${n.textContent}`);let r=t.documentElement;if(r.tagName!==`checklist`)throw Error(`Checklist XML must have a <checklist> root element`);this.id=r.getAttribute(`id`)??``,this.replace=r.getAttribute(`replace`)===`true`,this.sections=Le(r,`section`).map(Ue)}};function $(e,t,n){let r=[...e];for(let e of t){let t=r.findIndex(t=>t.id===e.id);t>=0?r[t]=n(r[t],e):r.push(e)}return r}function Ge(e,t){return e instanceof Z&&t instanceof Z?new Z(t.id,t.prompt||e.prompt,$(e.branches,t.branches,Ke)):e instanceof Y&&t instanceof Y?new Y(t.id,t.text||e.text,t.note??e.note):e instanceof X&&t instanceof X?new X(t.id,t.text||e.text,t.note??e.note):t}function Ke(e,t){return new Me(t.id,t.label||e.label,qe(e.items,t.items))}function qe(e,t){return $(e,t,Ge)}function Je(e,t){return new Ie(t.id,t.title||e.title,Fe(e.flags,t.flags),qe(e.items,t.items))}function Ye(e,t){return $(e,t,Je)}var Xe=class{constructor(e,t,n){if(L(this,`sections`,void 0),n?.replace){this.sections=n.sections;return}if(t){this.sections=n?Ye(t.sections,n.sections):t.sections;return}if(n){this.sections=n.sections;return}this.sections=e?.sections??[]}findSection(e){return this.sections.find(t=>t.id===e)}emergencySections(){return this.sections.filter(e=>e.flags.emergency)}},Ze={class:`text-caption`},Qe={key:2,class:`q-my-sm q-pl-sm`},$e={class:`text-weight-medium`},et={class:`row q-gutter-xs q-my-xs`},tt=f({__name:`ChecklistItemList`,props:{items:{}},setup(e){let t=l(Ae),n=l(je);if(t===void 0||n===void 0)throw Error(`ChecklistItemList must be used within a component providing checklistStateKey`);let a=t,o=n;function c(e){return e instanceof Y}function u(e){return e instanceof X}function f(e){return e instanceof Z}function p(e){return e in a&&Object.hasOwn(a,e)}function h(e){let t=a[e.id];return e.branches.find(e=>e.id===t)}function _(e,t){t?a[e]=K(new Date):delete a[e],o()}function S(e,t){a[e]=t,o()}return(t,n)=>{let o=i(`ChecklistItemList`,!0);return s(),E(W,{dense:``},{default:d(()=>[(s(!0),v(w,null,r(e.items,e=>(s(),v(w,{key:e.id},[c(e)?(s(),E(I,{key:0,tag:`label`,class:D({"items-start":!!e.note})},{default:d(()=>[y(F,{side:``,top:!!e.note},{default:d(()=>[y(ce,{"model-value":p(e.id),"onUpdate:modelValue":t=>_(e.id,t)},null,8,[`model-value`,`onUpdate:modelValue`])]),_:2},1032,[`top`]),y(F,null,{default:d(()=>[y(P,null,{default:d(()=>[b(m(e.text),1)]),_:2},1024),e.note?(s(),E(P,{key:0,caption:``},{default:d(()=>[b(m(e.note),1)]),_:2},1024)):g(``,!0)]),_:2},1024),p(e.id)?(s(),E(F,{key:0,side:``},{default:d(()=>[y(P,{caption:``},{default:d(()=>[b(m(x(a)[e.id]),1)]),_:2},1024)]),_:2},1024)):g(``,!0)]),_:2},1032,[`class`])):u(e)?(s(),E(fe,{key:1,dense:``,class:`bg-blue-1 text-blue-10 q-my-xs`},ee({default:d(()=>[b(m(e.text)+` `,1)]),_:2},[e.note?{name:`action`,fn:d(()=>[C(`span`,Ze,m(e.note),1)]),key:`0`}:void 0]),1024)):f(e)?(s(),v(`div`,Qe,[C(`div`,$e,m(e.prompt),1),C(`div`,et,[(s(!0),v(w,null,r(e.branches,t=>(s(),E(N,{key:t.id,dense:``,"no-caps":``,outline:x(a)[e.id]!==t.id,color:x(a)[e.id]===t.id?`primary`:void 0,label:t.label,onClick:n=>S(e.id,t.id)},null,8,[`outline`,`color`,`label`,`onClick`]))),128))]),h(e)?(s(),E(o,{key:0,items:h(e).items},null,8,[`items`])):g(``,!0)])):g(``,!0)],64))),128))]),_:1})}}});function nt(e,t,n,r){let i=e.getRawXml(t,n,r);return i?new We(i):null}function rt(e,t,n){return new Xe(nt(e,`general`,`general`,n),nt(e,`model`,t.model,n),nt(e,`plane`,t.immatriculation,n))}var it={class:`q-gutter-md`},at={class:`row items-center q-gutter-md`},ot={class:`text-caption text-grey`},st={class:`row q-gutter-xs q-mt-xs`},ct={key:1},lt={key:2,class:`text-grey q-pa-md text-center`},ut=he(f({__name:`ChecklistPage`,setup(i){let o=ne(),{t:l,locale:f}=se({useScope:`global`}),{confirmDialog:p}=pe(),_=h(()=>o.screen.lt.sm),x=e(0);S(()=>{x.value=document.querySelector(`.q-header`)?.getBoundingClientRect().height??0});let ee=new Oe,T=new ke(o.localStorage),O=h(()=>Object.values(G).sort((e,t)=>e.immatriculation.localeCompare(t.immatriculation)).map(e=>({label:e.toString(),value:e.immatriculation}))),k=e(``),A=h(()=>G[k.value]??null),j=e(me(new Date)),M;S(()=>{M=setInterval(()=>{j.value=me(new Date)},1e3)}),a(()=>{clearInterval(M)});let P=e(null),I=c({});function L(){let e=A.value;if(!e){P.value=null;return}P.value=rt(ee,e,f.value);for(let e of P.value.sections)e.id in I||(I[e.id]=!e.flags.collapsed)}n(f,L);function ae(e){return e.flags.emergency?`bg-red-1 text-red-10`:e.flags.dolist?`bg-blue-1 text-blue-10`:`bg-green-1 text-green-10`}let R=c({});function oe(e){return`checklist.state.${e}`}function B(){for(let e of Object.keys(R))delete R[e];let e=A.value;e&&Object.assign(R,T.load(oe(e.immatriculation)))}function V(){let e=A.value;e&&T.save(oe(e.immatriculation),{...R})}function ce(){V()}t(Ae,R),t(je,ce);function H(e){k.value=e,o.sessionStorage?.setItem(`checklist.input.planeIdent`,e),L(),B()}let U=new Map;function le(e,t){t?U.set(e,t):U.delete(e)}function W(e){let t=document.querySelector(`.checklist-sticky-bar`);if(!t)return;let n=t.getBoundingClientRect().bottom,r=e.getBoundingClientRect().top+window.scrollY-n-8;window.scrollTo({top:r,behavior:`smooth`})}function fe(e){I[e]=!0,u(()=>{let t=U.get(e)?.$el;t&&W(t)})}let K=e(null);function he(){K.value&&W(K.value)}function _e(){if(P.value)for(let e of P.value.sections)e.flags.emergency||(I[e.id]=!1)}function ve(e){let t=[],n=e=>{for(let r of e)if(t.push(r.id),r instanceof Z)for(let e of r.branches)n(e.items)};return n(e.items),t}function q(e){for(let t of ve(e))delete R[t];V()}function ye(){p(l(`confirmClearAllChecklistMessage`)).onOk(()=>{for(let e of Object.keys(R))delete R[e];V()})}return S(()=>{let e=o.sessionStorage.getItem(`checklist.input.planeIdent`),t=e&&G[e]?e:O.value[0]?.value??``;t&&H(t)}),(e,t)=>(s(),E(de,{padding:``,class:`col`},{default:d(()=>[C(`div`,it,[y(z,{flat:``,bordered:``,class:`q-pa-sm checklist-sticky-bar`,style:te({top:`${x.value}px`})},{default:d(()=>[C(`div`,at,[y(ie,{class:`col-12 col-sm`,modelValue:k.value,"onUpdate:modelValue":[t[0]||=e=>k.value=e,H],label:e.$t(`checklistPlaneLabel`),hint:e.$t(`checklistPlaneHint`),options:O.value,"emit-value":``,"map-options":``},null,8,[`modelValue`,`label`,`hint`,`options`]),C(`div`,{class:D([`col-auto text-weight-bold`,_.value?`text-body1`:`text-h6`])},m(j.value),3),_.value?(s(),E(ge,{key:0})):g(``,!0),P.value&&P.value.emergencySections().length?(s(),E(N,{key:1,flat:``,dense:``,icon:`warning`,color:`negative`,label:_.value?void 0:e.$t(`checklistEmergencyJumpLabel`),round:_.value,"aria-label":e.$t(`checklistEmergencyJumpLabel`),onClick:he},null,8,[`label`,`round`,`aria-label`])):g(``,!0),P.value?(s(),E(N,{key:2,flat:``,dense:``,icon:`unfold_less`,label:_.value?void 0:e.$t(`checklistCollapseAllLabel`),round:_.value,"aria-label":e.$t(`checklistCollapseAllLabel`),onClick:_e},null,8,[`label`,`round`,`aria-label`])):g(``,!0),P.value?(s(),E(N,{key:3,flat:``,dense:``,icon:`delete_sweep`,label:_.value?void 0:e.$t(`checklistClearAllLabel`),round:_.value,"aria-label":e.$t(`checklistClearAllLabel`),onClick:ye},null,8,[`label`,`round`,`aria-label`])):g(``,!0)])]),_:1},8,[`style`]),P.value&&P.value.emergencySections().length?(s(),v(`div`,{key:0,ref_key:`emergencyPanelRef`,ref:K},[C(`span`,ot,m(e.$t(`checklistEmergencyJumpLabel`)),1),C(`div`,st,[(s(!0),v(w,null,r(P.value.emergencySections(),e=>(s(),E(N,{key:e.id,outline:``,dense:``,"no-caps":``,color:`negative`,label:e.title,onClick:t=>fe(e.id)},null,8,[`label`,`onClick`]))),128))])],512)):g(``,!0),P.value?(s(),v(`div`,ct,[(s(!0),v(w,null,r(P.value.sections,t=>(s(),E(Ee,{key:t.id,ref_for:!0,ref:e=>le(t.id,e),"model-value":I[t.id]??!1,"onUpdate:modelValue":e=>I[t.id]=e,"header-class":ae(t)},{header:d(()=>[y(F,null,{default:d(()=>[b(m(t.title),1)]),_:2},1024),y(F,{side:``},{default:d(()=>[y(N,{flat:``,dense:``,round:``,icon:`clear`,"aria-label":e.$t(`checklistClearSectionLabel`),onClick:re(e=>q(t),[`stop`])},null,8,[`aria-label`,`onClick`])]),_:2},1024)]),default:d(()=>[y(z,null,{default:d(()=>[y(ue,null,{default:d(()=>[y(tt,{items:t.items},null,8,[`items`])]),_:2},1024)]),_:2},1024)]),_:2},1032,[`model-value`,`onUpdate:modelValue`,`header-class`]))),128))])):(s(),v(`div`,lt,m(e.$t(`checklistNoPlaneSelected`)),1))])]),_:1}))}}),[[`__scopeId`,`data-v-b5ac4ce4`]]);export{ut as default};