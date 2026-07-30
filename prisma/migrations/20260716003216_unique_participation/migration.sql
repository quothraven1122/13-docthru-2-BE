/*
  Warnings:

  - A unique constraint covering the columns `[participatorId,challengeId]` on the table `participations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participations_participatorId_challengeId_key" ON "participations"("participatorId", "challengeId");
