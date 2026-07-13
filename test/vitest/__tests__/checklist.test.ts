/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Tests for domain/checklist.ts and domain/checklistResolver.ts
 */

import { describe, expect, it } from 'vitest'

import { AirPlane } from '../../../src/domain/airplanes'
import {
  Checklist,
  ChecklistChoice,
  ChecklistDocument,
  ChecklistInfo,
  ChecklistRow,
} from '../../../src/domain/checklist'
import { resolveChecklistForPlane } from '../../../src/domain/checklistResolver'
import type {
  ChecklistDocumentSource,
  ChecklistTier,
} from '../../../src/domain/ports/checklistDocumentSource'

describe('ChecklistDocument parsing', () => {
  it('parses sections, rows, notes, emergency, collapsed and dolist flags', () => {
    const xml = `
      <checklist id="general">
        <section id="preflight" title="Pre-flight" dolist="true">
          <row id="preflight.fuel" note="Full and free">Check fuel quantity</row>
        </section>
        <section id="dolist2" title="Do-list" collapsed="true" dolist="true">
          <row id="dolist.transponder">Transponder SET</row>
        </section>
        <section id="emergency" title="Engine fire" emergency="true">
          <row id="emergency.mixture">Mixture IDLE CUT-OFF</row>
        </section>
      </checklist>
    `
    const doc = new ChecklistDocument(xml)

    expect(doc.id).toEqual('general')
    expect(doc.replace).toBe(false)
    expect(doc.sections).toHaveLength(3)

    const preflight = doc.sections[0]!
    expect(preflight.title).toEqual('Pre-flight')
    expect(preflight.flags.collapsed).toBe(false)
    expect(preflight.flags.emergency).toBe(false)
    // A do-list can be open by default: dolist is independent from collapsed.
    expect(preflight.flags.dolist).toBe(true)
    expect(preflight.items).toHaveLength(1)
    expect(preflight.items[0]).toBeInstanceOf(ChecklistRow)
    const row = preflight.items[0] as ChecklistRow
    expect(row.id).toEqual('preflight.fuel')
    expect(row.text).toEqual('Check fuel quantity')
    expect(row.note).toEqual('Full and free')

    expect(doc.sections[1]!.flags.collapsed).toBe(true)
    expect(doc.sections[1]!.flags.dolist).toBe(true)
    expect(doc.sections[2]!.flags.emergency).toBe(true)
    expect(doc.sections[2]!.flags.dolist).toBe(false)
  })

  it('parses info items and N-way choices with nested branches', () => {
    const xml = `
      <checklist id="model">
        <section id="engine" title="Engine malfunction" emergency="true">
          <info id="engine.warning" note="Read carefully">Some non-actionable note</info>
          <choice id="engine.symptom" prompt="Which symptom?">
            <branch id="a" label="Light flashing">
              <row id="engine.a.button">Press TEST</row>
            </branch>
            <branch id="b" label="Both lights flashing">
              <row id="engine.b.button">Press TEST</row>
              <info id="engine.b.note">Power reading unreliable</info>
            </branch>
            <branch id="c" label="Abnormal behaviour">
              <row id="engine.c.speed">Reduce speed</row>
            </branch>
          </choice>
        </section>
      </checklist>
    `
    const doc = new ChecklistDocument(xml)
    const section = doc.sections[0]!
    expect(section.items).toHaveLength(2)

    const info = section.items[0] as ChecklistInfo
    expect(info).toBeInstanceOf(ChecklistInfo)
    expect(info.text).toEqual('Some non-actionable note')
    expect(info.note).toEqual('Read carefully')

    const choice = section.items[1] as ChecklistChoice
    expect(choice).toBeInstanceOf(ChecklistChoice)
    expect(choice.prompt).toEqual('Which symptom?')
    expect(choice.branches).toHaveLength(3)
    expect(choice.branches.map((b) => b.id)).toEqual(['a', 'b', 'c'])
    expect(choice.branches[1]!.items).toHaveLength(2)
  })

  it('throws on malformed XML', () => {
    expect(() => new ChecklistDocument('<checklist><unterminated>')).toThrowError()
  })

  it('throws when the root element is not <checklist>', () => {
    expect(() => new ChecklistDocument('<foo id="x"></foo>')).toThrowError(
      /must have a <checklist> root element/,
    )
  })
})

