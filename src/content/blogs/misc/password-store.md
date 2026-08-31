---
title: How I am Maintaining Passwords Without a Manager
description: >-
  A practical, no-nonsense guide to pass, the standard Unix password manager —
  what it is, why it works, and how to actually use it day to day.
date: 2026-08-31T00:00:00.000Z
tags:
  - cli
  - security
  - linux
  - workflow
ogImage: site-cover.png
atUri: 'at://did:plc:miwiepbo3e3sh5fknyt7jxqm/site.standard.document/3muf7a32cyb2c'
---

I spent years bouncing between password managers. A browser extension here, a "zero-knowledge" cloud vault there, one memorable stretch where I just... didn't use one, which I don't recommend to anyone. Every time, something bugged me. Either the tool wanted a subscription for basic sync, or it locked my data in a proprietary blob I couldn't inspect, or the CLI support was an afterthought bolted onto a GUI-first product.

Then a coworker watched me fumble through unlocking a vault during a pair programming session and said, "why don't you just use `pass`?"

I'd heard of it. Filed it away as "that thing terminal purists use." Turns out the terminal purists were right, and I felt a little silly for not trying it sooner.

## What `pass` actually is

`pass` calls itself "the standard Unix password manager," which is a bold name until you see how little there is to it. The whole tool is basically a shell script wrapped around two things you almost certainly already trust: **GPG** for encryption and **git** for versioning and sync.

Your passwords live as individual `.gpg` files in a directory tree, usually `~/.password-store`. A password for your email account might be sitting at `~/.password-store/email/protonmail.gpg`. Each file is just that entry, encrypted with your GPG key. Want to see it? `pass` decrypts it, prints it, and gets out of your way.

That's it. No daemon running in the background, no vendor's server holding your data, no format only their app understands. If `pass` disappeared tomorrow, you'd still have a folder of GPG-encrypted files you could decrypt with plain old `gpg -d`.

## Installing it

On most Linux distros it's in the package manager already:

```bash
# Debian/Ubuntu
sudo apt install pass

# Arch
sudo pacman -S pass

# Fedora
sudo dnf install pass

# macOS (via Homebrew)
brew install pass
```

You'll also need a GPG key. If you don't have one yet:

```bash
gpg --full-generate-key
```

Pick RSA 4096 or ed25519 if your GPG version supports it, set an expiration if you're the paranoid type (I am), and use a real passphrase. This key is the one thing standing between your passwords and anyone who gets hold of your laptop, so don't skimp here.

## Setting it up

Once you've got a key, initialize the store:

```bash
pass init "your-gpg-key-id-or-email"
```

This creates `~/.password-store` and drops a `.gpg-id` file in it recording which key to encrypt against. Every entry you add from here on gets encrypted to that key automatically.

## The day-to-day commands

This is where `pass` earns its "standard Unix" branding. It behaves exactly the way you'd expect a well-mannered CLI tool to behave.

**Adding a password:**

```bash
pass insert email/protonmail
```

It'll prompt you to type the password (twice, to confirm). If you'd rather generate a strong one on the spot:

```bash
pass generate email/protonmail 20
```

That gives you a random 20-character password, saves it, and prints it to your terminal. Add `-c` and it skips the terminal entirely, copying straight to your clipboard instead — which is what I use almost every time, since I don't actually want to see most of my passwords.

**Reading a password:**

```bash
pass email/protonmail
```

Or, again, `pass -c email/protonmail` to copy it to your clipboard without ever displaying it on screen. The clipboard clears itself automatically after 45 seconds, so you're not leaving a password sitting there if you forget about it.

**Browsing what you've got:**

```bash
pass
```

Run it bare and you get a tree view of your whole store, organized by whatever folder structure you've set up. I keep mine roughly like this:

```
Password Store
├── email
│   ├── protonmail
│   └── work-outlook
├── servers
│   ├── homelab-root
│   └── vps-digitalocean
├── social
│   └── github
└── finance
    └── bank-primary
```

**Editing an entry:**

```bash
pass edit servers/vps-digitalocean
```

This decrypts the file into a temp location, opens it in `$EDITOR`, and re-encrypts it when you save. Handy for entries where you want to store more than just the password — see below.

