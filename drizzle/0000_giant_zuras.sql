CREATE TABLE `pallets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`length_mm` integer NOT NULL,
	`width_mm` integer NOT NULL,
	`height_mm` integer NOT NULL,
	`tare_weight_kg` real NOT NULL,
	`max_gross_weight_kg` real NOT NULL,
	`stackable` integer DEFAULT false NOT NULL,
	`max_stack` integer DEFAULT 1 NOT NULL,
	`rotatable` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`pallet_id` text NOT NULL,
	`units_per_pallet` integer NOT NULL,
	`unit_weight_kg` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`pallet_id`) REFERENCES `pallets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_code_unique` ON `products` (`code`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`length_mm` integer NOT NULL,
	`width_mm` integer NOT NULL,
	`height_mm` integer NOT NULL,
	`max_load_kg` real NOT NULL,
	`axle_limit_kg` real DEFAULT 0 NOT NULL,
	`door_side` text DEFAULT 'REAR' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
