import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import HelpLayout from "@/features/help/components/HelpLayout";
import ResolutionBlock from "@/features/help/components/ResolutionBlock";
import { isValidHelpTopic } from "@/features/help/help.content";
import Breadcrumb from "@/ui/Breadcrumb/Breadcrumb";

type Props = {
  params: Promise<{ locale: string; category: string; topic: string }>;
  searchParams?: Promise<{ orderId?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, topic } = await params;
  if (!isValidHelpTopic(category, topic)) {
    return { title: "Not found", robots: { index: false, follow: false } };
  }
  const t = await getTranslations({ locale, namespace: "help" });
  const seo = t.raw(`topics.${category}.${topic}.seo`) as { title: string; description: string };
  const canonical = `https://www.hipermercadosuperior.com${locale === "es" ? "" : "/en"}/help/${category}/${topic}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical,
      languages: {
        es: `https://www.hipermercadosuperior.com/help/${category}/${topic}`,
        en: `https://www.hipermercadosuperior.com/en/help/${category}/${topic}`,
      },
    },
  };
}

export default async function HelpTopicPage({ params, searchParams }: Props) {
  const { locale, category, topic } = await params;
  if (!isValidHelpTopic(category, topic)) notFound();

  const orderId = searchParams ? (await searchParams).orderId : undefined;

  const t = await getTranslations({ locale, namespace: "help" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const title = t(`topics.${category}.${topic}.title`);
  const intro = t(`topics.${category}.${topic}.intro`);
  const steps = t.raw(`topics.${category}.${topic}.steps`) as string[];
  const note = t(`topics.${category}.${topic}.note`);
  const related = t(`topics.${category}.${topic}.related`);
  const catName = t(`categories.${category}`);

  return (
    <>
      <div className="help-breadcrumb-wrap">
        <Breadcrumb
          items={[
            { label: tCommon("breadcrumb.home"), to: "/" },
            { label: t("breadcrumb.help_center"), to: "/help" },
            { label: catName, to: `/help/${category}` },
            { label: title },
          ]}
        />
      </div>
      <HelpLayout title={title}>
        <div className="help-article">
          <p className="help-article-intro">{intro}</p>

          <ol className="help-steps">
            {steps.map((step, idx) => (
              <li key={idx}>
                <span className="help-step-num">{idx + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="help-note">{note}</div>

          <p className="help-related">{related}</p>

          {/* Quick actions */}
          <div className="help-contact-cta">
            <p>{t("resolution.contact_hint")}</p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href={
                  orderId
                    ? `/contact?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}&orderId=${encodeURIComponent(orderId)}`
                    : `/contact?category=${encodeURIComponent(category)}&topic=${encodeURIComponent(topic)}`
                }
                className="help-pill"
              >
                {t("actions.contact")}
              </Link>
              {category === "orders" && (
                <Link href="/orders" className="help-pill help-pill-secondary">
                  {t("actions.view_orders")}
                </Link>
              )}
            </div>
          </div>

          <ResolutionBlock category={category} topic={topic} orderId={orderId} />

          <div style={{ marginTop: "20px", textAlign: "center", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/help/${category}`} className="help-pill help-pill-secondary">
              {t("actions.back_to_category", { category: catName })}
            </Link>
            <Link href="/help" className="help-pill help-pill-secondary">
              {t("actions.back_to_help")}
            </Link>
          </div>
        </div>
      </HelpLayout>
    </>
  );
}
