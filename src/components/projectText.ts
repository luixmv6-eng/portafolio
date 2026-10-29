import projectsData from '../data/projects.json';
import { PROJECT_CATEGORIES } from '../data/categories';

export type Project = (typeof projectsData)[number];
export type Media = string | { type: string; src: string };

/** Portada + galeria sin repetir la portada. */
export function projectMedia(project: Project): Media[] {
  const gallery = (project.gallery ?? []) as Media[];
  return [project.image, ...gallery.filter((m) => m !== project.image)];
}

export const projectImages = (project: Project) =>
  projectMedia(project).filter((m): m is string => typeof m === 'string');

/** Textos traducidos de un proyecto. t() devuelve la clave cuando no hay
 *  traduccion, asi que se compara contra ella para caer al dato original. */
export function projectText(t: (key: string) => string) {
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  return {
    kicker: (p: Project) =>
      tr(
        `projects.items.${p.id}.category`,
        t(PROJECT_CATEGORIES.find((c) => c.id === p.category)?.labelKey ?? p.category)
      ),
    description: (p: Project) => tr(`projects.items.${p.id}.description`, p.description),
  };
}

/** Dominio real del proyecto para la barra del navegador. */
export const projectUrl = (p: Project) => {
  if (p.live) {
    try {
      return new URL(p.live).host.replace(/^www\./, '');
    } catch {
      /* cae al slug */
    }
  }
  return `/proyectos/${p.id.replace(/_/g, '-')}`;
};
