## 2025-05-20 - Palette UX Check
**Learning:** The copy-pasting of HTML structures accidentally duplicated `aria-label="החלפת מצב תצוגה"` (Toggle Theme) across dozens of unrelated elements including main navigation, breadcrumbs, forms, and footer links. This significantly harms screen reader users in Hebrew by giving them completely incorrect context.
**Action:** Replaced all duplicate aria-labels with semantically correct ones in Hebrew: `ניווט ראשי`, `ניווט פירורי לחם`, `טופס יצירת קשר`, etc., ensuring screen reader functionality matches the visual structure.
