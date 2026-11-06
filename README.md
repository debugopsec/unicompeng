# Comp Eng. Resource Hub

VitePress site for computer engineering lecture PDFs, plus an automatic
Telegram → To-Do pipeline.

## Run the site

```bash
npm install
npm run docs:dev
```

The site is served at <http://localhost:5173/unicompeng/>.

## How the Telegram watcher works

1. A Telegram bot listens to the class announcements channel/group.
2. Each new message is checked for homework, essays, reports, quizzes, labs,
   projects, and other deliverables. A single message containing a weekly list
   is split into separate tasks by day and course.
3. Extracted tasks are written to `public/todos.json`.
4. The `/todo` page reads that file and refreshes every 20 seconds.

Without an AI key, the watcher uses keyword and day-heading rules. They work
well for clearly formatted lists, but they are less accurate than AI for mixed
Arabic/English text and relative deadlines. With an AI key, it extracts titles,
courses, types, and due dates much more reliably.

## Telegram setup

### 1. Create a bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts.
3. Copy the bot token.

### 2. Add the bot to the class channel

- **Channel:** add the bot as an **administrator**. A bot must be an admin to
  receive channel posts.
- **Group:** disable privacy mode first. In BotFather, send `/setprivacy`,
  choose the bot, and select **Disable**. Then remove the bot from the group
  and add it again (or promote it to admin).

### 3. Configure the project

```bash
copy .env.example .env
```

Open `.env` and set:

```text
TELEGRAM_BOT_TOKEN=123456789:your-token-here
TELEGRAM_CHAT_IDS=
```

### 4. Find the chat ID

With the bot added to the channel/group, run:

```bash
npm run watch:telegram:id
```

Post any message in the channel/group. The terminal will print something like:

```text
Chat ID : -1001234567890
```

Copy that ID into `TELEGRAM_CHAT_IDS` in `.env`. For multiple chats, separate
the IDs with commas.

### 5. Run the watcher

In one terminal:

```bash
npm run watch:telegram
```

In another terminal:

```bash
npm run docs:dev
```

Open <http://localhost:5173/unicompeng/todo>.

New messages are processed as soon as they arrive. The To-Do page refreshes
automatically every 20 seconds (or use the **Refresh** button).

## If you can't add the bot to a private channel

The official Bot API cannot read a private channel unless a channel admin adds
the bot. If you don't want to ask an admin, you can forward announcements to
the bot manually:

1. Open a private chat with your bot and press **Start**.
2. Run `npm run watch:telegram:id` and send any message to the bot.
3. Copy the printed **user chat ID** into `TELEGRAM_CHAT_IDS` in `.env`
   (comma-separate it if you also watch other chats).
4. Start the watcher with `npm run watch:telegram`.
5. Forward each announcement from the private channel to the bot.

The forwarded message is processed exactly like a channel post, including its
text, caption, and attachments' filenames. The **Open announcement** link points
back to the original channel message when Telegram includes the forward origin.

If the channel has forwarding/restricted-saving disabled, copy the announcement
text and send it to the bot instead. The task is still extracted, but the
original link is unavailable.

This is manual — one forward per announcement — but it needs no admin rights
and does not put your Telegram account at risk.

## AI extraction (recommended)

The keyword fallback misses nuanced Arabic announcements and relative dates.
To enable AI extraction, add an OpenAI-compatible key to `.env`:

```text
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Any OpenAI-compatible endpoint works (OpenAI, OpenRouter, a local Ollama
server, etc.). Only the announcement text is sent to the provider.

Test the extraction without Telegram:

```bash
npm run watch:telegram:test
```

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run docs:dev` | Start the VitePress dev server |
| `npm run docs:build` | Build the static site |
| `npm run watch:telegram` | Start the Telegram watcher |
| `npm run watch:telegram:id` | Print the chat ID of a channel/group |
| `npm run watch:telegram:once` | Process pending updates once, then exit |
| `npm run watch:telegram:test` | Test task extraction on a sample message |
| `npm run sanitize:todos` | Re-sanitize the public task list |
| `npm run test:pii` | Test PII redaction on sample strings |

## Start the watcher automatically on Windows

1. Double-click or schedule `start-telegram-watcher.bat` in this folder.
2. To start it at login, open **Task Scheduler** → **Create Task**.
3. Add a trigger: **At log on**.
4. Add an action: **Start a program** → select
   `<project-folder>\start-telegram-watcher.bat`.
5. Set **Start in** to `<project-folder>`.

Keep the PC awake and online for instant processing. If Telegram is unreachable
or the PC is asleep, Telegram keeps updates for 24 hours and the watcher
processes them when it resumes.

## Files created by the watcher

| File | Purpose |
| --- | --- |
| `public/todos.json` | Sanitized task list served to the website |
| `.data/telegram-state.json` | Last processed update |
| `.data/failed-announcements.json` | Sanitized snippets that could not be extracted |

`.env`, `.data/`, and `node_modules/` are ignored by Git. `public/todos.json`
is tracked so the site always has a task file; the watcher updates it in place.

## Public data and PII

`public/todos.json` is served to every visitor. Each task contains only:

```text
id, title, course, type, dueDate, notes, createdAt, completed
```

Telegram source metadata, message links, chat IDs, chat titles, and usernames
are never written to it. The `id` is a truncated SHA-256 hash, not a Telegram
message or chat ID.

The watcher also removes URLs, email addresses, phone numbers, long numeric IDs,
and `@username` mentions from public task text. To redact specific names or
terms, add them to `.env` as a comma-separated list:

```text
PII_REDACT_TERMS=Name One,Name Two
```

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys the site on
every push to `main`.

1. Create an empty **public** repository named `unicompeng` on GitHub.
   - The site is configured with `base: '/unicompeng/'`. If the repository has
     a different name, update `base` in `.vitepress/config.mts` and the
     hardcoded `/unicompeng/` viewer links in `index.md` and `subjects/*.md`.
2. Push this folder:

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/unicompeng.git
   git push -u origin main
   ```

3. In the GitHub repository, open **Settings → Pages → Build and deployment**
   and set **Source** to **GitHub Actions**.
4. The site will be available at
   `https://YOUR_USERNAME.github.io/unicompeng/`.

`.env` and `.data/` are ignored by Git, so the Telegram bot token is not
uploaded. New tasks from the watcher are written to `public/todos.json` on your
PC; commit and push that file to update the live site, or use a hosted backend
for automatic live updates.

## Notes and limitations

- The watcher processes **text and captions**. It does not parse the contents of
  attached PDFs or images.
- The site is static. While `npm run docs:dev` is running, new tasks appear
  without a rebuild. A deployed production build needs to be rebuilt and
  redeployed to pick up newly added tasks.
- Completion checkboxes are stored in your browser's `localStorage`, not in
  Telegram or the JSON file.
- Run only one watcher instance per bot. Two instances cause a Telegram
  `409 Conflict`.
