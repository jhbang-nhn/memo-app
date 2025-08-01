import { createClient } from '@/lib/supabase/client'
import { Memo } from '@/types/memo'
import { v4 as uuidv4 } from 'uuid'

export const supabaseUtils = {
  // 모든 메모 가져오기
  getMemos: async (): Promise<Memo[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading memos from Supabase:', error)
        throw error
      }

      // Supabase의 snake_case를 camelCase로 변환
      return (data || []).map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags || [],
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error loading memos from Supabase:', error)
      return []
    }
  },

  // 메모 추가
  addMemo: async (memo: Memo): Promise<Memo | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memos')
        .insert([
          {
            id: memo.id,
            title: memo.title,
            content: memo.content,
            category: memo.category,
            tags: memo.tags,
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding memo to Supabase:', error)
        throw error
      }

      // Supabase의 snake_case를 camelCase로 변환
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error adding memo to Supabase:', error)
      return null
    }
  },

  // 메모 업데이트
  updateMemo: async (updatedMemo: Memo): Promise<Memo | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memos')
        .update({
          title: updatedMemo.title,
          content: updatedMemo.content,
          category: updatedMemo.category,
          tags: updatedMemo.tags,
        })
        .eq('id', updatedMemo.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating memo in Supabase:', error)
        throw error
      }

      // Supabase의 snake_case를 camelCase로 변환
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error updating memo in Supabase:', error)
      return null
    }
  },

  // 메모 삭제
  deleteMemo: async (id: string): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting memo from Supabase:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error deleting memo from Supabase:', error)
      return false
    }
  },

  // 메모 검색
  searchMemos: async (query: string): Promise<Memo[]> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching memos in Supabase:', error)
        throw error
      }

      // Supabase의 snake_case를 camelCase로 변환
      return (data || []).map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags || [],
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error searching memos in Supabase:', error)
      return []
    }
  },

  // 카테고리별 메모 필터링
  getMemosByCategory: async (category: string): Promise<Memo[]> => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })

      if (category !== 'all') {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error filtering memos by category in Supabase:', error)
        throw error
      }

      // Supabase의 snake_case를 camelCase로 변환
      return (data || []).map(memo => ({
        id: memo.id,
        title: memo.title,
        content: memo.content,
        category: memo.category,
        tags: memo.tags || [],
        createdAt: memo.created_at,
        updatedAt: memo.updated_at,
      }))
    } catch (error) {
      console.error('Error filtering memos by category in Supabase:', error)
      return []
    }
  },

  // 특정 메모 가져오기
  getMemoById: async (id: string): Promise<Memo | null> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 메모를 찾을 수 없음
          return null
        }
        console.error('Error getting memo by ID from Supabase:', error)
        throw error
      }

      // Supabase의 snake_case를 camelCase로 변환
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
    } catch (error) {
      console.error('Error getting memo by ID from Supabase:', error)
      return null
    }
  },

  // 모든 메모 삭제
  clearMemos: async (): Promise<boolean> => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 메모 삭제를 위한 조건

      if (error) {
        console.error('Error clearing all memos from Supabase:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Error clearing all memos from Supabase:', error)
      return false
    }
  },

  // 메모 개수 가져오기
  getMemosCount: async (): Promise<number> => {
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from('memos')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error getting memos count from Supabase:', error)
        throw error
      }

      return count || 0
    } catch (error) {
      console.error('Error getting memos count from Supabase:', error)
      return 0
    }
  },
}