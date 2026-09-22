-- CreateEnum
CREATE TYPE "SectionSelectionMode" AS ENUM ('BY_EXERCISE', 'BY_QUESTION');

-- AlterTable
ALTER TABLE "TestSection" ADD COLUMN "selectionMode" "SectionSelectionMode" NOT NULL DEFAULT 'BY_EXERCISE',
ADD COLUMN "targetQuestionCount" INTEGER;

-- AlterTable
ALTER TABLE "ActiveSession" ADD COLUMN "selectedQuestions" TEXT NOT NULL DEFAULT '{}';
