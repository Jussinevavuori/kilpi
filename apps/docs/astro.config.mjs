// @ts-check
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const POSTHOG_SCRIPT_TAG_CONTENT = `
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('phc_dW98JhlU81kc2w4uzWSSS2OGR12Jf0HLVmVgj2aEbH6', { api_host: 'https://eu.i.posthog.com', person_profiles: 'always' })
`;

// https://astro.build/config
export default defineConfig({
  site: "https://kilpi.vercel.app",

  integrations: [
    /**
     * Starlight integration for documentation
     */
    starlight({
      // Customize site
      favicon: "turtle-emoji.png",
      title: "Kilpi",
      tagline: "The modern authorization framework for TypeScript",
      description:
        "Kilpi is an modern open-source authorization framework for TypeScript applications.",
      logo: { src: "./public/logo.png", alt: "Kilpi logo", replacesTitle: true },
      social: {
        github: "https://github.com/jussinevavuori/kilpi",
        blueSky: "https://bsky.app/profile/jussinevavuori.com",
      },
      editLink: { baseUrl: "https://github.com/Jussinevavuori/kilpi/edit/main/apps/docs" },
      customCss: ["./src/styles/global.css"],
      defaultLocale: "en",

      /**
       * Configure sidebar
       */
      sidebar: [
        { label: "Getting started", autogenerate: { directory: "getting-started" } },
        { label: "Installation", autogenerate: { directory: "installation" } },
        { label: "Concepts", autogenerate: { directory: "concepts" } },
        { label: "Guides", autogenerate: { directory: "guides" } },
        { label: "Reference", autogenerate: { directory: "reference" } },
        { label: "Plugins", autogenerate: { directory: "plugins" } },
        { label: "Advanced", autogenerate: { directory: "advanced" } },
      ],

      /**
       * Custom head
       */
      head: [
        // Posthog analytics
        {
          tag: "script",
          attrs: { id: "posthog" },
          content: POSTHOG_SCRIPT_TAG_CONTENT,
        },

        // OG tags
        {
          tag: "meta",
          attrs: {
            property: "og:title",
            content: "Kilpi - The modern authorization framework for TypeScript",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:site_name",
            content: "Kilpi - The modern authorization framework for TypeScript",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "/og-image.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:url",
            content: "https://kilpi.vercel.app/",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:type",
            content: "website",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:description",
            content:
              "Kilpi is an modern open-source authorization framework for TypeScript applications.",
          },
        },
      ],
    }),
        
    /**
     * Enable React
     */
    react(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});