/*
 *   Copyright (c) 2026 Thomas Calmant
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

export type ChecklistItem = ChecklistRow | ChecklistChoice | ChecklistInfo

/** A single checkable action. */
export class ChecklistRow {
  readonly id: string
  readonly text: string
  readonly note: string | null

  constructor(id: string, text: string, note: string | null) {
    this.id = id
    this.text = text
    this.note = note
  }
}

/** A non-checkable reference note (warnings, reference speeds, etc.). */
export class ChecklistInfo {
  readonly id: string
  readonly text: string
  readonly note: string | null

  constructor(id: string, text: string, note: string | null) {
    this.id = id
    this.text = text
    this.note = note
  }
}

/** One named branch of a {@link ChecklistChoice}. */
export class ChecklistBranch {
  readonly id: string
  readonly label: string
  readonly items: ChecklistItem[]

  constructor(id: string, label: string, items: ChecklistItem[]) {
    this.id = id
    this.label = label
    this.items = items
  }
}

/** An N-way conditional: the user picks one branch, whose items are then shown. */
export class ChecklistChoice {
  readonly id: string
  readonly prompt: string
  readonly branches: ChecklistBranch[]

  constructor(id: string, prompt: string, branches: ChecklistBranch[]) {
    this.id = id
    this.prompt = prompt
    this.branches = branches
  }
}

// Boolean section attributes that only ever accumulate (OR) across tiers:
// once a tier flags a section, a later tier re-declaring it without the
// attribute must not silently un-flag it. `collapsed` is the odd one out
// (it's about the initial UI state, not really "sticky" semantically), but
// treating it the same way is harmless and keeps the merge fully generic.
// Adding a new sticky flag is a one-line change here - nowhere else.
const STICKY_FLAGS = ['emergency', 'collapsed', 'dolist'] as const
type StickyFlag = (typeof STICKY_FLAGS)[number]
type StickyFlags = Readonly<Record<StickyFlag, boolean>>

function parseStickyFlags(element: Element): StickyFlags {
  const flags = {} as Record<StickyFlag, boolean>
  for (const flag of STICKY_FLAGS) {
    flags[flag] = element.getAttribute(flag) === 'true'
  }
  return flags
}

function mergeStickyFlags(base: StickyFlags, override: StickyFlags): StickyFlags {
  const flags = {} as Record<StickyFlag, boolean>
  for (const flag of STICKY_FLAGS) {
    flags[flag] = base[flag] || override[flag]
  }
  return flags
}

export class ChecklistSection {
  readonly id: string
  readonly title: string
  // emergency: shown with red styling and reachable via quick-jump buttons.
  // collapsed: closed by default in the UI.
  // dolist: a "do-list" (read-and-do, e.g. a walkaround or a flow performed
  //   from memory) as opposed to a "checklist" (read-and-confirm), shown
  //   with different header styling. Independent from `collapsed`: a
  //   do-list can still be open by default (e.g. the pre-flight walkaround).
  readonly flags: StickyFlags
  readonly items: ChecklistItem[]

  constructor(id: string, title: string, flags: StickyFlags, items: ChecklistItem[]) {
    this.id = id
    this.title = title
    this.flags = flags
    this.items = items
  }
}

function requireAttr(element: Element, name: string): string {
  const value = element.getAttribute(name)
  if (!value) {
    throw new Error(`<${element.tagName}> element is missing a "${name}" attribute`)
  }
  return value
}

function childrenByTag(element: Element, tagName: string): Element[] {
  return Array.from(element.children).filter((el) => el.tagName === tagName)
}

function parseItems(parent: Element): ChecklistItem[] {
  const items: ChecklistItem[] = []
  for (const child of Array.from(parent.children)) {
    switch (child.tagName) {
      case 'row':
        items.push(parseRow(child))
        break
      case 'choice':
        items.push(parseChoice(child))
        break
      case 'info':
        items.push(parseInfo(child))
        break
    }
  }
  return items
}

function parseRow(element: Element): ChecklistRow {
  return new ChecklistRow(
    requireAttr(element, 'id'),
    element.textContent?.trim() ?? '',
    element.getAttribute('note'),
  )
}

function parseInfo(element: Element): ChecklistInfo {
  return new ChecklistInfo(
    requireAttr(element, 'id'),
    element.textContent?.trim() ?? '',
    element.getAttribute('note'),
  )
}

