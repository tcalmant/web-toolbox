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
/**
 * Sanity checks on the checklist XML files shipped in src/fixed-data/checklists.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { ChecklistXmlSource } from '../../../src/adapters/data/checklistXmlSource'
import { buildAirplanes } from '../../../src/adapters/data/airplanesRepository'
import { resolveChecklistForPlane } from '../../../src/domain/checklistResolver'
import {
  ChecklistChoice,
  ChecklistDocument,
  type ChecklistItem,
} from '../../../src/domain/checklist'

// The club data is shipped encrypted: these checks run on the plaintext sources
// in private/acd/ (git-ignored), and are skipped where they are not available
const PRIVATE_DIR = join(__dirname, '../../../private/acd')
const ROOT = join(PRIVATE_DIR, 'checklists')
const HAS_SOURCES = existsSync(join(PRIVATE_DIR, 'planes.json')) && existsSync(ROOT)

function xmlFiles(): string[] {
  if (!HAS_SOURCES) return []
  return readdirSync(ROOT, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.xml'))
    .sort()
}

function collectIds(items: ChecklistItem[], ids: string[]): void {
  for (const item of items) {
    ids.push(item.id)
    if (item instanceof ChecklistChoice) {
      for (const branch of item.branches) {
        // Branch ids only need to be unique within their choice
        collectIds(branch.items, ids)
      }
    }
  }
}

describe.skipIf(!HAS_SOURCES)('bundled checklists', () => {
  const files = xmlFiles()

  it('finds the bundled files', () => {
    expect(files.length).toBeGreaterThan(1)
  })

  for (const file of files) {
    describe(file, () => {
      const doc = new ChecklistDocument(readFileSync(join(ROOT, file), 'utf8'))

      it('has unique section and item ids', () => {
        const ids = doc.sections.map((s) => s.id)
        for (const section of doc.sections) {
          collectIds(section.items, ids)
        }
        const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
        expect(duplicates).toEqual([])
      })

      it('has no empty section', () => {
        for (const section of doc.sections) {
          expect(section.items.length, section.id).toBeGreaterThan(0)
        }
      })
    })
  }
})

describe.skipIf(!HAS_SOURCES)('club planes', () => {
  const tiers: Record<string, string> = {}
  for (const file of xmlFiles()) {
    tiers[file] = readFileSync(join(ROOT, file), 'utf8')
  }
  const source = new ChecklistXmlSource(tiers)
  const planes = HAS_SOURCES
    ? buildAirplanes(JSON.parse(readFileSync(join(PRIVATE_DIR, 'planes.json'), 'utf8')))
    : {}
  const withModelFile = Object.values(planes).filter((plane) =>
    xmlFiles().includes(join('model', `${plane.model}.xml`)),
  )

  it('has at least one plane with a model checklist', () => {
    expect(withModelFile.length).toBeGreaterThan(0)
  })

  for (const plane of withModelFile) {
    it(`resolves a usable checklist for ${plane.immatriculation}`, () => {
      const checklist = resolveChecklistForPlane(source, plane, 'fr-FR')
      expect(checklist.sections.length).toBeGreaterThanOrEqual(3)
      // Club check-lists have checklist-* sections, constructor-manual ones a pre-flight do-list
      expect(
        checklist.sections.some((s) => s.id.startsWith('checklist-') || s.id === 'preflight'),
      ).toBe(true)
    })
  }

  // Plane-tier files (checklists/plane/<tail>.xml) add sections to the model checklists of one aircraft
  const planeFiles = xmlFiles().filter((f) => f.startsWith('plane/'))

  for (const file of planeFiles) {
    const tail = file.slice('plane/'.length, -'.xml'.length)

    it(`merges the plane file of ${tail} onto its model checklists, for that aircraft only`, () => {
      const plane = planes[tail]
      expect(plane, `no aircraft ${tail}`).toBeDefined()
      if (!plane) return
      const own = new ChecklistDocument(tiers[file] ?? '').sections.map((s) => s.id)
      const merged = resolveChecklistForPlane(source, plane, 'fr-FR').sections.map((s) => s.id)
      // The plane sections are added, the model ones are kept
      for (const id of own) {
        expect(merged, id).toContain(id)
      }
      const modelIds = new ChecklistDocument(
        tiers[join('model', `${plane.model}.xml`)] ?? '',
      ).sections.map((s) => s.id)
      for (const id of modelIds) {
        expect(merged, id).toContain(id)
      }

      // Another aircraft of the same model does not get the plane sections
      const sibling = Object.values(planes).find(
        (p) => p.model === plane.model && p.immatriculation !== tail,
      )
      if (sibling) {
        const siblingIds = resolveChecklistForPlane(source, sibling, 'fr-FR').sections.map(
          (s) => s.id,
        )
        const onlyOwn = own.filter((id) => !modelIds.includes(id))
        for (const id of onlyOwn) {
          expect(siblingIds, id).not.toContain(id)
        }
      }
    })
  }
})
