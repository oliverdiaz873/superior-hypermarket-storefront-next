/**
 * Resuelve la URL completa de un asset en Next.js.
 * En Next.js los estáticos se sirven desde la carpeta `public/`.
 * Nuestra carpeta de imágenes está en `public/assets/`.
 */
export const getAssetUrl = (path: string) => {
    if (!path) return '';

    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('/uploads/')) {
        return path;
    }

    let normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!normalizedPath.startsWith('/assets/')) {
        normalizedPath = `/assets${normalizedPath}`;
    }

    return normalizedPath;
}
