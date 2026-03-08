-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "tags" TEXT[],
    "accredited" BOOLEAN NOT NULL,
    "country" TEXT NOT NULL,
    "publish_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
