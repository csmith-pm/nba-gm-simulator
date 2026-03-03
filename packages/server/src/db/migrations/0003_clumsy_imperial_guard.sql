CREATE INDEX "idx_player_season_stats_player_id" ON "player_season_stats" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "idx_series_draft_id" ON "series" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "idx_series_games_series_id" ON "series_games" USING btree ("series_id");