CREATE TABLE "project_members" (
	"team_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_members_team_id_project_id_user_id_pk" PRIMARY KEY("team_id","project_id","user_id"),
	CONSTRAINT "project_members_project_id_user_id_unique" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP CONSTRAINT "users_to_teams_role_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_roles_id_fk" FOREIGN KEY ("role") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_teams" DROP COLUMN "role";