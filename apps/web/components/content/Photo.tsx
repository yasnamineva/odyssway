import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { photos, type PhotoKey } from "../../lib/photos";

/**
 * A real photograph with a quiet photographer credit. `hero` is the wide
 * banner under a page's H1 (loaded eagerly — it's usually the LCP element);
 * the default is an inline photo inside the text.
 */
export default async function Photo({ name, hero = false }: { name: PhotoKey; hero?: boolean }) {
  const t = await getTranslations("photos");
  const photo: { width: number; height: number; author: string | null; page: string } = photos[name];
  return (
    <figure className={hero ? "mt-5" : "my-8"}>
      <Image
        src={`/images/photos/${name}.jpg`}
        width={photo.width}
        height={photo.height}
        alt={t(`${name}`)}
        priority={hero}
        sizes="(min-width: 768px) 768px, 100vw"
        className={`w-full rounded-2xl object-cover ${hero ? "aspect-[16/9] sm:aspect-[2/1]" : "aspect-[16/9]"}`}
      />
      <figcaption className="mt-1.5 text-right text-[11px] text-slate-500">
        <a href={photo.page} rel="noopener noreferrer" target="_blank" className="hover:text-slate-700">
          {photo.author ? t("credit", { author: photo.author }) : t("creditAnonymous")}
        </a>
      </figcaption>
    </figure>
  );
}
