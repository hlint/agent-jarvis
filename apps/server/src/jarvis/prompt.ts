import { join } from "node:path";
import type { Session } from "@repo/shared/defines/session";
import { formatPlanForPrompt } from "@repo/shared/lib/plan";
import { timeFormat } from "@repo/shared/lib/time";
import { interpolateTemplate } from "@repo/shared/lib/utils";
import { readFileSync } from "fs-extra";
import getNoteList from "../lib/get-note-list";
import getSkillList from "../lib/get-skill-list";
import { toDisplayPath } from "../lib/runtime-path";
import {
  DIR_RUNTIME,
  DIR_SESSIONS,
  DIR_TMP,
  DIR_WORKSPACE,
  PATH_SOUL,
} from "./defines";

export default class JarvisPrompt {
  getSystemPrompt() {
    return interpolateTemplate(readFileSync(PATH_SOUL, "utf-8"), {
      SKILL_LIST: this.getSkillListPrompt(),
      NOTE_LIST: this.getNoteListPrompt(),
    });
  }

  getRuntimePrompt(
    session: Session,
    options?: { disabledToolsPrompt?: string },
  ) {
    const disabledTools = options?.disabledToolsPrompt ?? "";

    return `<SYSTEM_ENVIRONMENT>
		Current Time: ${timeFormat()}
		TimeZone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
		Operating System: ${process.platform}
		Architecture: ${process.arch}
		CWD(Runtime): ${DIR_RUNTIME}
		Current Session ID: ${session.id}
		Current Session Name: ${session.name}
		Session Type: ${session.type}
</SYSTEM_ENVIRONMENT>
${this.getArtifactPathsPrompt(session)}
${formatPlanForPrompt(session.plan)}${disabledTools}`;
  }

  private getArtifactPathsPrompt(session: Session) {
    const tmp = toDisplayPath(DIR_TMP);
    const attachments = toDisplayPath(
      join(DIR_SESSIONS, session.id, "attachments"),
    );
    const artifacts = toDisplayPath(
      join(DIR_SESSIONS, session.id, "artifacts"),
    );
    const workspace = toDisplayPath(DIR_WORKSPACE);

    return `<ARTIFACT_PATHS>
Runtime-relative paths when choosing where to create or save files:

| Purpose | Path | When to use |
| --- | --- | --- |
| Temporary scratch | ${tmp}/ | Disposable intermediates; not tied to this session |
| Session — user uploads | ${attachments}/ | Files the user attached in this chat (read-only reference) |
| Session — your outputs | ${artifacts}/ | Images, exports, one-off deliverables for this conversation |
| Long-term project | ${workspace}/<project-slug>/ | Ongoing work spanning multiple sessions (see notes/workspace.md) |
| Project data & outputs | ${workspace}/<project-slug>/data/ | Persist charts, datasets, builds, HTML demos users will revisit |
| Project tasks & progress | ${workspace}/<project-slug>/tasks/ | Backlogs, checkpoints, markdown/json progress |

Default: session outputs → ${artifacts}/; reuse across sessions → ${workspace}/<slug>/data/. Whiteboard HTML: ${workspace}/ or ${artifacts}/ depending on scope, then navigate_whiteboard.
</ARTIFACT_PATHS>`;
  }

  getSkillListPrompt() {
    const skillList = getSkillList();
    return JSON.stringify(skillList, null, 2);
  }

  getNoteListPrompt() {
    const noteList = getNoteList();
    return noteList
      .map(
        (note) =>
          `<NOTE NAME="${note.name}" PATH="${note.path}">${note.content}</NOTE>`,
      )
      .join("\n");
  }
}
