CREATE INDEX "idx_comments_task" ON "comments" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "idx_comments_task_created" ON "comments" USING btree ("taskId","created_at");--> statement-breakpoint
CREATE INDEX "idx_comments_author" ON "comments" USING btree ("authorId");--> statement-breakpoint
CREATE INDEX "idx_comments_parent" ON "comments" USING btree ("parentCommentId");--> statement-breakpoint
CREATE INDEX "idx_lists_project" ON "lists" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "idx_lists_project_pos" ON "lists" USING btree ("projectId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_lists_project_pos" ON "lists" USING btree ("projectId","position");--> statement-breakpoint
CREATE INDEX "idx_pm_project" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_pm_user" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pm_project_user" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_pm_project_role" ON "project_members" USING btree ("project_id","role");--> statement-breakpoint
CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_due" ON "projects" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "idx_projects_status_due" ON "projects" USING btree ("status","dueDate");--> statement-breakpoint
CREATE INDEX "idx_task_labels_task" ON "task_labels" USING btree ("taskId");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_task_labels_task_name" ON "task_labels" USING btree ("taskId","name");--> statement-breakpoint
CREATE INDEX "idx_tasks_list" ON "tasks" USING btree ("listId");--> statement-breakpoint
CREATE INDEX "idx_tasks_list_pos" ON "tasks" USING btree ("listId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_tasks_list_pos" ON "tasks" USING btree ("listId","position");--> statement-breakpoint
CREATE INDEX "idx_tasks_priority" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_tasks_due" ON "tasks" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "idx_teams_teamname_lower" ON "teams" USING btree (lower("teamName"));--> statement-breakpoint
CREATE INDEX "idx_ttp_team" ON "teams_to_projects" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_ttp_project" ON "teams_to_projects" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_users_name_lower" ON "users" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "idx_uta_task" ON "users_to_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_uta_user" ON "users_to_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_utt_team" ON "users_to_teams" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "idx_utt_user" ON "users_to_teams" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_utt_team_isleader" ON "users_to_teams" USING btree ("team_id","isLeader");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_utt_one_leader_per_team" ON "users_to_teams" USING btree ("team_id") WHERE "users_to_teams"."isLeader" = true;