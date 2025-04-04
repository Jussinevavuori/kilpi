import Aside from "@/components/mdx/Aside.astro";
import Blockquote from "@/components/mdx/Blockquote.astro";
import Code from "@/components/mdx/Code.astro";
import FileTree from "@/components/mdx/FileTree.astro";
import Heading1 from "@/components/mdx/Heading1.astro";
import Heading2 from "@/components/mdx/Heading2.astro";
import Heading3 from "@/components/mdx/Heading3.astro";
import Heading4 from "@/components/mdx/Heading4.astro";
import Heading5 from "@/components/mdx/Heading5.astro";
import Heading6 from "@/components/mdx/Heading6.astro";
import Link from "@/components/mdx/Link.astro";
import LinkCard from "@/components/mdx/LinkCard.astro";
import ListItem from "@/components/mdx/ListItem.astro";
import OrderedList from "@/components/mdx/OrderedList.astro";
import Paragraph from "@/components/mdx/Paragraph.astro";
import Step from "@/components/mdx/Step.astro";
import Steps from "@/components/mdx/Steps.astro";
import Tab from "@/components/mdx/Tab.astro";
import Tabs from "@/components/mdx/Tabs.astro";
import UnorderedList from "@/components/mdx/UnorderedList.astro";
import Collapsible from "./Collapsible.astro";
import GenerateSecretButton from "./GenerateSecretButton.astro";
import Hr from "./Hr.astro";

/**
 * All custom components to use in MDX files.
 */
export const components = {
  // HTML Elements
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  h5: Heading5,
  h6: Heading6,
  p: Paragraph,
  hr: Hr,
  a: Link,
  code: Code,
  li: ListItem,
  ol: OrderedList,
  ul: UnorderedList,
  blockquote: Blockquote,

  // Custom elements
  Tab,
  Tabs,
  Step,
  Steps,
  Aside,
  LinkCard,
  FileTree,
  Collapsible,
  GenerateSecretButton,
};
