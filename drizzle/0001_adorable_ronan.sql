CREATE TABLE `audit_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`target_url` varchar(2048) NOT NULL,
	`status` enum('active','completed','paused','archived') NOT NULL DEFAULT 'active',
	`severity` enum('Critical','High','Medium','Low','Info'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `audit_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cve_database` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cve_id` varchar(20) NOT NULL,
	`description` text,
	`base_score` decimal(3,1),
	`severity` enum('Critical','High','Medium','Low','Info'),
	`affected_software` text,
	`published_date` datetime,
	`modified_date` datetime,
	`references` text,
	`tags` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cve_database_id` PRIMARY KEY(`id`),
	CONSTRAINT `cve_database_cve_id_unique` UNIQUE(`cve_id`)
);
--> statement-breakpoint
CREATE TABLE `reconnaissance_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scan_id` int NOT NULL,
	`project_id` int NOT NULL,
	`result_type` enum('subdomain','ssl_certificate','technology','port','service') NOT NULL,
	`target` varchar(2048) NOT NULL,
	`data` text,
	`severity` enum('Critical','High','Medium','Low','Info'),
	`discovered_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reconnaissance_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`scan_id` int NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`summary` text,
	`total_vulnerabilities` int DEFAULT 0,
	`critical_count` int DEFAULT 0,
	`high_count` int DEFAULT 0,
	`medium_count` int DEFAULT 0,
	`low_count` int DEFAULT 0,
	`info_count` int DEFAULT 0,
	`report_format` enum('pdf','html','json') DEFAULT 'pdf',
	`report_url` varchar(2048),
	`generated_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scan_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scan_id` int NOT NULL,
	`level` enum('info','warning','error','debug') DEFAULT 'info',
	`message` text NOT NULL,
	`metadata` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scan_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scan_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scan_id` int NOT NULL,
	`project_id` int NOT NULL,
	`priority` int DEFAULT 5,
	`status` enum('queued','processing','completed','failed') DEFAULT 'queued',
	`attempts` int DEFAULT 0,
	`max_attempts` int DEFAULT 3,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`processed_at` timestamp,
	CONSTRAINT `scan_queue_id` PRIMARY KEY(`id`),
	CONSTRAINT `scan_queue_scan_id_unique` UNIQUE(`scan_id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`user_id` int NOT NULL,
	`scan_type` enum('web_vulnerability','reconnaissance','ssl_analysis','technology_fingerprint','port_scan','full_audit') NOT NULL,
	`status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`started_at` timestamp,
	`completed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`logs` text,
	`error_message` text,
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scan_id` int NOT NULL,
	`project_id` int NOT NULL,
	`type` enum('xss','sql_injection','csrf','open_redirect','missing_security_headers','insecure_config','weak_ssl','exposed_service','cve','other') NOT NULL,
	`severity` enum('Critical','High','Medium','Low','Info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`affected_url` varchar(2048),
	`payload` text,
	`recommendation` text,
	`cve_id` varchar(20),
	`technology` varchar(255),
	`detected_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vulnerabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','auditor','viewer') NOT NULL DEFAULT 'viewer';--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `audit_projects` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `audit_projects` (`status`);--> statement-breakpoint
CREATE INDEX `idx_cve_database_id` ON `cve_database` (`cve_id`);--> statement-breakpoint
CREATE INDEX `idx_cve_severity` ON `cve_database` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_recon_scan_id` ON `reconnaissance_results` (`scan_id`);--> statement-breakpoint
CREATE INDEX `idx_recon_project_id` ON `reconnaissance_results` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_result_type` ON `reconnaissance_results` (`result_type`);--> statement-breakpoint
CREATE INDEX `idx_report_project_id` ON `reports` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_report_scan_id` ON `reports` (`scan_id`);--> statement-breakpoint
CREATE INDEX `idx_report_user_id` ON `reports` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_log_scan_id` ON `scan_logs` (`scan_id`);--> statement-breakpoint
CREATE INDEX `idx_log_level` ON `scan_logs` (`level`);--> statement-breakpoint
CREATE INDEX `idx_queue_status` ON `scan_queue` (`status`);--> statement-breakpoint
CREATE INDEX `idx_priority` ON `scan_queue` (`priority`);--> statement-breakpoint
CREATE INDEX `idx_project_id` ON `scans` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_scan_status` ON `scans` (`status`);--> statement-breakpoint
CREATE INDEX `idx_scan_user_id` ON `scans` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_vuln_scan_id` ON `vulnerabilities` (`scan_id`);--> statement-breakpoint
CREATE INDEX `idx_vuln_project_id` ON `vulnerabilities` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_severity` ON `vulnerabilities` (`severity`);--> statement-breakpoint
CREATE INDEX `idx_vuln_type` ON `vulnerabilities` (`type`);--> statement-breakpoint
CREATE INDEX `idx_cve_id` ON `vulnerabilities` (`cve_id`);