CREATE TABLE "task_labels" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "task_labels_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"taskId" integer NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"color" varchar NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "lists" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "labels";--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "users_to_tasks" DROP COLUMN "isArchived";--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP COLUMN "isArchived";