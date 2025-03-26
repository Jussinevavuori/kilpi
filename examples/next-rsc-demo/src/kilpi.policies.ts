import { deny, grant, Policyset } from "@kilpi/core";
import { Article } from "./data-layer/articleService";
import { Subject } from "./kilpi.subject";

export const policies = {
  articles: {
    /**
     * Published articles can be read by anyone. Draft articles can be only read by the author
     * or all admins.
     */
    read(user, article: Article) {
      // Published article can be read by anyone
      if (article.isPublished) return grant(user);

      // Non-published articles require auth
      if (!user) return deny();

      // Author or admin
      return user.id === article.userId || user.role === "admin" ? grant(user) : deny();
    },

    /**
     * Articles can be created by all authenticated users.
     */
    create(user) {
      return user ? grant(user) : deny();
    },

    /**
     * Articles can only be updated by the author.
     */
    update(user, article: Article) {
      // Auth required
      if (!user) return deny();

      // Author
      return user.id === article.userId ? grant(user) : deny();
    },

    /**
     * Articles can be deleted by the author or all admins.
     */
    delete(user, article: Article) {
      // Auth required
      if (!user) return deny();

      // Author or admin
      return user.id === article.userId || user.role === "admin" ? grant(user) : deny();
    },
  },
} satisfies Policyset<Subject>;
