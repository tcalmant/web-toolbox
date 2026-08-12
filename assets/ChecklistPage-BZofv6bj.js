import{n as e}from"./vue-i18n-BnMVFRRW.js";import{$ as t,A as n,B as r,Bn as i,Bt as a,H as o,Hn as s,It as c,J as l,Kt as u,Mt as d,Ot as f,Qn as p,Rt as m,S as h,Tt as g,U as _,Un as v,V as y,W as b,Wt as x,X as S,Z as C,_n as w,fn as T,ir as E,rr as ee,st as te,t as D,tr as O,ut as k,vt as A,w as ne,yn as j}from"./runtime-dom.esm-bundler-CvL4s6M5.js";import{F as M,I as N,c as P,m as F,r as I,t as L}from"./QBtn-1AkDQ40x.js";import{B as re,V as R,_ as ie,g as ae,h as z,m as oe,p as B,q as se,t as ce,v as V,y as H,z as le}from"./index-xM9g-FCs.js";import{l as U,m as W,n as ue,t as G,u as K}from"./defineProperty-lTUoi6gj.js";import{t as de}from"./QList-U7_2cO4C.js";import{t as fe}from"./QPage-DLsRAL1_.js";import{r as pe,s as me}from"./time-BCELA-fs.js";import{r as he,t as q}from"./airplanesRepository-CJG61egT.js";import{t as ge}from"./_plugin-vue_export-helper-BDNMzG2s.js";var _e=N({name:`QSpace`,setup(){let e=k(`div`,{class:`q-space`});return()=>e}}),ve=N({name:`QSlideTransition`,props:{appear:Boolean,duration:{type:Number,default:300}},emits:[`show`,`hide`],setup(e,{slots:t,emit:n}){let r=!1,i,a,o=null,s=null,c,l;function u(){i?.(),i=null,r=!1,o!==null&&(clearTimeout(o),o=null),s!==null&&(clearTimeout(s),s=null),a?.removeEventListener(`transitionend`,c),c=null}function d(t,n,a){n!==void 0&&(t.style.height=`${n}px`),t.style.transition=`height ${e.duration}ms cubic-bezier(.25, .8, .50, 1)`,r=!0,i=a}function p(e,t){e.style.overflowY=null,e.style.height=null,e.style.transition=null,u(),t!==l&&n(t)}function m(t,n){let i=0;a=t,r?(u(),i=t.offsetHeight===t.scrollHeight?0:void 0):(l=`hide`,t.style.overflowY=`hidden`),d(t,i,n),o=setTimeout(()=>{o=null,t.style.height=`${t.scrollHeight}px`,c=e=>{(Object(e)!==e||e.target===t)&&p(t,`show`)},t.addEventListener(`transitionend`,c),s=setTimeout(c,e.duration*1.1)},100)}function h(t,n){let i;a=t,r?u():(l=`show`,t.style.overflowY=`hidden`,i=t.scrollHeight),d(t,i,n),o=setTimeout(()=>{o=null,t.style.height=0,c=e=>{(Object(e)!==e||e.target===t)&&p(t,`hide`)},t.addEventListener(`transitionend`,c),s=setTimeout(c,e.duration*1.1)},100)}return f(()=>{r&&u()}),()=>k(D,{css:!1,appear:e.appear,onEnter:m,onLeave:h},t.default)}}),J=v({});function ye(e){e.keyCode===32&&M(e)}var be=Object.keys(I),xe=N({name:`QExpansionItem`,props:{...I,...R,...H,icon:String,label:String,labelLines:[Number,String],caption:String,captionLines:[Number,String],dense:Boolean,toggleAriaLabel:String,expandIcon:String,expandedIcon:String,expandIconClass:[Array,String,Object],duration:{},headerInsetLevel:Number,contentInsetLevel:Number,expandSeparator:Boolean,defaultOpened:Boolean,hideExpandIcon:Boolean,expandIconToggle:Boolean,switchToggleSide:Boolean,denseToggle:Boolean,group:String,popup:Boolean,headerStyle:[Array,String,Object],headerClass:[Array,String,Object]},emits:[...re,`click`,`afterShow`,`afterHide`],setup(e,{slots:t,emit:n}){let{proxy:{$q:i}}=te(),a=V(e,i),o=s(e.modelValue===null?e.defaultOpened:e.modelValue),c=s(null),l=B(),{show:u,hide:d,toggle:p}=le({showing:o}),m,g,_=r(()=>`q-expansion-item q-item-type q-expansion-item--${o.value?`expanded`:`collapsed`} q-expansion-item--${e.popup?`popup`:`standard`}`),v=r(()=>e.contentInsetLevel===void 0?null:{[`padding`+(i.lang.rtl?`Right`:`Left`)]:e.contentInsetLevel*56+`px`}),y=r(()=>!e.disable&&(e.href!==void 0||e.to!==void 0&&e.to!==null&&e.to!==``)),b=r(()=>{let t={};return be.forEach(n=>{t[n]=e[n]}),t}),x=r(()=>y.value||!e.expandIconToggle),S=r(()=>e.expandedIcon!==void 0&&o.value?e.expandedIcon:e.expandIcon||i.iconSet.expansionItem[e.denseToggle?`denseIcon`:`icon`]),C=r(()=>!e.disable&&(y.value||e.expandIconToggle)),w=r(()=>({expanded:o.value,detailsId:l.value,toggle:p,show:u,hide:d})),E=r(()=>{let t=e.toggleAriaLabel===void 0?i.lang.label[o.value?`collapse`:`expand`](e.label):e.toggleAriaLabel;return{role:`button`,"aria-expanded":o.value?`true`:`false`,"aria-controls":l.value,"aria-label":t}});T(()=>e.group,e=>{g?.(),e!==void 0&&N()});function ee(e){y.value||p(e),n(`click`,e)}function D(e){[13,32].includes(e.keyCode)&&O(e,!0)}function O(e,t){!t&&!e.qAvoidFocus&&c.value?.focus(),p(e),M(e)}function A(){n(`afterShow`)}function ne(){n(`afterHide`)}function N(){m===void 0&&(m=oe()),o.value&&(J[e.group]=m);let t=T(o,t=>{t?J[e.group]=m:J[e.group]===m&&delete J[e.group]}),n=T(()=>J[e.group],(e,t)=>{t===m&&e!==void 0&&e!==m&&d()});g=()=>{t(),n(),J[e.group]===m&&delete J[e.group],g=void 0}}function I(){let t={class:[`q-focusable relative-position cursor-pointer${e.denseToggle&&e.switchToggleSide?` items-end`:``}`,e.expandIconClass],side:!e.switchToggleSide,avatar:e.switchToggleSide},n=[k(P,{class:`q-expansion-item__toggle-icon`+(e.expandedIcon===void 0&&o.value?` q-expansion-item__toggle-icon--rotated`:``),name:S.value})];return C.value&&(Object.assign(t,{tabindex:0,...E.value,onClick:O,onKeydown:ye,onKeyup:D}),n.unshift(k(`div`,{ref:c,class:`q-expansion-item__toggle-focus q-icon q-focus-helper q-focus-helper--rounded`,tabindex:-1}))),k(K,t,()=>n)}function L(){let n;return t.header===void 0?(n=[k(K,()=>[k(W,{lines:e.labelLines},()=>e.label||``),e.caption?k(W,{lines:e.captionLines,caption:!0},()=>e.caption):null])],e.icon&&n[e.switchToggleSide?`push`:`unshift`](k(K,{side:e.switchToggleSide,avatar:!e.switchToggleSide},()=>k(P,{name:e.icon})))):n=[t.header(w.value)].flat(),!e.disable&&!e.hideExpandIcon&&n[e.switchToggleSide?`unshift`:`push`](I()),n}function re(){let t={ref:`item`,style:e.headerStyle,class:e.headerClass,dark:a.value,disable:e.disable,dense:e.dense,insetLevel:e.headerInsetLevel};return x.value&&(t.clickable=!0,t.onClick=ee,Object.assign(t,y.value?b.value:E.value)),k(U,t,L)}function R(){return j(k(`div`,{key:`e-content`,class:`q-expansion-item__content relative-position`,style:v.value,id:l.value},F(t.default)),[[h,o.value]])}function ie(){let t=[re(),k(ve,{duration:e.duration,onShow:A,onHide:ne},R)];return e.expandSeparator&&t.push(k(z,{class:`q-expansion-item__border q-expansion-item__border--top absolute-top`,dark:a.value}),k(z,{class:`q-expansion-item__border q-expansion-item__border--bottom absolute-bottom`,dark:a.value})),t}return e.group!==void 0&&N(),f(()=>{g?.()}),()=>k(`div`,{class:_.value},[k(`div`,{class:`q-expansion-item__container relative-position`},ie())])}}),Se=Object.assign({"/src/fixed-data/checklists/general/general.xml":`<?xml version="1.0" encoding="UTF-8"?>
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
`}),Ce=class{getRawXml(e,t,n){let r=`/src/fixed-data/checklists/${e===`general`?`general/general`:`${e}/${t}`}`;return Se[`${r}.${n}.xml`]??Se[`${r}.xml`]}},we=class{constructor(e){G(this,`storage`,void 0),this.storage=e}load(e){let t=this.storage.getItem(e);if(!t)return{};try{return JSON.parse(t)}catch{return{}}}save(e,t){this.storage.setItem(e,JSON.stringify(t))}},Te=N({name:`QBanner`,props:{...H,inlineActions:Boolean,dense:Boolean,rounded:Boolean},setup(e,{slots:t}){let{proxy:{$q:n}}=te(),i=V(e,n),a=r(()=>`q-banner row items-center`+(e.dense?` q-banner--dense`:``)+(i.value?` q-banner--dark q-dark`:``)+(e.rounded?` rounded-borders`:``)),o=r(()=>`q-banner__actions row items-center justify-end col-${e.inlineActions?`auto`:`all`}`);return()=>{let n=[k(`div`,{class:`q-banner__avatar col-auto row items-center self-start`},F(t.avatar)),k(`div`,{class:`q-banner__content col text-body2`},F(t.default))],r=F(t.action);return r!==void 0&&n.push(k(`div`,{class:o.value},r)),k(`div`,{class:a.value+(!e.inlineActions&&r!==void 0?` q-banner--top-padding`:``),role:`alert`},n)}}}),Ee=Symbol(`checklistState`),De=Symbol(`checklistChange`),Y=class{constructor(e,t,n){G(this,`id`,void 0),G(this,`text`,void 0),G(this,`note`,void 0),this.id=e,this.text=t,this.note=n}},X=class{constructor(e,t,n){G(this,`id`,void 0),G(this,`text`,void 0),G(this,`note`,void 0),this.id=e,this.text=t,this.note=n}},Oe=class{constructor(e,t,n){G(this,`id`,void 0),G(this,`label`,void 0),G(this,`items`,void 0),this.id=e,this.label=t,this.items=n}},Z=class{constructor(e,t,n){G(this,`id`,void 0),G(this,`prompt`,void 0),G(this,`branches`,void 0),this.id=e,this.prompt=t,this.branches=n}},ke=[`emergency`,`collapsed`,`dolist`];function Ae(e){let t={};for(let n of ke)t[n]=e.getAttribute(n)===`true`;return t}function je(e,t){let n={};for(let r of ke)n[r]=e[r]||t[r];return n}var Me=class{constructor(e,t,n,r){G(this,`id`,void 0),G(this,`title`,void 0),G(this,`flags`,void 0),G(this,`items`,void 0),this.id=e,this.title=t,this.flags=n,this.items=r}};function Q(e,t){let n=e.getAttribute(t);if(!n)throw Error(`<${e.tagName}> element is missing a "${t}" attribute`);return n}function Ne(e,t){return Array.from(e.children).filter(e=>e.tagName===t)}function Pe(e){let t=[];for(let n of Array.from(e.children))switch(n.tagName){case`row`:t.push(Fe(n));break;case`choice`:t.push(Re(n));break;case`info`:t.push(Ie(n));break}return t}function Fe(e){return new Y(Q(e,`id`),e.textContent?.trim()??``,e.getAttribute(`note`))}function Ie(e){return new X(Q(e,`id`),e.textContent?.trim()??``,e.getAttribute(`note`))}function Le(e){return new Oe(Q(e,`id`),e.getAttribute(`label`)??``,Pe(e))}function Re(e){return new Z(Q(e,`id`),e.getAttribute(`prompt`)??``,Ne(e,`branch`).map(Le))}function ze(e){return new Me(Q(e,`id`),e.getAttribute(`title`)??``,Ae(e),Pe(e))}var Be=class{constructor(e){G(this,`id`,void 0),G(this,`replace`,void 0),G(this,`sections`,void 0);let t=new DOMParser().parseFromString(e,`application/xml`),n=t.getElementsByTagName(`parsererror`)[0];if(n)throw Error(`Invalid checklist XML: ${n.textContent}`);let r=t.documentElement;if(r.tagName!==`checklist`)throw Error(`Checklist XML must have a <checklist> root element`);this.id=r.getAttribute(`id`)??``,this.replace=r.getAttribute(`replace`)===`true`,this.sections=Ne(r,`section`).map(ze)}};function Ve(e,t,n){let r=[...e];for(let e of t){let t=r.findIndex(t=>t.id===e.id);t>=0?r[t]=n(r[t],e):r.push(e)}return r}function He(e,t){return e instanceof Z&&t instanceof Z?new Z(t.id,t.prompt||e.prompt,Ve(e.branches,t.branches,Ue)):e instanceof Y&&t instanceof Y?new Y(t.id,t.text||e.text,t.note??e.note):e instanceof X&&t instanceof X?new X(t.id,t.text||e.text,t.note??e.note):t}function Ue(e,t){return new Oe(t.id,t.label||e.label,We(e.items,t.items))}function We(e,t){return Ve(e,t,He)}function Ge(e,t){return new Me(t.id,t.title||e.title,je(e.flags,t.flags),We(e.items,t.items))}function Ke(e,t){return Ve(e,t,Ge)}var qe=class{constructor(e,t,n){if(G(this,`sections`,void 0),n?.replace){this.sections=n.sections;return}if(t){this.sections=n?Ke(t.sections,n.sections):t.sections;return}if(n){this.sections=n.sections;return}this.sections=e?.sections??[]}findSection(e){return this.sections.find(t=>t.id===e)}emergencySections(){return this.sections.filter(e=>e.flags.emergency)}},Je={class:`text-caption`},Ye={key:2,class:`q-my-sm q-pl-sm`},Xe={class:`text-weight-medium`},Ze={class:`row q-gutter-xs q-my-xs`},Qe=t({__name:`ChecklistItemList`,props:{items:{}},setup(e){let t=A(Ee),r=A(De);if(t===void 0||r===void 0)throw Error(`ChecklistItemList must be used within a component providing checklistStateKey`);let i=t,a=r;function s(e){return e instanceof Y}function c(e){return e instanceof X}function d(e){return e instanceof Z}function f(e){return e in i&&Object.hasOwn(i,e)}function h(e){let t=i[e.id];return e.branches.find(e=>e.id===t)}function g(e,t){t?i[e]=pe(new Date):delete i[e],a()}function v(e,t){i[e]=t,a()}return(t,r)=>{let a=u(`ChecklistItemList`,!0);return m(),o(de,{dense:``},{default:w(()=>[(m(!0),b(n,null,x(e.items,e=>(m(),b(n,{key:e.id},[s(e)?(m(),o(U,{key:0,tag:`label`,class:O({"items-start":!!e.note})},{default:w(()=>[C(K,{side:``,top:!!e.note},{default:w(()=>[C(ce,{"model-value":f(e.id),"onUpdate:modelValue":t=>g(e.id,t)},null,8,[`model-value`,`onUpdate:modelValue`])]),_:2},1032,[`top`]),C(K,null,{default:w(()=>[C(W,null,{default:w(()=>[S(E(e.text),1)]),_:2},1024),e.note?(m(),o(W,{key:0,caption:``},{default:w(()=>[S(E(e.note),1)]),_:2},1024)):_(``,!0)]),_:2},1024),f(e.id)?(m(),o(K,{key:0,side:``},{default:w(()=>[C(W,{caption:``},{default:w(()=>[S(E(p(i)[e.id]),1)]),_:2},1024)]),_:2},1024)):_(``,!0)]),_:2},1032,[`class`])):c(e)?(m(),o(Te,{key:1,dense:``,class:`bg-blue-1 text-blue-10 q-my-xs`},l({default:w(()=>[S(E(e.text)+` `,1)]),_:2},[e.note?{name:`action`,fn:w(()=>[y(`span`,Je,E(e.note),1)]),key:`0`}:void 0]),1024)):d(e)?(m(),b(`div`,Ye,[y(`div`,Xe,E(e.prompt),1),y(`div`,Ze,[(m(!0),b(n,null,x(e.branches,t=>(m(),o(L,{key:t.id,dense:``,"no-caps":``,outline:p(i)[e.id]!==t.id,color:p(i)[e.id]===t.id?`primary`:void 0,label:t.label,onClick:n=>v(e.id,t.id)},null,8,[`outline`,`color`,`label`,`onClick`]))),128))]),h(e)?(m(),o(a,{key:0,items:h(e).items},null,8,[`items`])):_(``,!0)])):_(``,!0)],64))),128))]),_:1})}}});function $(e,t,n,r){let i=e.getRawXml(t,n,r);return i?new Be(i):null}function $e(e,t,n){return new qe($(e,`general`,`general`,n),$(e,`model`,t.model,n),$(e,`plane`,t.immatriculation,n))}var et={class:`q-gutter-md`},tt={class:`row items-center q-gutter-md`},nt={class:`text-caption text-grey`},rt={class:`row q-gutter-xs q-mt-xs`},it={key:1},at={key:2,class:`text-grey q-pa-md text-center`},ot=ge(t({__name:`ChecklistPage`,setup(t){let l=se(),{t:u,locale:f}=e({useScope:`global`}),{confirmDialog:p}=he(),h=r(()=>l.screen.lt.sm),v=s(0);d(()=>{v.value=document.querySelector(`.q-header`)?.getBoundingClientRect().height??0});let te=new Ce,D=new we(l.localStorage),k=r(()=>Object.values(q).sort((e,t)=>e.immatriculation.localeCompare(t.immatriculation)).map(e=>({label:e.toString(),value:e.immatriculation}))),A=s(``),j=r(()=>q[A.value]??null),M=s(me(new Date)),N;d(()=>{N=setInterval(()=>{M.value=me(new Date)},1e3)}),c(()=>{clearInterval(N)});let P=s(null),F=i({});function I(){let e=j.value;if(!e){P.value=null;return}P.value=$e(te,e,f.value);for(let e of P.value.sections)e.id in F||(F[e.id]=!e.flags.collapsed)}T(f,I);function re(e){return e.flags.emergency?`bg-red-1 text-red-10`:e.flags.dolist?`bg-blue-1 text-blue-10`:`bg-green-1 text-green-10`}let R=i({});function z(e){return`checklist.state.${e}`}function oe(){for(let e of Object.keys(R))delete R[e];let e=j.value;e&&Object.assign(R,D.load(z(e.immatriculation)))}function B(){let e=j.value;e&&D.save(z(e.immatriculation),{...R})}function ce(){B()}a(Ee,R),a(De,ce);function V(e){A.value=e,l.sessionStorage?.setItem(`checklist.input.planeIdent`,e),I(),oe()}let H=new Map;function le(e,t){t?H.set(e,t):H.delete(e)}function U(e){let t=document.querySelector(`.checklist-sticky-bar`);if(!t)return;let n=t.getBoundingClientRect().bottom,r=e.getBoundingClientRect().top+window.scrollY-n-8;window.scrollTo({top:r,behavior:`smooth`})}function W(e){F[e]=!0,g(()=>{let t=H.get(e)?.$el;t&&U(t)})}let G=s(null);function de(){G.value&&U(G.value)}function pe(){if(P.value)for(let e of P.value.sections)e.flags.emergency||(F[e.id]=!1)}function ge(e){let t=[],n=e=>{for(let r of e)if(t.push(r.id),r instanceof Z)for(let e of r.branches)n(e.items)};return n(e.items),t}function ve(e){for(let t of ge(e))delete R[t];B()}function J(){p(u(`confirmClearAllChecklistMessage`)).onOk(()=>{for(let e of Object.keys(R))delete R[e];B()})}return d(()=>{let e=l.sessionStorage.getItem(`checklist.input.planeIdent`),t=e&&q[e]?e:k.value[0]?.value??``;t&&V(t)}),(e,t)=>(m(),o(fe,{padding:``,class:`col`},{default:w(()=>[y(`div`,et,[C(ie,{flat:``,bordered:``,class:`q-pa-sm checklist-sticky-bar`,style:ee({top:`${v.value}px`})},{default:w(()=>[y(`div`,tt,[C(ue,{class:`col-12 col-sm`,modelValue:A.value,"onUpdate:modelValue":[t[0]||=e=>A.value=e,V],label:e.$t(`checklistPlaneLabel`),hint:e.$t(`checklistPlaneHint`),options:k.value,"emit-value":``,"map-options":``},null,8,[`modelValue`,`label`,`hint`,`options`]),y(`div`,{class:O([`col-auto text-weight-bold`,h.value?`text-body1`:`text-h6`])},E(M.value),3),h.value?(m(),o(_e,{key:0})):_(``,!0),P.value&&P.value.emergencySections().length?(m(),o(L,{key:1,flat:``,dense:``,icon:`warning`,color:`negative`,label:h.value?void 0:e.$t(`checklistEmergencyJumpLabel`),round:h.value,"aria-label":e.$t(`checklistEmergencyJumpLabel`),onClick:de},null,8,[`label`,`round`,`aria-label`])):_(``,!0),P.value?(m(),o(L,{key:2,flat:``,dense:``,icon:`unfold_less`,label:h.value?void 0:e.$t(`checklistCollapseAllLabel`),round:h.value,"aria-label":e.$t(`checklistCollapseAllLabel`),onClick:pe},null,8,[`label`,`round`,`aria-label`])):_(``,!0),P.value?(m(),o(L,{key:3,flat:``,dense:``,icon:`delete_sweep`,label:h.value?void 0:e.$t(`checklistClearAllLabel`),round:h.value,"aria-label":e.$t(`checklistClearAllLabel`),onClick:J},null,8,[`label`,`round`,`aria-label`])):_(``,!0)])]),_:1},8,[`style`]),P.value&&P.value.emergencySections().length?(m(),b(`div`,{key:0,ref_key:`emergencyPanelRef`,ref:G},[y(`span`,nt,E(e.$t(`checklistEmergencyJumpLabel`)),1),y(`div`,rt,[(m(!0),b(n,null,x(P.value.emergencySections(),e=>(m(),o(L,{key:e.id,outline:``,dense:``,"no-caps":``,color:`negative`,label:e.title,onClick:t=>W(e.id)},null,8,[`label`,`onClick`]))),128))])],512)):_(``,!0),P.value?(m(),b(`div`,it,[(m(!0),b(n,null,x(P.value.sections,t=>(m(),o(xe,{key:t.id,ref_for:!0,ref:e=>le(t.id,e),"model-value":F[t.id]??!1,"onUpdate:modelValue":e=>F[t.id]=e,"header-class":re(t)},{header:w(()=>[C(K,null,{default:w(()=>[S(E(t.title),1)]),_:2},1024),C(K,{side:``},{default:w(()=>[C(L,{flat:``,dense:``,round:``,icon:`clear`,"aria-label":e.$t(`checklistClearSectionLabel`),onClick:ne(e=>ve(t),[`stop`])},null,8,[`aria-label`,`onClick`])]),_:2},1024)]),default:w(()=>[C(ie,null,{default:w(()=>[C(ae,null,{default:w(()=>[C(Qe,{items:t.items},null,8,[`items`])]),_:2},1024)]),_:2},1024)]),_:2},1032,[`model-value`,`onUpdate:modelValue`,`header-class`]))),128))])):(m(),b(`div`,at,E(e.$t(`checklistNoPlaneSelected`)),1))])]),_:1}))}}),[[`__scopeId`,`data-v-b5ac4ce4`]]);export{ot as default};