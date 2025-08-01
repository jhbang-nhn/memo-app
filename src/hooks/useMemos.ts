'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Memo, MemoFormData } from '@/types/memo'
import { supabaseUtils } from '@/utils/supabaseUtils'
import { seedSampleData } from '@/utils/seedData'

// Supabase용 샘플 데이터 시딩 함수
const seedSampleDataToSupabase = async (): Promise<void> => {
  // 기존 샘플 데이터 생성 (로컬스토리지 기반)
  seedSampleData()
  
  // 로컬스토리지에서 생성된 샘플 데이터를 가져와서 Supabase에 저장
  const { localStorageUtils } = await import('@/utils/localStorage')
  const sampleMemos = localStorageUtils.getMemos()
  
  // 각 메모를 Supabase에 저장
  for (const memo of sampleMemos) {
    await supabaseUtils.addMemo(memo)
  }
  
  // 로컬스토리지 정리
  localStorageUtils.clearMemos()
}

export const useMemos = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // 메모 로드
  useEffect(() => {
    const loadMemos = async () => {
      setLoading(true)
      try {
        const loadedMemos = await supabaseUtils.getMemos()
        setMemos(loadedMemos)
        
        // 첫 로드 시 메모가 없으면 샘플 데이터 시딩
        if (loadedMemos.length === 0) {
          await seedSampleDataToSupabase()
          const reloadedMemos = await supabaseUtils.getMemos()
          setMemos(reloadedMemos)
        }
      } catch (error) {
        console.error('Failed to load memos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemos()
  }, [])

  // 메모 생성
  const createMemo = useCallback(async (formData: MemoFormData): Promise<Memo | null> => {
    const newMemo: Memo = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const savedMemo = await supabaseUtils.addMemo(newMemo)
      if (savedMemo) {
        setMemos(prev => [savedMemo, ...prev])
        return savedMemo
      }
      return null
    } catch (error) {
      console.error('Failed to create memo:', error)
      return null
    }
  }, [])

  // 메모 업데이트
  const updateMemo = useCallback(
    async (id: string, formData: MemoFormData): Promise<boolean> => {
      const existingMemo = memos.find(memo => memo.id === id)
      if (!existingMemo) return false

      const updatedMemo: Memo = {
        ...existingMemo,
        ...formData,
        updatedAt: new Date().toISOString(),
      }

      try {
        const savedMemo = await supabaseUtils.updateMemo(updatedMemo)
        if (savedMemo) {
          setMemos(prev => prev.map(memo => (memo.id === id ? savedMemo : memo)))
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to update memo:', error)
        return false
      }
    },
    [memos]
  )

  // 메모 삭제
  const deleteMemo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseUtils.deleteMemo(id)
      if (success) {
        setMemos(prev => prev.filter(memo => memo.id !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete memo:', error)
      return false
    }
  }, [])

  // 메모 검색
  const searchMemos = useCallback((query: string): void => {
    setSearchQuery(query)
  }, [])

  // 카테고리 필터링
  const filterByCategory = useCallback((category: string): void => {
    setSelectedCategory(category)
  }, [])

  // 특정 메모 가져오기
  const getMemoById = useCallback(
    (id: string): Memo | undefined => {
      return memos.find(memo => memo.id === id)
    },
    [memos]
  )

  // 필터링된 메모 목록
  const filteredMemos = useMemo(() => {
    let filtered = memos

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory)
    }

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        memo =>
          memo.title.toLowerCase().includes(query) ||
          memo.content.toLowerCase().includes(query) ||
          memo.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [memos, selectedCategory, searchQuery])

  // 모든 메모 삭제
  const clearAllMemos = useCallback(async (): Promise<boolean> => {
    try {
      const success = await supabaseUtils.clearMemos()
      if (success) {
        setMemos([])
        setSearchQuery('')
        setSelectedCategory('all')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to clear all memos:', error)
      return false
    }
  }, [])

  // 통계 정보
  const stats = useMemo(() => {
    const totalMemos = memos.length
    const categoryCounts = memos.reduce(
      (acc, memo) => {
        acc[memo.category] = (acc[memo.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: totalMemos,
      byCategory: categoryCounts,
      filtered: filteredMemos.length,
    }
  }, [memos, filteredMemos])

  return {
    // 상태
    memos: filteredMemos,
    allMemos: memos,
    loading,
    searchQuery,
    selectedCategory,
    stats,

    // 메모 CRUD
    createMemo,
    updateMemo,
    deleteMemo,
    getMemoById,

    // 필터링 & 검색
    searchMemos,
    filterByCategory,

    // 유틸리티
    clearAllMemos,
  }
}
