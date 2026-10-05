import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import BreadcrumbJsonLd from "../../components/BreadcrumbJsonLd";
import { SITE_URL } from "../../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("widgetPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/widget" },
  };
}

export default async function WidgetPage() {
  const t = await getTranslations("widgetPage");
  // The credit link sits in the host page's own HTML (not only inside the
  // iframe), so it is a real link from their site to ours.
  const snippet = `<iframe id="odyssway-calculator" src="${SITE_URL}/embed/calculator" title="Schengen 90/180 calculator" width="100%" height="1400" style="border:0;max-width:960px" loading="lazy"></iframe>
<p style="font-size:12px">Schengen 90/180 calculator by <a href="${SITE_URL}/calculator">Odyssway</a></p>
<script>window.addEventListener("message",function(e){if(e.origin==="${SITE_URL}"&&e.data&&e.data.type==="odyssway:height"){var f=document.getElementById("odyssway-calculator");if(f)f.style.height=e.data.height+"px";}});</script>`;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbJsonLd trail={[{ name: t("h1"), path: "/widget" }]} />
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{t("h1")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("intro")}</p>
      </header>
      <section>
        <h2 className="text-base font-semibold text-slate-900">{t("snippetTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("snippetHelp")}</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-white">
          <code>{snippet}</code>
        </pre>
      </section>
      <section className="text-sm leading-relaxed text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">{t("termsTitle")}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t("termFree")}</li>
          <li>{t("termCredit")}</li>
          <li>{t("termPrivacy")}</li>
          <li>{t("termUpdates")}</li>
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold text-slate-900">{t("previewTitle")}</h2>
        <iframe
          src="/embed/calculator"
          title="Schengen 90/180 calculator preview"
          className="mt-3 h-[1400px] w-full rounded-xl border border-slate-200 bg-white"
          loading="lazy"
        />
      </section>
    </article>
  );
}
