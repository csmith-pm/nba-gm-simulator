CREATE TABLE "draft_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"pick_order" integer NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "draft_picks" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"pick_number" integer NOT NULL,
	"assigned_position" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_by" integer NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL,
	"criteria" jsonb NOT NULL,
	"current_pick_number" integer DEFAULT 0 NOT NULL,
	"share_code" varchar(21) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drafts_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "player_season_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"season" varchar(10) NOT NULL,
	"games_played" integer NOT NULL,
	"ppg" real NOT NULL,
	"rpg" real NOT NULL,
	"apg" real NOT NULL,
	"spg" real NOT NULL,
	"bpg" real NOT NULL,
	"fg_pct" real NOT NULL,
	"ft_pct" real NOT NULL,
	"three_pct" real NOT NULL,
	"minutes_pg" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"nba_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"draft_year" integer,
	"draft_round" integer,
	"draft_number" integer,
	"career_start_year" integer NOT NULL,
	"career_end_year" integer NOT NULL,
	"primary_position" varchar(2),
	CONSTRAINT "players_nba_id_unique" UNIQUE("nba_id")
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" integer NOT NULL,
	"team1_user_id" integer NOT NULL,
	"team2_user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"winner_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "series_games" (
	"id" serial PRIMARY KEY NOT NULL,
	"series_id" integer NOT NULL,
	"game_number" integer NOT NULL,
	"team1_score" integer NOT NULL,
	"team2_score" integer NOT NULL,
	"winner_user_id" integer NOT NULL,
	"game_log" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "draft_participants" ADD CONSTRAINT "draft_participants_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_participants" ADD CONSTRAINT "draft_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "draft_picks" ADD CONSTRAINT "draft_picks_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_season_stats" ADD CONSTRAINT "player_season_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_team1_user_id_users_id_fk" FOREIGN KEY ("team1_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_team2_user_id_users_id_fk" FOREIGN KEY ("team2_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_winner_user_id_users_id_fk" FOREIGN KEY ("winner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_games" ADD CONSTRAINT "series_games_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_games" ADD CONSTRAINT "series_games_winner_user_id_users_id_fk" FOREIGN KEY ("winner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "draft_participants_unique" ON "draft_participants" USING btree ("draft_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "draft_picks_unique" ON "draft_picks" USING btree ("draft_id","pick_number");