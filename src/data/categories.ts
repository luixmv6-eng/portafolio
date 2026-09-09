/**
 * Categorias de proyecto. Es la unica fuente de verdad para el desplegable de
 * la navbar, los filtros de la seccion de proyectos y los enlaces profundos:
 * el `hash` de cada una es la URL que comparte y restaura el filtro.
 */

export type ProjectCategory = 'photo' | '3d' | 'design' | 'web';
export type CategoryFilter = ProjectCategory | 'all';

export interface CategoryDef {
  id: ProjectCategory;
  /** Fragmento de URL, sin '#'. */
  hash: string;
  labelKey: string;
}

export const PROJECT_CATEGORIES: CategoryDef[] = [
  { id: 'photo', hash: 'proyectos-fotografia', labelKey: 'projects.categories.photo' },
  { id: '3d', hash: 'proyectos-3d', labelKey: 'projects.categories.3d' },
  { id: 'design', hash: 'proyectos-diseno', labelKey: 'projects.categories.design' },
  { id: 'web', hash: 'proyectos-web', labelKey: 'projects.categories.web' },
];

export const ALL_CATEGORY_HASH = 'projects';

/** Evento con el que la navbar le pide a la seccion de proyectos un filtro. */
export const PROJECT_CATEGORY_EVENT = 'projectCategoryChange';

export const categoryHref = (category: CategoryFilter) =>
  category === 'all'
    ? `#${ALL_CATEGORY_HASH}`
    : `#${PROJECT_CATEGORIES.find((c) => c.id === category)!.hash}`;

/** Traduce el hash actual a un filtro. Devuelve null si no habla de proyectos. */
export function categoryFromHash(rawHash: string): CategoryFilter | null {
  const hash = rawHash.replace(/^#/, '');
  if (!hash) return null;
  if (hash === ALL_CATEGORY_HASH) return 'all';
  return PROJECT_CATEGORIES.find((c) => c.hash === hash)?.id ?? null;
}

/**
 * Lenis toma el control del scroll, asi que un salto nativo por ancla llegaria
 * de golpe. Si esta montado le pedimos el desplazamiento a el; si no, al DOM.
 */
export function scrollToProjects() {
  const el = document.getElementById('projects');
  if (!el) return;
  const lenis = typeof window !== 'undefined' ? window.__lenis : undefined;
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.2 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Avisa a la seccion de proyectos de que hay que traer al usuario hasta ella.
 * El filtro en si lo cambia el hash del enlace, pero volver a pulsar la
 * categoria activa no dispara `hashchange` y aun asi hay que desplazarse.
 */
export function requestProjectCategory(category: CategoryFilter) {
  window.dispatchEvent(
    new CustomEvent(PROJECT_CATEGORY_EVENT, { detail: { category } })
  );
}
