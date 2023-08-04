import { notFound, redirect } from "next/navigation"
import { Section, User } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { DashboardInnerPage } from "@/components/dashboard-inner-page"
import { PreferenceCreate } from "@/components/preference/preference-create"
import { PreferencesView } from "@/components/preference/preferences-view"
import { ProfessorCreate } from "@/components/professor/professor-create"
import { ScheduleView } from "@/components/schedule/schedule-view"
import { ProfessorsInSectionView } from "@/components/section/professors-in-section-view"

async function getPostForUser(postId: Section["id"], userId: User["id"]) {
  return await db.section.findUnique({
    where: {
      id: postId,
      userId,
    },
    include: {
      classes: {
        orderBy: {
          start: "asc",
        },
        select: {
          start: true,
          end: true,
          id: true,
          day: true,
          updatedAt: true,
          professor: {
            select: {
              name: true,
            },
          },
          subject: {
            select: {
              name: true,
            },
          },
        },
      },
      professorSections: {
        select: {
          professor: {
            select: {
              name: true,
              id: true,
            },
          },
          id: true,
          totalClasses: true,
        },
      },
      preferences: {
        select: {
          id: true,
          preference: true,
          professor: {
            select: {
              name: true,
              id: true,
            },
          },
          importance: true,
        },
      },
    },
  })
}

interface SectionPageProps {
  params: { sectionId: string }
}

export default async function SectionPage({ params }: SectionPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  const section = await getPostForUser(params.sectionId, user.id)

  if (!section) {
    notFound()
  }

  return (
    <DashboardInnerPage>
      <DashboardInnerPage.Title>{section.name}</DashboardInnerPage.Title>
      <DashboardInnerPage.Body>
        <DashboardInnerPage.Section>
          <DashboardInnerPage.SectionHeader
            title="Schedule"
            subtitle="All the classes, professors and subjects scheduled for this section"
          >
            {
              //TODO: Schedule Create Button
            }
          </DashboardInnerPage.SectionHeader>
          <ScheduleView classes={section.classes} />
        </DashboardInnerPage.Section>
        <DashboardInnerPage.Section>
          <DashboardInnerPage.SectionHeader
            title="Professors"
            subtitle="All the professors that teach in this class"
          >
            <ProfessorCreate />
          </DashboardInnerPage.SectionHeader>
          <ProfessorsInSectionView
            professorSection={section.professorSections}
          />
        </DashboardInnerPage.Section>
        <DashboardInnerPage.Section>
          <DashboardInnerPage.SectionHeader
            title="Preferences"
            subtitle="All the preferences of this section. Use them to create a schedule that fits your needs with our AI"
          >
            <PreferenceCreate from="section" sectionId={section.id} />
          </DashboardInnerPage.SectionHeader>
          <PreferencesView
            from="section"
            preferences={section.preferences}
            sectionId={section.id}
          />
        </DashboardInnerPage.Section>
      </DashboardInnerPage.Body>
    </DashboardInnerPage>
  )
}