function parseBranch(element: Element): ChecklistBranch {
  return new ChecklistBranch(
    requireAttr(element, 'id'),
    element.getAttribute('label') ?? '',
    parseItems(element),
  )
}

function parseChoice(element: Element): ChecklistChoice {
  return new ChecklistChoice(
    requireAttr(element, 'id'),
    element.getAttribute('prompt') ?? '',
    childrenByTag(element, 'branch').map(parseBranch),
  )
}

function parseSection(element: Element): ChecklistSection {
  return new ChecklistSection(
    requireAttr(element, 'id'),
    element.getAttribute('title') ?? '',
    parseStickyFlags(element),
    parseItems(element),
  )
}

/** A single parsed `<checklist>` XML document, for one tier (general/model/plane). */
export class ChecklistDocument {
  readonly id: string
  readonly replace: boolean
  readonly sections: ChecklistSection[]

  constructor(xmlText: string) {
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
    const parserError = doc.getElementsByTagName('parsererror')[0]
    if (parserError) {
      throw new Error(`Invalid checklist XML: ${parserError.textContent}`)
    }

    const root = doc.documentElement
    if (root.tagName !== 'checklist') {
      throw new Error('Checklist XML must have a <checklist> root element')
    }

    this.id = root.getAttribute('id') ?? ''
    this.replace = root.getAttribute('replace') === 'true'
    this.sections = childrenByTag(root, 'section').map(parseSection)
  }
}

function mergeById<T extends { id: string }>(
  base: T[],
  overrides: T[],
  merge: (base: T, override: T) => T,
): T[] {
  const result = [...base]
  for (const override of overrides) {
    const idx = result.findIndex((item) => item.id === override.id)
    if (idx >= 0) {
      result[idx] = merge(result[idx] as T, override)
    } else {
      result.push(override)
    }
  }
  return result
}

function mergeItem(base: ChecklistItem, override: ChecklistItem): ChecklistItem {
  if (base instanceof ChecklistChoice && override instanceof ChecklistChoice) {
    return new ChecklistChoice(
      override.id,
      override.prompt || base.prompt,
      mergeById(base.branches, override.branches, mergeBranch),
    )
  }
  if (base instanceof ChecklistRow && override instanceof ChecklistRow) {
    return new ChecklistRow(override.id, override.text || base.text, override.note ?? base.note)
  }
  if (base instanceof ChecklistInfo && override instanceof ChecklistInfo) {
    return new ChecklistInfo(override.id, override.text || base.text, override.note ?? base.note)
  }
  // Same id, different item kind across tiers: the child tier's item wins outright.
  return override
}

function mergeBranch(base: ChecklistBranch, override: ChecklistBranch): ChecklistBranch {
  return new ChecklistBranch(
    override.id,
    override.label || base.label,
    mergeItemLists(base.items, override.items),
  )
}

function mergeItemLists(base: ChecklistItem[], overrides: ChecklistItem[]): ChecklistItem[] {
  return mergeById(base, overrides, mergeItem)
}

function mergeSection(base: ChecklistSection, override: ChecklistSection): ChecklistSection {
  return new ChecklistSection(
    override.id,
    override.title || base.title,
    mergeStickyFlags(base.flags, override.flags),
    mergeItemLists(base.items, override.items),
  )
}

function mergeSectionLists(
  base: ChecklistSection[],
  overrides: ChecklistSection[],
): ChecklistSection[] {
  return mergeById(base, overrides, mergeSection)
}

/** The final, tier-merged checklist for a plane. */
export class Checklist {
  readonly sections: ChecklistSection[]

  constructor(
    general: ChecklistDocument | null,
    model: ChecklistDocument | null,
    plane: ChecklistDocument | null,
  ) {
    if (plane?.replace) {
      this.sections = plane.sections
      return
    }

    // The general tier is only used as a whole-document fallback when
    // neither a model nor a plane tier exists for this plane - it never
    // merges underneath a model tier that does exist.
    if (model) {
      this.sections = plane ? mergeSectionLists(model.sections, plane.sections) : model.sections
      return
    }

    if (plane) {
      this.sections = plane.sections
      return
    }

    this.sections = general?.sections ?? []
  }

  findSection(id: string): ChecklistSection | undefined {
    return this.sections.find((section) => section.id === id)
  }

  emergencySections(): ChecklistSection[] {
    return this.sections.filter((section) => section.flags.emergency)
  }
}
