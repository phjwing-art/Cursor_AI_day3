import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { relations } from 'drizzle-orm'
import { z } from 'zod'

export const notes = pgTable('notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').notNull(),
    title: text('title'),
    content: text('content'),
    created_at: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull()
})

export const insertNoteSchema = createInsertSchema(notes, {
    title: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내로 입력해주세요').nullable(),
    content: z.string().min(1, '내용을 입력해주세요').nullable()
})
export const selectNoteSchema = createSelectSchema(notes)
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert

export const summaries = pgTable('summaries', {
    id: uuid('id').defaultRandom().primaryKey(),
    note_id: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull()
})

export const insertSummarySchema = createInsertSchema(summaries, {
    content: z.string().min(1, '요약 내용을 입력해주세요')
})
export const selectSummarySchema = createSelectSchema(summaries)
export type Summary = typeof summaries.$inferSelect
export type NewSummary = typeof summaries.$inferInsert

// tags 테이블 스키마
export const tags = pgTable('tags', {
    id: uuid('id').defaultRandom().primaryKey(),
    note_id: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull()
})

// tags 테이블 Zod 스키마
export const insertTagSchema = createInsertSchema(tags, {
    name: z.string().min(1, '태그명을 입력해주세요').max(50, '태그명은 50자 이내로 입력해주세요')
})
export const selectTagSchema = createSelectSchema(tags)
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

// 관계 정의
export const notesRelations = relations(notes, ({ many }) => ({
    summaries: many(summaries),
    tags: many(tags)
}))

export const summariesRelations = relations(summaries, ({ one }) => ({
    note: one(notes, {
        fields: [summaries.note_id],
        references: [notes.id]
    })
}))

export const tagsRelations = relations(tags, ({ one }) => ({
    note: one(notes, {
        fields: [tags.note_id],
        references: [notes.id]
    })
}))