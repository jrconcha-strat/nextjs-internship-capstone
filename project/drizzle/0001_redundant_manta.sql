ALTER TABLE "comments" DROP COLUMN "archivedAt";--> statement-breakpoint
ALTER TABLE "lists" DROP COLUMN "archivedAt";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "archivedAt";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "archivedAt";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "archivedAt";--> statement-breakpoint
ALTER TABLE "teams_to_projects" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "archivedAt";--> statement-breakpoint
ALTER TABLE "users_to_tasks" DROP COLUMN "archived_at";--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP COLUMN "archived_at";