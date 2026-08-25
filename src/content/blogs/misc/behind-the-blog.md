---
title: Behind the blog
date: 2024-10-15T00:00:00.000Z
description: >-
  How Mahib's Margins is built with Astro, Markdown, React, Tailwind CSS, GitHub
  Actions, GitHub Pages, Cloudflare, and R2.
tags:
  - Essay
  - Astro
  - DevOps
aliases:
  - /behind-the-blog/
discussions: []
type_label: ""
atUri: "at://did:plc:miwiepbo3e3sh5fknyt7jxqm/site.standard.document/3mtj2yqm4nt2e"
ogImage: site-cover.png
---

I started **Mahib's Margins** about two years ago as a place to write down the
things I discover while working with technology.

Most of what I write about comes from the things I encounter while building
software: programming notes, software engineering lessons, AI/ML discoveries,
interesting ideas, and occasional reflections on technology and the tools I use.

Over time, the blog has also become something more than a collection of
articles. I want it to serve as a public record of my career and learning — a
place where I can look back at what I was working on, what I found interesting,
and how my thinking has changed.

This page is about the other side of the blog: the machinery behind it.

I deliberately keep the stack relatively small. The site is built with Astro,
the content lives in Markdown and MDX, and GitHub Actions takes care of
building and deploying it. Cloudflare handles caching and object storage.

There is no CMS, database, or application server involved.

## Content

The source of truth for the blog is a collection of Markdown and MDX files.

Posts live under `src/content/blogs`, and creating a new article is essentially
creating a new `.md` or `.mdx` file in that directory.

This is one of the things I like about a static blog. My content isn't locked
inside a database or tied to a particular publishing platform. It is just
text sitting in a Git repository.

I usually work on posts using [Zed] or [Neovim]. Ideas start life in
[Obsidian], where I keep notes and things I might want to explore later. When
an idea becomes worth turning into an article, it eventually makes its way
into the blog as Markdown or MDX.

[Prettier] handles formatting and [ESLint] takes care of linting the code.

## Astro

[Astro] is the foundation of the site.

The current site runs on Astro 7.2.0 and uses Astro's content system to load
and validate the blog content. Markdown and MDX provide the writing
experience, while React is available when a piece of interactive UI needs
something more than static HTML.

I like this combination because most of the site doesn't need JavaScript.

A typical article should mostly be HTML and CSS. If I need an interactive
component, I can reach for React without turning the entire site into a
client-side application.

The result is a useful middle ground: a mostly static website with the option
to introduce interactivity where it actually makes sense.

## Tailwind CSS

The styling is built with [Tailwind CSS].

I use it primarily because it makes the relationship between the markup and
the design fairly explicit. Instead of maintaining a large collection of
component-specific stylesheets, most of the site's styling can stay close to
the elements it affects.

The design itself is intentionally minimal. This is a blog, not a dashboard,
so I don't want the interface to compete with the writing.

## Git

The entire site lives in Git.

That includes the application code, Astro configuration, components, styles,
and Markdown/MDX content.

This gives me a useful property that a traditional CMS doesn't provide quite
as naturally: the history of the blog is also the history of the source code.

I can see when an article was written, how it changed, and how the site itself
evolved over time.

For something that is partly meant to be a public record of my learning, that
feels appropriate.

## GitHub Actions and GitHub Pages

Deployment is intentionally boring.

Whenever I push to the `main` branch, [GitHub Actions] is triggered. The
workflow installs the dependencies, runs the project's checks, builds the
Astro site, and deploys the resulting static files to [GitHub Pages].

The basic flow is:

```text
write
  ↓
Markdown / MDX
  ↓
Git commit
  ↓
push to main
  ↓
GitHub Actions
  ↓
Astro build
  ↓
GitHub Pages
```

There is no server for me to manage and no deployment process I need to
remember manually.

A push is enough.

## Cloudflare

