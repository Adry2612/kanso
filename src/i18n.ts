import { getRequestConfig } from "next-intl/server";

const locales = ["es", "en"];
const defaultLocale = "es";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
