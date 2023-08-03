import { notFound } from "next/navigation"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { EmptyPlaceholder } from "@/components/empty-placeholder"
import { DashboardHeader } from "@/components/header"
import { ProfessorCreateButton } from "@/components/professor/professor-create-button"
import { ProfessorItem } from "@/components/professor/professor-item"
import { DashboardShell } from "@/components/shell"

export default async function Professors() {
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }
  const professors = await db.professor.findMany({
    where: {
      userId: user?.id,
    },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      subjects: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Professors" text="Create and manage professors">
        <ProfessorCreateButton />
      </DashboardHeader>
      <div>
        {professors?.length ? (
          <div className="divide-y divide-border rounded-md border">
            {professors.map((professor) => (
              <ProfessorItem key={professor.id} professor={professor} />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="logo" />
            <EmptyPlaceholder.Title>
              No professors created
            </EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any professors yet. Start creating content.
            </EmptyPlaceholder.Description>
            <ProfessorCreateButton variant="outline" />
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  )
}
