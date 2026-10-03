/**
 * Copyright (c) 2026 Thomas Calmant
 * All rights reserved.
 *
 * Tests for adapters/data/checklistXmlSource.ts
 */

import { describe, expect, it } from 'vitest'

import { ChecklistXmlSource } from '../../../src/adapters/data/checklistXmlSource'

describe('ChecklistXmlSource', () => {
  const tiers = {
    'model/DR400 120.xml': '<checklist id="model">neutral</checklist>',
    'model/DR400 120.fr-FR.xml': '<checklist id="model">french</checklist>',
    'plane/F-TEST.xml': '<checklist id="plane">plane</checklist>',
  }
  const source = new ChecklistXmlSource(tiers)

  it('serves the club tiers from the vault content, locale first', () => {
    expect(source.getRawXml('model', 'DR400 120', 'fr-FR')).toContain('french')
    expect(source.getRawXml('model', 'DR400 120', 'en-US')).toContain('neutral')
    expect(source.getRawXml('plane', 'F-TEST', 'en-US')).toContain('plane')
  })

  it('has no club data while the vault is locked', () => {
    const locked = new ChecklistXmlSource()
    expect(locked.getRawXml('model', 'DR400 120', 'fr-FR')).toBeUndefined()
    expect(locked.getRawXml('plane', 'F-TEST', 'fr-FR')).toBeUndefined()
  })

  it('always serves the public general fallback, locked or not', () => {
    expect(new ChecklistXmlSource().getRawXml('general', 'general', 'fr-FR')).toContain(
      '<checklist',
    )
    expect(source.getRawXml('general', 'general', 'en-US')).toContain('<checklist')
  })

  it('does not look the club tiers up in the public bundle', () => {
    expect(new ChecklistXmlSource().getRawXml('model', 'DR400 135 CDI', 'fr-FR')).toBeUndefined()
  })
})
