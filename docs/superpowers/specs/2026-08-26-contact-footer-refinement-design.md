# Contact Footer Refinement

## Goal

Reduce the nested-glass appearance in the Contact section and improve the visual hierarchy of its external links while preserving the site's diffused-glass direction.

## Approved direction

Use direction B: a single horizontal glass footer.

## Layout

- Keep the Contact section itself as the only large frosted-glass surface.
- Remove card backgrounds, borders, shadows, and backdrop filters from the terminal information and link group inside it.
- Arrange the heading and short availability copy on the left.
- Place the compact profile identity on the right side of the top row.
- Place the external links in a shared row below the copy.
- On narrow screens, stack the top-row content and allow the links to wrap naturally.

## Content

- Keep the heading `Connect`.
- Shorten the status copy to `Available for thoughtful digital quests.`
- Keep `guest@atomsh4 /profile` as the compact identity line.
- Keep the existing destinations for GitHub, Cnblogs, and GitHub Pages.

## Link styling

- Render each external link as a compact rounded glass pill rather than a large nested card.
- Use a subtle translucent fill, one-pixel highlight border, and soft shadow.
- Add an external-link arrow to each label.
- Hover and keyboard focus may lift the pill slightly and strengthen its highlight without lateral movement.

## Constraints

- Do not add new JavaScript.
- Preserve accessible link labels and visible keyboard focus.
- Preserve the existing responsive breakpoints and reduced-motion behavior.
- Limit changes to the Contact markup, its CSS rules, and targeted verification coverage.

## Verification

- The Contact section has one large glass surface, with no nested panel styling on its internal groups.
- All three existing links remain present and functional.
- The layout stacks cleanly at the existing tablet and mobile breakpoints.
- Existing site verification and JavaScript syntax checks continue to pass.
