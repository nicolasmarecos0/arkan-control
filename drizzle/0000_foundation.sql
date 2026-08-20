CREATE TYPE "public"."access_status" AS ENUM('ACTIVO', 'REVOCADO');--> statement-breakpoint
CREATE TYPE "public"."actor_type" AS ENUM('USUARIO', 'SISTEMA');--> statement-breakpoint
CREATE TYPE "public"."business_role" AS ENUM('DUENO', 'CONTADOR');--> statement-breakpoint
CREATE TYPE "public"."fact_link_role" AS ENUM('PRIMARIA', 'RELACIONADA');--> statement-breakpoint
CREATE TYPE "public"."fact_origin" AS ENUM('UI', 'API', 'SISTEMA', 'SEED');--> statement-breakpoint
CREATE TYPE "public"."operation_status" AS ENUM('COMPLETADA');--> statement-breakpoint
CREATE TABLE "access_grants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "business_role" NOT NULL,
	"status" "access_status" NOT NULL,
	"granted_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"initial_balance_pyg" bigint NOT NULL,
	"initial_balance_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fact_links" (
	"fact_id" uuid NOT NULL,
	"business_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"role" "fact_link_role" NOT NULL,
	CONSTRAINT "fact_links_fact_id_entity_type_entity_id_pk" PRIMARY KEY("fact_id","entity_type","entity_id")
);
--> statement-breakpoint
CREATE TABLE "facts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"seq" bigserial NOT NULL,
	"business_id" uuid NOT NULL,
	"type" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"actor_type" "actor_type" NOT NULL,
	"actor_id" text,
	"actor_label" text NOT NULL,
	"origin" "fact_origin" NOT NULL,
	"primary_entity_type" text NOT NULL,
	"primary_entity_id" text NOT NULL,
	"summary" text NOT NULL,
	"consequences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"operation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "facts_id_business_key" UNIQUE("id","business_id")
);
--> statement-breakpoint
CREATE TABLE "operations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid,
	"type" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "operation_status" DEFAULT 'COMPLETADA' NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_grants" ADD CONSTRAINT "access_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fact_links" ADD CONSTRAINT "fact_links_fact_business_fk" FOREIGN KEY ("fact_id","business_id") REFERENCES "public"."facts"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facts" ADD CONSTRAINT "facts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facts" ADD CONSTRAINT "facts_operation_id_operations_id_fk" FOREIGN KEY ("operation_id") REFERENCES "public"."operations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "access_grants_business_user_key" ON "access_grants" USING btree ("business_id","user_id");--> statement-breakpoint
CREATE INDEX "access_grants_business_idx" ON "access_grants" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "fact_links_entity_idx" ON "fact_links" USING btree ("business_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "facts_recent_idx" ON "facts" USING btree ("business_id","occurred_at" DESC NULLS LAST,"seq" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "facts_operation_idx" ON "facts" USING btree ("business_id","operation_id");--> statement-breakpoint
CREATE INDEX "facts_type_idx" ON "facts" USING btree ("business_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "operations_business_key_idx" ON "operations" USING btree ("business_id","idempotency_key") WHERE business_id is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "operations_platform_key_idx" ON "operations" USING btree ("idempotency_key") WHERE business_id is null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");