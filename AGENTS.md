<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Shared project memory

Every new task or worktree must begin by reading these files before planning or changing the project:

1. `PROJECT_MEMORY.md` for the current cross-task handoff, active work, decisions, and deadlines.
2. `PRODUCT.md` for durable product principles and customer promises.
3. `DESIGN.md` when the task affects the interface or customer journey.
4. The relevant technical document under `docs/` for the area being changed.

Treat `PROJECT_MEMORY.md` as a concise handoff, not as infallible truth or a transcript. Confirm branch, worktree, test, deployment, and external-service state when they matter. The current user request and newer verified evidence take precedence.

When the memory names a relevant Codex task, use the desktop task-history tools to read that task's latest status before relying on an old summary. Retrieve only the history needed for the current work; do not sweep every prior conversation by default.

After meaningful product work, update `PROJECT_MEMORY.md` in the same change when any of the following changed:

- a durable product or UX decision;
- the supported catalog, evidence tiers, architecture, or safety boundary;
- a feature branch/worktree was started, completed, merged, abandoned, pushed, or published;
- verification, deployment, submission, or deadline status;
- the short list of known gaps and next priorities.

Keep the memory compact and replace stale facts instead of appending a session diary. Use absolute dates, distinguish shipped facts from work in progress, link to deeper source documents, and never store secrets or sensitive personal data. A merging or publishing task is responsible for reconciling the memory with the destination branch.
