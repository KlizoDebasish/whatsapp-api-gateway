-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BusinessCategory') THEN
        CREATE TYPE "BusinessCategory" AS ENUM ('medicine', 'gym', 'grocery', 'electronics', 'restaurant', 'salon', 'custom');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SessionStatus') THEN
        CREATE TYPE "SessionStatus" AS ENUM ('CONNECTED', 'CONNECTING', 'DISCONNECTED');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageSender') THEN
        CREATE TYPE "MessageSender" AS ENUM ('customer', 'business', 'system');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageType') THEN
        CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'DOCUMENT', 'CATALOG_CARD');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageStatus') THEN
        CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderStatus') THEN
        CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISPATCHED', 'COMPLETED', 'CANCELLED');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
        CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'COD');
    END IF;
END $$;

-- CreateTable: business_accounts
CREATE TABLE IF NOT EXISTS "business_accounts" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "category" "BusinessCategory" NOT NULL DEFAULT 'custom',
    "categoryLabel" TEXT NOT NULL DEFAULT 'Custom Business',
    "ownerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "currency" TEXT NOT NULL DEFAULT '₹',
    "workingHours" TEXT NOT NULL DEFAULT '09:00 AM - 09:00 PM',
    "greetingMessage" TEXT NOT NULL,
    "aiPersonaPrompt" TEXT NOT NULL,
    "minDelaySeconds" INTEGER NOT NULL DEFAULT 8,
    "maxDelaySeconds" INTEGER NOT NULL DEFAULT 18,
    "typingSimulation" BOOLEAN NOT NULL DEFAULT true,
    "typingSpeedWpm" INTEGER NOT NULL DEFAULT 60,
    "enableAi" BOOLEAN NOT NULL DEFAULT true,
    "enableStockQueries" BOOLEAN NOT NULL DEFAULT true,
    "allowedChats" TEXT NOT NULL DEFAULT '*',
    "apiKey" TEXT NOT NULL,
    "domain" TEXT,
    "password" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_accounts_pkey" PRIMARY KEY ("id")
);

-- Ensure domain & password columns exist in case table existed before
ALTER TABLE "business_accounts" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "business_accounts" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- CreateTable: users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: whatsapp_sessions
CREATE TABLE IF NOT EXISTS "whatsapp_sessions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "qrCode" TEXT,
    "authCredentials" JSONB,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "autoReconnect" BOOLEAN NOT NULL DEFAULT true,
    "deviceModel" TEXT DEFAULT 'WhatsApp Web Multi-Device',
    "batteryPercent" INTEGER DEFAULT 100,
    "latencyMs" INTEGER DEFAULT 35,
    "lastConnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: catalog_items
CREATE TABLE IF NOT EXISTS "catalog_items" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'pcs',
    "description" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: contacts
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarBg" TEXT DEFAULT 'bg-emerald-600',
    "initials" TEXT DEFAULT 'RS',
    "tag" TEXT NOT NULL DEFAULT 'Active Inquiry',
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: chat_messages
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "text" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "mediaUrl" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: orders
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "items" JSONB NOT NULL,
    "deliveryAddress" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: catalog_embeddings
CREATE TABLE IF NOT EXISTS "catalog_embeddings" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "catalogItemId" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" DOUBLE PRECISION[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_embeddings_pkey" PRIMARY KEY ("id")
);

-- Unique constraints safely created using DO blocks
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_accounts_apiKey_key') THEN
        ALTER TABLE "business_accounts" ADD CONSTRAINT "business_accounts_apiKey_key" UNIQUE ("apiKey");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_accounts_domain_key') THEN
        ALTER TABLE "business_accounts" ADD CONSTRAINT "business_accounts_domain_key" UNIQUE ("domain");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_domain_key') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_domain_key" UNIQUE ("domain");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_businessId_key') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_businessId_key" UNIQUE ("businessId");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_businessId_phone_key') THEN
        ALTER TABLE "contacts" ADD CONSTRAINT "contacts_businessId_phone_key" UNIQUE ("businessId", "phone");
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_orderNumber_key') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_orderNumber_key" UNIQUE ("orderNumber");
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "catalog_items_businessId_name_idx" ON "catalog_items"("businessId", "name");
CREATE INDEX IF NOT EXISTS "catalog_items_businessId_sku_idx" ON "catalog_items"("businessId", "sku");
CREATE INDEX IF NOT EXISTS "catalog_embeddings_businessId_idx" ON "catalog_embeddings"("businessId");

-- Foreign key constraints safely created using DO blocks
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_businessId_fkey') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_sessions_businessId_fkey') THEN
        ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalog_items_businessId_fkey') THEN
        ALTER TABLE "catalog_items" ADD CONSTRAINT "catalog_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_businessId_fkey') THEN
        ALTER TABLE "contacts" ADD CONSTRAINT "contacts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_contactId_fkey') THEN
        ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_businessId_fkey') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_contactId_fkey') THEN
        ALTER TABLE "orders" ADD CONSTRAINT "orders_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalog_embeddings_businessId_fkey') THEN
        ALTER TABLE "catalog_embeddings" ADD CONSTRAINT "catalog_embeddings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalog_embeddings_catalogItemId_fkey') THEN
        ALTER TABLE "catalog_embeddings" ADD CONSTRAINT "catalog_embeddings_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