**Removing an entry:**

```bash
pass rm social/old-forum-account
```

## Storing more than just a password

Here's a detail that took me a minute to appreciate: `pass` doesn't limit an entry to a single line. The first line is treated as "the password" for purposes of `pass -c`, but everything after that is free-form text. I use it for TOTP recovery codes, security questions, account PINs, whatever:

```
sup3rS3cr3tP@ss
username: mahib
recovery codes:
  a1b2-c3d4
  e5f6-g7h8
security question: mother's maiden name -> [not my mother's actual maiden name, obviously]
```

Running `pass servers/vps-digitalocean` shows you the whole thing. Running `pass -c servers/vps-digitalocean` only ever touches your clipboard with the first line. It's a small thing, but it means I stopped keeping a separate notes file for "extra account info," which used to live in a much less secure place than I'd like to admit.

## Syncing across machines with git

This is the part that sold me. `pass` has git integration baked in from the start:

```bash
cd ~/.password-store
pass git init
pass git remote add origin git@github.com:yourname/password-store.git
pass git push -u origin main
```

After that, every `insert`, `edit`, `rm`, or `generate` is automatically committed. Your password store is now a git repo with full history — you can see exactly when you rotated a password, or recover an old one if you deleted an entry by mistake (`git log`, `git show`, all of it works exactly like you'd expect).

I push mine to a private repo and pull it down on every machine I use. Since the files are GPG-encrypted at rest, hosting them on GitHub isn't the risk it sounds like — anyone browsing the repo just sees encrypted blobs with commit messages like "Add given password for servers/vps-digitalocean." The actual secrets never touch the wire or the disk unencrypted, git included.

If you're not comfortable with a third-party host even for encrypted data, self-hosting a bare git repo over SSH takes about five minutes and works identically.

## Where it gets even better: extensions

The base tool is deliberately minimal, but there's an ecosystem of extensions that plug in cleanly:

- **pass-otp** — store and generate TOTP codes directly from `pass`, so your 2FA codes live right next to the password they belong to. `pass otp servers/vps-digitalocean` spits out the current code.
- **pass-import** — migrate from Bitwarden, 1Password, LastPass, Chrome, and a long list of others, straight into your store.
- **browserpass** / **passff** — browser extensions that let you autofill from your store without leaving the keyboard.
- **qtpass** or **pass-tray** — if you or someone on your team wants a GUI without giving up the underlying format.

None of these are required. That's the appeal — you add exactly the surface area you need and nothing else.

## The honest downsides

I don't want to sell this as flawless.

- **The learning curve is real if you've never touched GPG.** Key generation, understanding what a passphrase protects versus what a subkey is, none of it is hard exactly, but it's not zero-effort either.
- **Mobile support is second-class.** Android has apps like Password Store (OpenKeychain-based) and there are iOS options, but they're community projects, not a polished first-party app. If you live on your phone, budget time to get this working comfortably.
- **No built-in secure notes, credit cards, identities, etc. as separate item types.** You can shoehorn anything into a text file, but you won't get the structured forms a commercial manager gives you.
- **You are your own backup strategy.** Git remote goes down, or you lose your GPG key without a revocation cert or backup, and you've lost everything. This is genuinely more responsibility than "trust the vendor's cloud."

For me those tradeoffs are worth it. I already trust GPG and git with things that matter. I'd rather my passwords live in tools I understand end to end than in a vault whose internals I can't see.

## Was it worth switching?

Honestly, yes, and not for some ideological reason about owning my data (though that's a nice bonus). It's that `pass` just fits how I already work. It's a shell command, so it composes with everything else I do in a terminal. It's plain files, so I can grep it, script against it, back it up with tools I already use. It doesn't ask me to trust a company's security team over my own GPG key and my own git remote.

If you're comfortable in a terminal and you've been quietly annoyed by your current password manager for reasons you can't quite articulate, give `pass` a weekend. Install it, move over your five most-used accounts, and see how it feels. That's basically what I did, and I never went back to the GUI vault.

---

_Website: [passwordstore.org](https://www.passwordstore.org/)_
