-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "auth_user" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "newsletter" BOOLEAN NOT NULL,
    "sroi_info" BOOLEAN NOT NULL,
    "download_only" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_user_key" ON "User"("auth_user");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