[Cloudflare] sits in front of the site and handles caching.

The site itself is static, so there isn't much reason for every request to
travel all the way back to the origin. Caching the generated pages and static
assets closer to visitors keeps the site fast while reducing unnecessary
requests to the origin.

Cloudflare also gives me useful visibility into traffic and caching without
requiring me to build any infrastructure myself.

## Cloudflare R2

I use [Cloudflare R2] for object storage, particularly for assets such as
blog images.

Keeping larger static assets outside the main application repository makes
the Git repository easier to manage while giving me a simple place to store
objects independently of the site's source code.

Cloudflare's caching layer works particularly well here: frequently requested
objects can be served from the edge instead of repeatedly being fetched from
R2.

## Image processing

Images are processed with [sharp] before they are uploaded.

The goal isn't to build an elaborate image pipeline. It is simply to avoid
shipping unnecessarily large assets to readers.

The general flow looks like this:

```text
source image
    ↓
sharp
    ↓
optimized image
    ↓
Cloudflare R2
    ↓
Cloudflare cache
    ↓
reader
```

Keeping image processing as part of the publishing workflow means I don't
have to think about optimization every time someone visits an article.

## Google Analytics

I also use [Google Analytics] for basic site analytics.

I'm interested in understanding which parts of the site people actually read
and how visitors discover the blog. Analytics isn't the reason the site
exists, though, and I try to keep the rest of the infrastructure as simple
as possible.

## Why keep it this simple?

There are plenty of ways I could make this setup more complicated.

I could add a CMS, a database, an API, server-side rendering, a dedicated
backend, or a more elaborate deployment platform.

But none of those things solve a problem I currently have.

The blog's job is to let me write.

Astro gives me a good developer experience and produces a fast static site.
Markdown and MDX keep the content portable. Git gives me version history.
GitHub Actions removes the manual deployment step. GitHub Pages provides
hosting, while Cloudflare takes care of caching and R2 gives me object
storage.

Each part has a fairly clear responsibility.

That's probably the most important characteristic of the stack: **there
isn't much infrastructure to think about.**

I'd rather spend that time writing about something I learned than maintaining
the software that publishes it.

## The stack

At the moment, the important pieces look roughly like this:

| Part                  | Technology                |
| --------------------- | ------------------------- |
| Static site generator | Astro 7.2.0               |
| Content               | Markdown + MDX            |
| Content management    | Astro Content Collections |
| UI components         | React                     |
| Styling               | Tailwind CSS              |
| Formatting            | Prettier                  |
| Linting               | ESLint                    |
| Editor                | Zed / Neovim              |
| Notes                 | Obsidian                  |
| CI/CD                 | GitHub Actions            |
| Hosting               | GitHub Pages              |
| CDN / caching         | Cloudflare                |
| Object storage        | Cloudflare R2             |
| Image processing      | sharp                     |
| Analytics             | Google Analytics          |

The source code for [Mahib's Margins] is publicly available on GitHub.

The stack will probably change again at some point. That's part of the fun
of building a personal site.

But for now, I want the infrastructure to stay in the background and let the
writing remain the interesting part.

<!-- references -->

<!-- prettier-ignore-start -->

[astro]: https://astro.build/
[tailwind css]: https://tailwindcss.com/
[react]: https://react.dev/
[prettier]: https://prettier.io/
[eslint]: https://eslint.org/
[zed]: https://zed.dev/
[neovim]: https://neovim.io/
[obsidian]: https://obsidian.md/
[github actions]: https://github.com/features/actions
[github pages]: https://pages.github.com/
[cloudflare]: https://www.cloudflare.com/
[cloudflare r2]: https://developers.cloudflare.com/r2/
[sharp]: https://sharp.pixelplumbing.com/
[google analytics]: https://analytics.google.com/
[mahib's margins]: https://github.com/mahibulhaque/mahibulhaque.me

<!-- prettier-ignore-end -->
