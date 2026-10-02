/*
 *   Copyright (c) 2026 Thomas Calmant
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

/** Page chrome added by the SIA on each page: not content */
const PAGE_CHROME = [/^Page \d+\s*\/\s*\d+(\s+(FR|EN))?$/, /^© SIA$/, /^FR$/, /^EN$/]

/**
 * Turns the text items of a page into lines.
 */
function pageToLines(items: readonly unknown[]): string[] {
  const lines: string[] = []
  let current = ''
  for (const item of items) {
    // Marked content items have no "str"
    if (!('str' in (item as object))) {
      continue
    }
    const textItem = item as TextItem
    current += textItem.str
    if (textItem.hasEOL) {
      lines.push(current.trim())
      current = ''
    }
  }
  if (current.trim().length > 0) {
    lines.push(current.trim())
  }
  return lines
}

/**
 * Removes page numbers and the header repeated on each page: they would cut
 * in the middle of the content spanning two pages (e.g. a list of coordinates).
 *
 * @param pages Lines of each page
 */
export function removePageChrome(pages: string[][]): string[][] {
  let repeated = new Set<string>()
  if (pages.length > 2) {
    // A line found on every page is a header or a footer
    const [first, ...others] = pages.map((lines) => new Set(lines))
    repeated = new Set([...first!].filter((line) => others.every((page) => page.has(line))))
  }

  return pages.map((lines) =>
    lines.filter((line) => !repeated.has(line) && !PAGE_CHROME.some((re) => re.test(line))),
  )
}

/**
 * Extracts the text of a PDF file, in the browser.
 *
 * pdf.js and its worker are loaded on demand, as they are heavy and only
 * needed when a PDF is actually opened.
 *
 * @param data Content of the PDF file
 * @returns The text of the document, one line per text line
 */
export async function extractPdfText(data: ArrayBuffer): Promise<string> {
  // Legacy build: it also supports the older browsers targeted by the app
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const task = pdfjs.getDocument({ data: new Uint8Array(data) })
  try {
    const doc = await task.promise
    const pages: string[][] = []
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum)
      const content = await page.getTextContent()
      pages.push(pageToLines(content.items))
    }
    return removePageChrome(pages)
      .map((lines) => lines.join('\n'))
      .join('\n')
  } finally {
    await task.destroy()
  }
}