describe('Checklist tier merge', () => {
  const general = new ChecklistDocument(`
    <checklist id="general">
      <section id="preflight" title="Pre-flight">
        <row id="preflight.fuel" note="Check level">Check fuel</row>
        <row id="preflight.controls">Check controls</row>
      </section>
      <section id="emergency" title="Fire" emergency="true">
        <row id="emergency.mixture">Mixture OFF</row>
      </section>
    </checklist>
  `)

  it('returns the general tier unchanged when there is no model or plane tier', () => {
    const checklist = new Checklist(general, null, null)
    expect(checklist.sections).toHaveLength(2)
    expect(checklist.findSection('preflight')?.items).toHaveLength(2)
  })

  it('uses the model tier alone, ignoring the general tier entirely, when a model tier exists', () => {
    const model = new ChecklistDocument(`
      <checklist id="model">
        <section id="preflight" title="Pre-flight">
          <row id="preflight.fuel" note="min 2/4 tanks">Check fuel</row>
          <row id="preflight.canopy">Check canopy lock</row>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(general, model, null)
    const preflight = checklist.findSection('preflight')!
    // Only the model tier's own two rows: general's "preflight.controls" and
    // "emergency" section must NOT leak in, since general is only a fallback
    // for planes with no model (and no plane) tier at all.
    expect(preflight.items.map((i) => i.id)).toEqual(['preflight.fuel', 'preflight.canopy'])
    expect(checklist.findSection('emergency')).toBeUndefined()

    const fuelRow = preflight.items.find((i) => i.id === 'preflight.fuel') as ChecklistRow
    expect(fuelRow.note).toEqual('min 2/4 tanks')
  })

  it('lets the plane tier merge onto the model tier, without the general tier being involved', () => {
    const model = new ChecklistDocument(`
      <checklist id="model">
        <section id="preflight" title="Pre-flight">
          <row id="preflight.canopy">Check canopy lock</row>
        </section>
      </checklist>
    `)
    const plane = new ChecklistDocument(`
      <checklist id="plane">
        <section id="preflight" title="Pre-flight">
          <row id="preflight.canopy" note="Known sticky latch">Check canopy lock</row>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(general, model, plane)
    const preflight = checklist.findSection('preflight')!
    const canopyRow = preflight.items.find((i) => i.id === 'preflight.canopy') as ChecklistRow
    expect(canopyRow.note).toEqual('Known sticky latch')
    // The general tier is bypassed entirely since a model tier exists.
    expect(preflight.items.find((i) => i.id === 'preflight.fuel')).toBeUndefined()
    expect(checklist.findSection('emergency')).toBeUndefined()
  })

  it('falls back to the plane tier alone (bypassing general) when there is no model tier', () => {
    const plane = new ChecklistDocument(`
      <checklist id="plane">
        <section id="only" title="Plane-only section">
          <row id="only.row">Only row</row>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(general, null, plane)
    expect(checklist.sections).toHaveLength(1)
    expect(checklist.findSection('only')).toBeDefined()
    expect(checklist.findSection('preflight')).toBeUndefined()
  })

  it('lets a plane tier with replace="true" ignore general and model entirely', () => {
    const model = new ChecklistDocument(`
      <checklist id="model">
        <section id="preflight" title="Pre-flight">
          <row id="preflight.canopy">Check canopy lock</row>
        </section>
      </checklist>
    `)
    const plane = new ChecklistDocument(`
      <checklist id="plane" replace="true">
        <section id="only" title="Only section">
          <row id="only.row">Only row</row>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(general, model, plane)
    expect(checklist.sections).toHaveLength(1)
    expect(checklist.findSection('preflight')).toBeUndefined()
    expect(checklist.findSection('only')).toBeDefined()
  })

  it('merges a choice by branch id when the plane tier merges onto the model tier', () => {
    const model = new ChecklistDocument(`
      <checklist id="model">
        <section id="malfunction" title="Malfunction" emergency="true">
          <choice id="symptom" prompt="Which symptom?">
            <branch id="a" label="A">
              <row id="a.row1">Row A1</row>
            </branch>
            <branch id="b" label="B">
              <row id="b.row1">Row B1</row>
            </branch>
          </choice>
        </section>
      </checklist>
    `)
    const plane = new ChecklistDocument(`
      <checklist id="plane">
        <section id="malfunction" title="Malfunction">
          <choice id="symptom" prompt="Which symptom?">
            <branch id="a">
              <row id="a.row2">Row A2 (added by plane)</row>
            </branch>
            <branch id="c" label="C">
              <row id="c.row1">Row C1</row>
            </branch>
          </choice>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(null, model, plane)
    const section = checklist.findSection('malfunction')!
    const choice = section.items.find((i) => i.id === 'symptom') as ChecklistChoice
    expect(choice.branches.map((b) => b.id)).toEqual(['a', 'b', 'c'])

    const branchA = choice.branches.find((b) => b.id === 'a')!
    expect(branchA.items.map((i) => i.id)).toEqual(['a.row1', 'a.row2'])
    expect(branchA.label).toEqual('A') // Not overwritten since the plane's branch has no label.
  })

  it('accumulates the emergency flag between model and plane tiers without letting an override un-flag it', () => {
    const model = new ChecklistDocument(`
      <checklist id="model">
        <section id="emergency" title="Fire" emergency="true">
          <row id="emergency.mixture">Mixture OFF</row>
        </section>
      </checklist>
    `)
    const plane = new ChecklistDocument(`
      <checklist id="plane">
        <section id="emergency" title="Fire">
          <row id="emergency.extra">Extra action</row>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(null, model, plane)
    expect(checklist.findSection('emergency')?.flags.emergency).toBe(true)
  })

  it('exposes emergencySections() reflecting the merged result', () => {
    const checklist = new Checklist(general, null, null)
    expect(checklist.emergencySections().map((s) => s.id)).toEqual(['emergency'])
  })

  it('accumulates the dolist flag between model and plane tiers, independent of collapsed', () => {
    const model = new ChecklistDocument(`
      <checklist id="model">
        <section id="preflight" title="Walkaround" dolist="true">
          <row id="preflight.fuel">Check fuel</row>
        </section>
      </checklist>
    `)
    const plane = new ChecklistDocument(`
      <checklist id="plane">
        <section id="preflight" title="Walkaround">
          <row id="preflight.canopy">Check canopy</row>
        </section>
      </checklist>
    `)
    const checklist = new Checklist(null, model, plane)
    const preflight = checklist.findSection('preflight')!
    expect(preflight.flags.dolist).toBe(true)
    // A do-list section stays open (not collapsed) by default here - dolist
    // and collapsed are tracked independently.
    expect(preflight.flags.collapsed).toBe(false)
  })
})

class FakeChecklistDocumentSource implements ChecklistDocumentSource {
  constructor(private readonly files: Record<string, string>) {}

  getRawXml(tier: ChecklistTier, key: string, locale: string): string | undefined {
    const base = tier === 'general' ? 'general/general' : `${tier}/${key}`
    return this.files[`${base}.${locale}.xml`] ?? this.files[`${base}.xml`]
  }
}

describe('resolveChecklistForPlane', () => {
  const plane = new AirPlane('F-TEST', 'Robin', 'DR400 135 CDI', 'liters', 110, 109, 21)

  it('resolves and merges the correct tier files for the given plane and locale', () => {
    const source = new FakeChecklistDocumentSource({
      'general/general.en-US.xml': `
        <checklist id="general">
          <section id="preflight" title="Pre-flight"><row id="p.fuel">Check fuel</row></section>
        </checklist>
      `,
      'model/DR400 135 CDI.en-US.xml': `
        <checklist id="model">
          <section id="preflight" title="Pre-flight"><row id="p.canopy">Check canopy</row></section>
        </checklist>
      `,
    })

    const checklist = resolveChecklistForPlane(source, plane, 'en-US')
    const preflight = checklist.findSection('preflight')!
    // The model tier exists, so the general tier is bypassed entirely.
    expect(preflight.items.map((i) => i.id)).toEqual(['p.canopy'])
  })

  it('falls back from {key}.{locale}.xml to {key}.xml when the locale file is absent', () => {
    const source = new FakeChecklistDocumentSource({
      'general/general.xml': `
        <checklist id="general">
          <section id="preflight" title="Pre-flight"><row id="p.fuel">Check fuel</row></section>
        </checklist>
      `,
      'model/DR400 135 CDI.xml': `
        <checklist id="model">
          <section id="preflight" title="Pre-flight"><row id="p.canopy">Check canopy</row></section>
        </checklist>
      `,
    })

    // No "*.fr-FR.xml" variant exists anywhere: both tiers must fall back to the
    // locale-neutral file.
    const checklist = resolveChecklistForPlane(source, plane, 'fr-FR')
    const preflight = checklist.findSection('preflight')!
    // The model tier exists (via the locale-neutral fallback), so general is bypassed.
    expect(preflight.items.map((i) => i.id)).toEqual(['p.canopy'])
  })

  it('returns an empty checklist when no tier file matches at all', () => {
    const source = new FakeChecklistDocumentSource({})
    const checklist = resolveChecklistForPlane(source, plane, 'en-US')
    expect(checklist.sections).toHaveLength(0)
  })
})
