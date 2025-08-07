ALTER TABLE "comments" DROP CONSTRAINT "comments_taskId_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP CONSTRAINT "comments_self_reference_id";
--> statement-breakpoint
ALTER TABLE "lists" DROP CONSTRAINT "lists_projectId_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_ownerId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "task_labels" DROP CONSTRAINT "task_labels_taskId_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "teams_to_projects" DROP CONSTRAINT "teams_to_projects_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "teams_to_projects" DROP CONSTRAINT "teams_to_projects_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_tasks" DROP CONSTRAINT "users_to_tasks_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_tasks" DROP CONSTRAINT "users_to_tasks_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP CONSTRAINT "users_to_teams_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP CONSTRAINT "users_to_teams_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP CONSTRAINT "users_to_teams_role_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_self_reference_id" FOREIGN KEY ("parentCommentId") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lists" ADD CONSTRAINT "lists_projectId_projects_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_labels" ADD CONSTRAINT "task_labels_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_listId_lists_id_fk" FOREIGN KEY ("listId") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD CONSTRAINT "teams_to_projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams_to_projects" ADD CONSTRAINT "teams_to_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_tasks" ADD CONSTRAINT "users_to_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_tasks" ADD CONSTRAINT "users_to_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" ADD CONSTRAINT "users_to_teams_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;